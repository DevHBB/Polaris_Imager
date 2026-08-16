import { deflateRawSync, inflateRawSync } from 'zlib';
import { createCanvas, loadImage } from 'canvas';
import { encodeFrames } from './apng.mjs';
import { parseAvatarParams } from './params.mjs';
import { CONFIG } from './config.mjs';

export class SceneError extends Error {}

const num = (value, fallback, min, max) => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) return fallback;

    return Math.min(Math.max(parsed, min), max);
};

const hex = (value, fallback) => {
    const clean = String(value ?? '').trim().replace(/^#/, '');

    return /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(clean) ? `#${ clean }` : fallback;
};

const text = (value, max) => String(value ?? '')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ')
    .slice(0, max);

export const encodeScene = (scene) => deflateRawSync(Buffer.from(JSON.stringify(scene), 'utf8'), { level: 9 })
    .toString('base64url');

export const decodeScene = (encoded) => {
    const raw = String(encoded || '');

    if (!raw) throw new SceneError('Missing scene data.');
    if (raw.length > CONFIG.scene.maxPayload) throw new SceneError('Scene data too large.');

    let json;

    try {
        json = inflateRawSync(Buffer.from(raw, 'base64url')).toString('utf8');
    } catch {
        try {
            json = Buffer.from(raw, 'base64url').toString('utf8');
        } catch {
            throw new SceneError('Scene data is not readable.');
        }
    }

    let parsed;

    try {
        parsed = JSON.parse(json);
    } catch {
        throw new SceneError('Scene data is not valid JSON.');
    }

    return normalizeScene(parsed);
};

const hostAllowed = (url) => {
    if (!CONFIG.scene.imageHosts.length) return false;

    let parsed;

    try {
        parsed = new URL(url);
    } catch {
        return false;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

    return CONFIG.scene.imageHosts.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${ host }`));
};

const normalizeLayer = (layer) => {
    const base = {
        x: num(layer.x, 0, -4000, 4000),
        y: num(layer.y, 0, -4000, 4000),
        s: num(layer.s, 100, 10, 800),
        f: layer.f ? 1 : 0,
        o: num(layer.o, 100, 0, 100)
    };

    if (layer.t === 'i') {
        const url = String(layer.u || '');

        if (!hostAllowed(url)) throw new SceneError('Image host not allowed.');

        return { ...base, t: 'i', u: url };
    }

    if (layer.t === 't') {
        return {
            ...base,
            t: 't',
            v: text(layer.v, 200),
            c: hex(layer.c, '#000000'),
            fs: num(layer.fs, 20, 8, 160),
            b: layer.b ? 1 : 0
        };
    }

    const figure = String(layer.figure || '');

    if (!/^[A-Za-z0-9._-]+$/.test(figure) || figure.length > CONFIG.maxFigureLength) {
        throw new SceneError('Invalid figure in a layer.');
    }

    return {
        ...base,
        t: 'a',
        figure,
        action: String(layer.action || '').slice(0, CONFIG.maxActionLength),
        gesture: String(layer.gesture || 'std').slice(0, 8),
        direction: num(layer.direction, 2, 0, 7),
        head_direction: num(layer.head_direction, 2, 0, 7),
        headonly: layer.headonly ? 1 : 0,
        effect: num(layer.effect, 0, 0, 5000),
        dance: num(layer.dance, 0, 0, 4),
        size: ['s', 'n', 'l'].includes(layer.size) ? layer.size : 'n',
        frame_num: num(layer.frame_num, 0, 0, 60),
        text: text(layer.text, CONFIG.maxTextLength),
        text_color: hex(layer.text_color, '#000000').slice(1),
        bubble_color: hex(layer.bubble_color, '#ffffff').slice(1)
    };
};

export const normalizeScene = (scene) => {
    if (!scene || typeof scene !== 'object') throw new SceneError('Scene data is not an object.');

    const layers = Array.isArray(scene.l) ? scene.l : [];

    if (!layers.length) throw new SceneError('Scene has no layers.');
    if (layers.length > CONFIG.scene.maxLayers) throw new SceneError(`Scene has more than ${ CONFIG.scene.maxLayers } layers.`);

    const background = scene.bg && typeof scene.bg === 'object' ? scene.bg : {};
    const backgroundUrl = background.i ? String(background.i) : '';

    if (backgroundUrl && !hostAllowed(backgroundUrl)) throw new SceneError('Background image host not allowed.');

    return {
        w: num(scene.w, 600, 32, CONFIG.scene.maxSize),
        h: num(scene.h, 400, 32, CONFIG.scene.maxSize),
        bg: {
            c: background.c ? hex(background.c, '#ffffff') : null,
            i: backgroundUrl || null,
            m: ['cover', 'contain', 'stretch', 'tile'].includes(background.m) ? background.m : 'cover'
        },
        l: layers.map(normalizeLayer)
    };
};

const renderAvatarLayer = async (renderer, layer) => {
    const descriptor = parseAvatarParams(
        {
            figure: layer.figure,
            action: layer.action || undefined,
            gesture: layer.gesture,
            direction: layer.direction,
            head_direction: layer.head_direction,
            headonly: layer.headonly,
            effect: layer.effect || undefined,
            dance: layer.dance || undefined,
            size: layer.size,
            frame_num: layer.frame_num,
            img_format: 'png',
            text: layer.text || undefined,
            text_color: layer.text_color,
            bubble_color: layer.bubble_color
        },
        {
            defaultFigure: null,
            maxFigureLength: CONFIG.maxFigureLength,
            maxActionLength: CONFIG.maxActionLength,
            maxTextLength: CONFIG.maxTextLength
        }
    );

    const rendered = await renderer.render(descriptor);

    if (!rendered?.frames?.length) throw new SceneError('The renderer produced no frames for a layer.');

    return encodeFrames({
        frames: [Buffer.from(rendered.frames[0], 'base64')],
        width: rendered.width,
        height: rendered.height,
        delays: [0],
        postScale: descriptor.postScale
    });
};

const fetchImage = async (url) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.scene.imageTimeoutMs);

    try {
        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) throw new SceneError(`Image returned HTTP ${ response.status }.`);

        const type = response.headers.get('content-type') || '';

        if (!type.startsWith('image/')) throw new SceneError('That URL is not an image.');

        const buffer = Buffer.from(await response.arrayBuffer());

        if (buffer.length > CONFIG.scene.maxImageBytes) throw new SceneError('Image is too large.');

        return await loadImage(buffer);
    } catch (error) {
        if (error instanceof SceneError) throw error;

        throw new SceneError('Could not load an image layer.');
    } finally {
        clearTimeout(timer);
    }
};

const drawBackground = async (ctx, scene) => {
    if (scene.bg.c) {
        ctx.fillStyle = scene.bg.c;
        ctx.fillRect(0, 0, scene.w, scene.h);
    }

    if (!scene.bg.i) return;

    const image = await fetchImage(scene.bg.i);

    if (scene.bg.m === 'stretch') {
        ctx.drawImage(image, 0, 0, scene.w, scene.h);

        return;
    }

    if (scene.bg.m === 'tile') {
        for (let y = 0; y < scene.h; y += image.height) {
            for (let x = 0; x < scene.w; x += image.width) ctx.drawImage(image, x, y);
        }

        return;
    }

    const ratio = scene.bg.m === 'contain'
        ? Math.min(scene.w / image.width, scene.h / image.height)
        : Math.max(scene.w / image.width, scene.h / image.height);
    const width = image.width * ratio;
    const height = image.height * ratio;

    ctx.drawImage(image, (scene.w - width) / 2, (scene.h - height) / 2, width, height);
};

const drawLayer = (ctx, layer, drawable) => {
    ctx.save();
    ctx.globalAlpha = layer.o / 100;
    ctx.translate(layer.x, layer.y);

    const scale = layer.s / 100;

    if (layer.t === 't') {
        ctx.scale(scale, scale);

        if (layer.f) ctx.scale(-1, 1);

        ctx.font = `${ layer.b ? 'bold ' : '' }${ layer.fs }px sans-serif`;
        ctx.fillStyle = layer.c;
        ctx.textBaseline = 'top';

        layer.v.split('\n').forEach((line, index) => ctx.fillText(line, 0, index * layer.fs * 1.25));
        ctx.restore();

        return;
    }

    const width = drawable.width * scale;
    const height = drawable.height * scale;

    if (layer.f) {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(drawable, 0, 0, width, height);
    ctx.restore();
};

export const renderScene = async (scene, renderer) => {
    const canvas = createCanvas(scene.w, scene.h);
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = false;

    await drawBackground(ctx, scene);

    for (const layer of scene.l) {
        if (layer.t === 't') {
            drawLayer(ctx, layer, null);

            continue;
        }

        const drawable = layer.t === 'i'
            ? await fetchImage(layer.u)
            : await loadImage(await renderAvatarLayer(renderer, layer));

        drawLayer(ctx, layer, drawable);
    }

    return canvas.toBuffer('image/png');
};
