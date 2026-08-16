import { WARDROBE_CSS, WARDROBE_JS } from './wardrobe-widget.mjs';

const esc = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const js = (value) => JSON.stringify(value ?? null).replace(/</g, '\\u003c');

export const renderScenePage = ({
    imagerUrl = '/avatarimage',
    sceneUrl = '/scene',
    base = '/Generate',
    lookupEnabled = false,
    searchEnabled = false,
    wardrobeEnabled = true,
    logoutEnabled = false,
    imageHosts = [],
    apiKey = '',
    token = '',
    title = 'Avatar Studio',
    figure = '',
    maxLayers = 24
} = {}) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${ esc(title) } — Scene</title>
<style>
:root{
  --bg:#f4f8fc; --panel:#ffffff; --panel2:#f7fafd; --line:#e2ebf4;
  --text:#16212f; --muted:#69798e; --sky:#2f9bf0; --sky-dark:#1a7fd0;
  --sky-soft:#e8f4fe; --ok:#0f9b5c; --err:#d63b46;
  --mono:ui-monospace,"SFMono-Regular","JetBrains Mono",Menlo,Consolas,monospace;
  --body:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --r:12px;
  --shadow:0 1px 2px rgba(20,40,70,.05), 0 10px 26px -18px rgba(20,40,70,.35);
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--bg); color:var(--text); font-family:var(--body); font-size:14px; line-height:1.5;
  -webkit-font-smoothing:antialiased;
  background-image:radial-gradient(circle at 12% -8%,rgba(47,155,240,.10),transparent 42%),
                   radial-gradient(circle at 95% 2%,rgba(47,155,240,.07),transparent 38%);
  background-attachment:fixed}
a{color:var(--sky-dark)}
.top{border-bottom:1px solid var(--line); background:rgba(255,255,255,.88); backdrop-filter:blur(8px);
  position:sticky; top:0; z-index:20}
.topIn{max-width:1500px; margin:0 auto; padding:14px 22px; display:flex; align-items:center; gap:12px}
.brand{font-family:var(--mono); font-size:13px; font-weight:700; letter-spacing:.18em; text-transform:uppercase}
.brand b{color:var(--sky)}
.spacer{margin-left:auto}
.wrap{max-width:1500px; margin:0 auto; padding:22px}
.grid{display:grid; grid-template-columns:250px minmax(0,1fr) 320px; gap:18px; align-items:start}
@media(max-width:1240px){.grid{grid-template-columns:1fr}}
.card{background:var(--panel); border:1px solid var(--line); border-radius:var(--r); padding:16px;
  margin-bottom:16px; box-shadow:var(--shadow)}
.card h2{font-family:var(--mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase;
  color:var(--muted); margin:0 0 12px; font-weight:700}
.stageWrap{background:var(--panel); border:1px solid var(--line); border-radius:var(--r); padding:16px;
  box-shadow:var(--shadow)}
.stageScroll{overflow:auto; display:flex; justify-content:center; padding:8px; border-radius:9px;
  background:repeating-conic-gradient(#eef4fa 0 25%, #ffffff 0 50%) 50%/18px 18px}
.stage{position:relative; flex:none; overflow:hidden; outline:1px solid var(--line)}
.stage .lyr{position:absolute; transform-origin:top left; cursor:grab; user-select:none; touch-action:none}
.stage .lyr.sel{outline:2px dashed var(--sky); outline-offset:2px}
.stage .lyr.dragging{cursor:grabbing}
.stage .lyr img{display:block; image-rendering:pixelated; pointer-events:none}
.stage .lyr .txt{white-space:pre; pointer-events:none}
.field{margin-bottom:12px}
.field>label{display:block; font-family:var(--mono); font-size:10.5px; letter-spacing:.13em;
  text-transform:uppercase; color:var(--muted); font-weight:700; margin-bottom:6px}
.field small{display:block; color:#8494a8; font-size:11.5px; margin-top:5px}
.row{display:grid; grid-template-columns:1fr 1fr; gap:12px}
input[type=text],input[type=number],select,textarea{width:100%; background:#fff; color:var(--text);
  border:1px solid #d9e4ef; border-radius:9px; padding:9px 11px; font-size:13px; font-family:var(--body);
  outline:none; transition:border-color .15s, box-shadow .15s}
textarea{resize:vertical; min-height:64px; font-family:var(--body)}
input[type=text]{font-family:var(--mono); font-size:12px}
input:hover,select:hover,textarea:hover{border-color:#bed3e7}
input:focus-visible,select:focus-visible,textarea:focus-visible{border-color:var(--sky);
  box-shadow:0 0 0 3px rgba(47,155,240,.22)}
input::placeholder,textarea::placeholder{color:#a9b8c9}
select{appearance:none; background-image:linear-gradient(45deg,transparent 50%,var(--muted) 50%),
  linear-gradient(135deg,var(--muted) 50%,transparent 50%);
  background-position:calc(100% - 16px) 50%,calc(100% - 11px) 50%;
  background-size:5px 5px,5px 5px; background-repeat:no-repeat; padding-right:32px}
input[type=color]{width:100%; height:38px; padding:3px; background:#fff; border:1px solid #d9e4ef;
  border-radius:9px; cursor:pointer}
input[type=range]{width:100%; accent-color:var(--sky)}
.btn{display:inline-flex; align-items:center; justify-content:center; gap:6px; cursor:pointer;
  border:1px solid #d9e4ef; background:#fff; color:var(--text); border-radius:9px; padding:9px 13px;
  font-size:12.5px; font-weight:600; font-family:var(--body); text-decoration:none;
  transition:border-color .15s, background .15s, color .15s}
.btn:hover{border-color:var(--sky); color:var(--sky-dark); background:var(--sky-soft)}
.btn.sm{padding:6px 10px; font-size:12px}
.btn-primary{background:var(--sky); border-color:var(--sky); color:#fff; font-weight:700}
.btn-primary:hover{background:var(--sky-dark); border-color:var(--sky-dark); color:#fff}
.btn-block{display:flex; width:100%}
.btnRow{display:flex; gap:8px; flex-wrap:wrap}
.btnRow .btn{flex:1; min-width:110px}
.add{display:flex; width:100%; align-items:center; justify-content:center; gap:8px; cursor:pointer;
  border:1px dashed #b9d3ea; background:var(--panel2); color:var(--sky-dark); border-radius:10px;
  padding:12px; font-size:13px; font-weight:700; font-family:var(--body); transition:background .15s, border-color .15s}
.add:hover{background:var(--sky-soft); border-color:var(--sky)}
.add .plus{font-size:19px; line-height:1}
.layers{display:flex; flex-direction:column; gap:6px; margin-bottom:12px}
.lrow{display:flex; align-items:center; gap:8px; border:1px solid var(--line); border-radius:9px;
  padding:7px 9px; background:#fff; cursor:pointer}
.lrow:hover{border-color:#b6d3ee}
.lrow.on{border-color:var(--sky); background:var(--sky-soft)}
.lrow .ico{width:22px; height:22px; flex:none; border-radius:5px; background:var(--panel2);
  display:flex; align-items:center; justify-content:center; font-size:11px; color:var(--muted);
  overflow:hidden; border:1px solid var(--line)}
.lrow .ico img{width:100%; height:100%; object-fit:contain; image-rendering:pixelated}
.lrow .nm{flex:1; font-size:12.5px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
.lrow .zz{border:0; background:none; cursor:pointer; color:var(--muted); font-size:13px; padding:2px 4px;
  border-radius:5px; line-height:1}
.lrow .zz:hover{background:#fff; color:var(--sky-dark)}
.chips{display:flex; flex-wrap:wrap; gap:6px}
.chip{border:1px solid #d9e4ef; background:#fff; color:var(--text); border-radius:999px; padding:6px 12px;
  font-size:12px; font-weight:600; cursor:pointer; font-family:var(--body)}
.chip:hover{border-color:#b6d3ee; background:var(--panel2)}
.chip.on{border-color:var(--sky); background:var(--sky-soft); color:var(--sky-dark)}
.dirs{display:grid; grid-template-columns:repeat(8,1fr); gap:4px}
.dirBtn{border:1px solid #dde8f2; background:#fff; border-radius:7px; cursor:pointer; padding:5px 0;
  font-family:var(--mono); font-size:11px; color:var(--muted)}
.dirBtn:hover{border-color:#b6d3ee}
.dirBtn.on{border-color:var(--sky); background:var(--sky-soft); color:var(--sky-dark); font-weight:700}
.msg{margin-top:10px; font-size:12.5px; min-height:18px}
.msg .ok{color:var(--ok); font-weight:600}
.msg .err{color:var(--err)}
.msg .wait{color:var(--muted)}
.hint{color:var(--muted); font-size:12px}
.inline{display:flex; gap:8px}
.inline input{flex:1}
.sugList{margin-top:6px; border:1px solid var(--line); border-radius:9px; background:#fff; overflow:hidden;
  max-height:220px; overflow-y:auto; box-shadow:var(--shadow)}
.sug{display:flex; align-items:center; gap:9px; width:100%; text-align:left; cursor:pointer; background:none;
  border:0; border-bottom:1px solid var(--line); padding:5px 9px; color:var(--text); font-family:var(--body);
  font-size:12.5px}
.sug:last-child{border-bottom:0}
.sug:hover{background:var(--sky-soft)}
.sug img{width:26px; height:26px; object-fit:contain; image-rendering:pixelated; flex:none}
.urlBox{background:var(--panel2); border:1px solid var(--line); border-radius:9px; padding:10px 11px;
  font-family:var(--mono); font-size:10.5px; line-height:1.6; color:#3d5a78; word-break:break-all;
  max-height:110px; overflow:auto; margin-top:10px}
.langSel{width:auto; padding:7px 30px 7px 11px; font-size:12.5px}
.empty{color:var(--muted); font-size:12.5px; padding:6px 0}
${ WARDROBE_CSS }
@media (prefers-reduced-motion:reduce){*{animation:none!important; transition:none!important}}
</style>
</head>
<body>

<header class="top">
  <div class="topIn">
    <div class="brand"><b>&#9632;</b> ${ esc(title) }</div>
    <a class="btn sm" href="${ esc(base) }" data-i18n="backToPanel">Back to panel</a>
    <div class="spacer"></div>
    ${ logoutEnabled
        ? `<a class="btn sm" href="${ esc(base) }/logout" data-i18n="logout">Sign out</a>`
        : '' }
    <select id="langSel" class="langSel" aria-label="Language">
      <option value="en">English</option>
      <option value="nl">Nederlands</option>
      <option value="es">Espa&ntilde;ol</option>
      <option value="fr">Fran&ccedil;ais</option>
      <option value="de">Deutsch</option>
    </select>
  </div>
</header>

<div class="wrap">
<div class="grid">

  <div>
    <div class="card">
      <h2 data-i18n="layers">Layers</h2>
      <div class="layers" id="layerList"></div>
      <button type="button" class="add" id="addAvatar"><span class="plus">+</span><span data-i18n="addAvatar">Add a character</span></button>
      <div class="btnRow" style="margin-top:8px">
        <button type="button" class="btn sm" id="addImage" data-i18n="addImage">Image</button>
        <button type="button" class="btn sm" id="addText" data-i18n="addText">Text</button>
      </div>
    </div>

    <div class="card">
      <h2 data-i18n="canvas">Canvas</h2>
      <div class="row">
        <div class="field"><label for="cvW" data-i18n="width">Width</label>
          <input type="number" id="cvW" value="700" min="32" max="${ maxLayers > 0 ? 2000 : 2000 }"></div>
        <div class="field"><label for="cvH" data-i18n="height">Height</label>
          <input type="number" id="cvH" value="420" min="32" max="2000"></div>
      </div>
      <div class="field">
        <label for="bgMode" data-i18n="background">Background</label>
        <select id="bgMode">
          <option value="none" data-i18n="bgNone">Transparent</option>
          <option value="color" data-i18n="bgColor">Solid colour</option>
          <option value="image" data-i18n="bgImage">Image</option>
        </select>
      </div>
      <div class="field" id="bgColorField" style="display:none">
        <label for="bgColor" data-i18n="colour">Colour</label>
        <input type="color" id="bgColor" value="#ffffff">
      </div>
      <div id="bgImageField" style="display:none">
        <div class="field">
          <label for="bgUrl" data-i18n="imageUrl">Image URL</label>
          <input type="text" id="bgUrl" placeholder="https://…">
        </div>
        <div class="field" style="margin-bottom:0">
          <label for="bgFit" data-i18n="fit">Fit</label>
          <select id="bgFit">
            <option value="cover" data-i18n="fitCover">Cover</option>
            <option value="contain" data-i18n="fitContain">Contain</option>
            <option value="stretch" data-i18n="fitStretch">Stretch</option>
            <option value="tile" data-i18n="fitTile">Tile</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <div>
    <div class="stageWrap">
      <div class="stageScroll"><div class="stage" id="stage"></div></div>
      <div class="btnRow" style="margin-top:14px">
        <button type="button" class="btn btn-primary" id="dlPng" data-i18n="downloadPng">Download PNG</button>
        <button type="button" class="btn" id="copyScene" data-i18n="copySceneUrl">Copy scene URL</button>
        <a class="btn" id="openScene" target="_blank" rel="noopener" data-i18n="openServer">Server render</a>
      </div>
      <div class="urlBox" id="sceneUrlBox">—</div>
      <div class="msg" id="msg"></div>
    </div>
  </div>

  <div>
    <div class="card" id="props">
      <h2 data-i18n="properties">Properties</h2>
      <div class="empty" id="noSel" data-i18n="selectLayer">Select a layer, or add a character.</div>
      <div id="propBody" style="display:none">

        <div class="row">
          <div class="field"><label for="pX">X</label><input type="number" id="pX" value="0"></div>
          <div class="field"><label for="pY">Y</label><input type="number" id="pY" value="0"></div>
        </div>
        <div class="field">
          <label for="pS"><span data-i18n="scale">Scale</span> <span id="pSVal" class="hint">100%</span></label>
          <input type="range" id="pS" min="10" max="400" value="100">
        </div>
        <div class="field">
          <label for="pO"><span data-i18n="opacity">Opacity</span> <span id="pOVal" class="hint">100%</span></label>
          <input type="range" id="pO" min="0" max="100" value="100">
        </div>
        <div class="btnRow" style="margin-bottom:14px">
          <button type="button" class="btn sm" id="pFlip" data-i18n="flip">Flip</button>
          <button type="button" class="btn sm" id="pDup" data-i18n="duplicate">Duplicate</button>
          <button type="button" class="btn sm" id="pDel" data-i18n="delete">Delete</button>
        </div>

        <div id="avatarProps">
          <div class="field" id="userField" style="display:none">
            <label for="fUser" data-i18n="playerName">Player name</label>
            <div class="inline">
              <input type="text" id="fUser" placeholder="Username…" data-i18n-ph="usernamePh" autocomplete="off" spellcheck="false">
              <button type="button" class="btn" id="fetchLook" data-i18n="load">Load</button>
            </div>
            <div class="sugList" id="sugList" style="display:none"></div>
          </div>
          <div class="field">
            <label for="pFigure" data-i18n="figure">Figure</label>
            <input type="text" id="pFigure" spellcheck="false" autocomplete="off">
          </div>
          ${ wardrobeEnabled
              ? '<button type="button" class="btn btn-block" id="openWardrobe" style="margin-bottom:14px" data-i18n="openWardrobe">Change clothes</button>'
              : '' }
          <div class="field">
            <label data-i18n="bodyDir">Body direction</label>
            <div class="dirs" id="pDirs"></div>
          </div>
          <div class="field">
            <label data-i18n="headDir">Head direction</label>
            <div class="dirs" id="pHeadDirs"></div>
          </div>
          <div class="field">
            <label data-i18n="action">Action</label>
            <div class="chips" id="pActs">
              <button type="button" class="chip on" data-act="" data-i18n="none">None</button>
              <button type="button" class="chip" data-act="wlk" data-i18n="walk">Walk</button>
              <button type="button" class="chip" data-act="sit" data-i18n="sit">Sit</button>
              <button type="button" class="chip" data-act="lay" data-i18n="lay">Lie down</button>
              <button type="button" class="chip" data-act="wav" data-i18n="wave">Wave</button>
              <button type="button" class="chip" data-act="drk=1" data-i18n="drink">Drink</button>
              <button type="button" class="chip" data-act="crr=1" data-i18n="carry">Carry</button>
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label for="pGesture" data-i18n="expression">Expression</label>
              <select id="pGesture">
                <option value="std" data-i18n="gestureNormal">Normal</option>
                <option value="sml" data-i18n="gestureSmile">Smile</option>
                <option value="sad" data-i18n="gestureSad">Sad</option>
                <option value="agr" data-i18n="gestureAngry">Angry</option>
                <option value="srp" data-i18n="gestureSurprised">Surprised</option>
              </select>
            </div>
            <div class="field">
              <label for="pSize" data-i18n="size">Size</label>
              <select id="pSize">
                <option value="s" data-i18n="sizeSmall">Small</option>
                <option value="n" selected data-i18n="sizeNormal">Normal</option>
                <option value="l" data-i18n="sizeLarge">Large</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label for="pEffect" data-i18n="effect">Effect</label>
              <input type="number" id="pEffect" value="0" min="0" max="5000">
            </div>
            <div class="field">
              <label for="pCrop" data-i18n="crop">Crop</label>
              <select id="pCrop">
                <option value="0" data-i18n="fullBody">Full body</option>
                <option value="1" data-i18n="headOnly">Head only</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label for="pText" data-i18n="message">Message</label>
            <input type="text" id="pText" maxlength="100" placeholder="" data-i18n-ph="msgPh">
          </div>
          <div class="row" style="margin-bottom:0">
            <div class="field" style="margin-bottom:0">
              <label for="pTextColor" data-i18n="textColor">Text colour</label>
              <input type="color" id="pTextColor" value="#000000">
            </div>
            <div class="field" style="margin-bottom:0">
              <label for="pBubbleColor" data-i18n="bubbleColor">Bubble colour</label>
              <input type="color" id="pBubbleColor" value="#ffffff">
            </div>
          </div>
        </div>

        <div id="imageProps" style="display:none">
          <div class="field" style="margin-bottom:0">
            <label for="pUrl" data-i18n="imageUrl">Image URL</label>
            <input type="text" id="pUrl" placeholder="https://…">
            <small id="hostHint"></small>
          </div>
        </div>

        <div id="textProps" style="display:none">
          <div class="field">
            <label for="pTxt" data-i18n="text">Text</label>
            <textarea id="pTxt"></textarea>
          </div>
          <div class="row" style="margin-bottom:0">
            <div class="field" style="margin-bottom:0">
              <label for="pFs" data-i18n="fontSize">Font size</label>
              <input type="number" id="pFs" value="22" min="8" max="160">
            </div>
            <div class="field" style="margin-bottom:0">
              <label for="pTc" data-i18n="colour">Colour</label>
              <input type="color" id="pTc" value="#16212f">
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

</div>
</div>

<script>
(function () {
  'use strict';

  var IMAGER = ${ js(imagerUrl) };
  var SCENE_URL = ${ js(sceneUrl) };
  var BASE = ${ js(base) };
  var LOOKUP = ${ js(lookupEnabled) };
  var SEARCH = ${ js(searchEnabled) };
  var WARDROBE = ${ js(wardrobeEnabled) };
  var API_KEY = ${ js(apiKey) };
  var TOKEN = ${ js(token) };
  var HOSTS = ${ js(imageHosts) };
  var MAX_LAYERS = ${ js(maxLayers) };
  var START_FIGURE = ${ js(figure) };

  var $ = function (id) { return document.getElementById(id); };
  var val = function (id) { var e = $(id); return e ? e.value : ''; };

  var I18N = {
    en: {
      layers: 'Layers', addAvatar: 'Add a character', addImage: 'Image', addText: 'Text',
      canvas: 'Canvas', width: 'Width', height: 'Height', background: 'Background',
      bgNone: 'Transparent', bgColor: 'Solid colour', bgImage: 'Image', colour: 'Colour',
      imageUrl: 'Image URL', fit: 'Fit', fitCover: 'Cover', fitContain: 'Contain',
      fitStretch: 'Stretch', fitTile: 'Tile',
      downloadPng: 'Download PNG', copySceneUrl: 'Copy scene URL', openServer: 'Server render',
      properties: 'Properties', selectLayer: 'Select a layer, or add a character.',
      scale: 'Scale', opacity: 'Opacity', flip: 'Flip', duplicate: 'Duplicate', delete: 'Delete',
      figure: 'Figure', openWardrobe: 'Change clothes', bodyDir: 'Body direction', headDir: 'Head direction',
      action: 'Action', none: 'None', walk: 'Walk', sit: 'Sit', lay: 'Lie down', wave: 'Wave',
      drink: 'Drink', carry: 'Carry', expression: 'Expression', gestureNormal: 'Normal',
      gestureSmile: 'Smile', gestureSad: 'Sad', gestureAngry: 'Angry', gestureSurprised: 'Surprised',
      size: 'Size', sizeSmall: 'Small', sizeNormal: 'Normal', sizeLarge: 'Large',
      effect: 'Effect', crop: 'Crop', fullBody: 'Full body', headOnly: 'Head only',
      message: 'Message', msgPh: 'Leave empty for no bubble', textColor: 'Text colour',
      bubbleColor: 'Bubble colour', text: 'Text', fontSize: 'Font size',
      playerName: 'Player name', usernamePh: 'Username…', load: 'Load',
      backToPanel: 'Back to panel', logout: 'Sign out',
      character: 'Character', image: 'Image',
      copied: 'Copied!', linkCopied: 'Link copied!',
      copyDenied: 'Copy blocked by the browser (HTTPS required).',
      searching: 'Looking up {name}…', loaded: "Loaded {name}'s outfit.",
      notFound: 'Player not found.', lookupDown: 'Lookup unavailable.',
      maxLayers: 'Limit reached: {n} layers maximum.',
      taintedCanvas: 'The browser blocked the export because of an external image. Use the server render instead.',
      hostsHint: 'Server render allows: {hosts}', hostsNone: 'Server render allows no external image (nothing configured).',
      emptyScene: 'No layer yet.', exported: 'Image downloaded.',
      wardrobe: 'Wardrobe', close: 'Close', showHc: 'Show HC', removeItem: 'Remove',
      genderAll: 'All', genderMale: 'Male', genderFemale: 'Female',
      noItems: 'Nothing here with these filters.', loading: 'Loading…',
      wardrobeDown: 'Wardrobe unavailable.',
      cat_hd: 'Face', cat_hr: 'Hair', cat_ha: 'Hat', cat_he: 'Head accessory', cat_ea: 'Glasses',
      cat_fa: 'Face accessory', cat_ch: 'Shirt', cat_cc: 'Coat', cat_cp: 'Print', cat_ca: 'Chest accessory',
      cat_wa: 'Belt', cat_lg: 'Trousers', cat_sh: 'Shoes'
    },
    nl: {
      layers: 'Lagen', addAvatar: 'Personage toevoegen', addImage: 'Afbeelding', addText: 'Tekst',
      canvas: 'Canvas', width: 'Breedte', height: 'Hoogte', background: 'Achtergrond',
      bgNone: 'Transparant', bgColor: 'Effen kleur', bgImage: 'Afbeelding', colour: 'Kleur',
      imageUrl: 'Afbeeldings-URL', fit: 'Passend', fitCover: 'Vullen', fitContain: 'Passen',
      fitStretch: 'Uitrekken', fitTile: 'Herhalen',
      downloadPng: 'PNG downloaden', copySceneUrl: 'Scène-URL kopiëren', openServer: 'Serverrender',
      properties: 'Eigenschappen', selectLayer: 'Kies een laag of voeg een personage toe.',
      scale: 'Schaal', opacity: 'Dekking', flip: 'Spiegelen', duplicate: 'Dupliceren', delete: 'Verwijderen',
      figure: 'Figuur', openWardrobe: 'Kleding wijzigen', bodyDir: 'Richting lichaam', headDir: 'Richting hoofd',
      action: 'Actie', none: 'Geen', walk: 'Lopen', sit: 'Zitten', lay: 'Liggen', wave: 'Zwaaien',
      drink: 'Drinken', carry: 'Vasthouden', expression: 'Expressie', gestureNormal: 'Normaal',
      gestureSmile: 'Lachen', gestureSad: 'Verdrietig', gestureAngry: 'Boos', gestureSurprised: 'Verrast',
      size: 'Grootte', sizeSmall: 'Klein', sizeNormal: 'Normaal', sizeLarge: 'Groot',
      effect: 'Effect', crop: 'Kader', fullBody: 'Volledig lichaam', headOnly: 'Alleen hoofd',
      message: 'Bericht', msgPh: 'Leeg laten voor geen ballon', textColor: 'Tekstkleur',
      bubbleColor: 'Ballonkleur', text: 'Tekst', fontSize: 'Tekengrootte',
      playerName: 'Spelersnaam', usernamePh: 'Spelersnaam…', load: 'Laden',
      backToPanel: 'Terug naar paneel', logout: 'Uitloggen',
      character: 'Personage', image: 'Afbeelding',
      copied: 'Gekopieerd!', linkCopied: 'Link gekopieerd!',
      copyDenied: 'Kopiëren geblokkeerd door de browser (HTTPS vereist).',
      searching: 'Zoeken naar {name}…', loaded: 'Outfit van {name} geladen.',
      notFound: 'Speler niet gevonden.', lookupDown: 'Zoeken niet beschikbaar.',
      maxLayers: 'Limiet bereikt: maximaal {n} lagen.',
      taintedCanvas: 'De browser blokkeerde de export vanwege een externe afbeelding. Gebruik de serverrender.',
      hostsHint: 'Serverrender staat toe: {hosts}', hostsNone: 'Serverrender staat geen externe afbeelding toe (niets ingesteld).',
      emptyScene: 'Nog geen laag.', exported: 'Afbeelding gedownload.',
      wardrobe: 'Kledingkast', close: 'Sluiten', showHc: 'HC tonen', removeItem: 'Verwijderen',
      genderAll: 'Alle', genderMale: 'Man', genderFemale: 'Vrouw',
      noItems: 'Niets met deze filters.', loading: 'Laden…',
      wardrobeDown: 'Kledingkast niet beschikbaar.',
      cat_hd: 'Gezicht', cat_hr: 'Haar', cat_ha: 'Hoed', cat_he: 'Hoofdaccessoire', cat_ea: 'Bril',
      cat_fa: 'Gezichtsaccessoire', cat_ch: 'Shirt', cat_cc: 'Jas', cat_cp: 'Print', cat_ca: 'Borstaccessoire',
      cat_wa: 'Riem', cat_lg: 'Broek', cat_sh: 'Schoenen'
    },
    es: {
      layers: 'Capas', addAvatar: 'Añadir un personaje', addImage: 'Imagen', addText: 'Texto',
      canvas: 'Lienzo', width: 'Ancho', height: 'Alto', background: 'Fondo',
      bgNone: 'Transparente', bgColor: 'Color sólido', bgImage: 'Imagen', colour: 'Color',
      imageUrl: 'URL de la imagen', fit: 'Ajuste', fitCover: 'Cubrir', fitContain: 'Contener',
      fitStretch: 'Estirar', fitTile: 'Mosaico',
      downloadPng: 'Descargar PNG', copySceneUrl: 'Copiar URL de la escena', openServer: 'Render del servidor',
      properties: 'Propiedades', selectLayer: 'Elige una capa o añade un personaje.',
      scale: 'Escala', opacity: 'Opacidad', flip: 'Voltear', duplicate: 'Duplicar', delete: 'Eliminar',
      figure: 'Figura', openWardrobe: 'Cambiar de ropa', bodyDir: 'Dirección del cuerpo', headDir: 'Dirección de la cabeza',
      action: 'Acción', none: 'Ninguna', walk: 'Caminar', sit: 'Sentarse', lay: 'Tumbarse', wave: 'Saludar',
      drink: 'Beber', carry: 'Sostener', expression: 'Expresión', gestureNormal: 'Normal',
      gestureSmile: 'Sonrisa', gestureSad: 'Triste', gestureAngry: 'Enfadado', gestureSurprised: 'Sorprendido',
      size: 'Tamaño', sizeSmall: 'Pequeño', sizeNormal: 'Normal', sizeLarge: 'Grande',
      effect: 'Efecto', crop: 'Encuadre', fullBody: 'Cuerpo entero', headOnly: 'Solo la cabeza',
      message: 'Mensaje', msgPh: 'Déjalo vacío para no mostrar bocadillo', textColor: 'Color del texto',
      bubbleColor: 'Color del bocadillo', text: 'Texto', fontSize: 'Tamaño de fuente',
      playerName: 'Nombre del jugador', usernamePh: 'Nombre…', load: 'Cargar',
      backToPanel: 'Volver al panel', logout: 'Cerrar sesión',
      character: 'Personaje', image: 'Imagen',
      copied: '¡Copiado!', linkCopied: '¡Enlace copiado!',
      copyDenied: 'El navegador bloqueó la copia (se requiere HTTPS).',
      searching: 'Buscando a {name}…', loaded: 'Atuendo de {name} cargado.',
      notFound: 'Jugador no encontrado.', lookupDown: 'Búsqueda no disponible.',
      maxLayers: 'Límite alcanzado: máximo {n} capas.',
      taintedCanvas: 'El navegador bloqueó la exportación por una imagen externa. Usa el render del servidor.',
      hostsHint: 'El render del servidor permite: {hosts}', hostsNone: 'El render del servidor no permite imágenes externas (nada configurado).',
      emptyScene: 'Aún no hay capas.', exported: 'Imagen descargada.',
      wardrobe: 'Armario', close: 'Cerrar', showHc: 'Mostrar HC', removeItem: 'Quitar',
      genderAll: 'Todos', genderMale: 'Hombre', genderFemale: 'Mujer',
      noItems: 'Nada con estos filtros.', loading: 'Cargando…',
      wardrobeDown: 'Armario no disponible.',
      cat_hd: 'Cara', cat_hr: 'Pelo', cat_ha: 'Sombrero', cat_he: 'Accesorio de cabeza', cat_ea: 'Gafas',
      cat_fa: 'Accesorio facial', cat_ch: 'Camiseta', cat_cc: 'Abrigo', cat_cp: 'Estampado', cat_ca: 'Accesorio de pecho',
      cat_wa: 'Cinturón', cat_lg: 'Pantalón', cat_sh: 'Zapatos'
    },
    fr: {
      layers: 'Calques', addAvatar: 'Ajouter un personnage', addImage: 'Image', addText: 'Texte',
      canvas: 'Zone de travail', width: 'Largeur', height: 'Hauteur', background: 'Fond',
      bgNone: 'Transparent', bgColor: 'Couleur unie', bgImage: 'Image', colour: 'Couleur',
      imageUrl: "URL de l'image", fit: 'Cadrage', fitCover: 'Remplir', fitContain: 'Contenir',
      fitStretch: 'Étirer', fitTile: 'Répéter',
      downloadPng: 'Télécharger le PNG', copySceneUrl: 'Copier l\\'URL de la scène', openServer: 'Rendu serveur',
      properties: 'Propriétés', selectLayer: 'Choisis un calque, ou ajoute un personnage.',
      scale: 'Taille', opacity: 'Opacité', flip: 'Miroir', duplicate: 'Dupliquer', delete: 'Supprimer',
      figure: 'Figure', openWardrobe: 'Changer de vêtements', bodyDir: 'Direction du corps', headDir: 'Direction de la tête',
      action: 'Action', none: 'Aucune', walk: 'Marche', sit: 'Assis', lay: 'Allongé', wave: 'Salue',
      drink: 'Boit', carry: 'Tient', expression: 'Expression', gestureNormal: 'Normale',
      gestureSmile: 'Sourire', gestureSad: 'Triste', gestureAngry: 'En colère', gestureSurprised: 'Surprise',
      size: 'Taille', sizeSmall: 'Petite', sizeNormal: 'Normale', sizeLarge: 'Grande',
      effect: 'Effet', crop: 'Cadrage', fullBody: 'Corps entier', headOnly: 'Tête seule',
      message: 'Message', msgPh: 'Laisse vide pour ne pas afficher de bulle', textColor: 'Couleur du texte',
      bubbleColor: 'Couleur de la bulle', text: 'Texte', fontSize: 'Taille du texte',
      playerName: 'Pseudo du joueur', usernamePh: 'Pseudo…', load: 'Charger',
      backToPanel: 'Retour au panel', logout: 'Se déconnecter',
      character: 'Personnage', image: 'Image',
      copied: 'Copié !', linkCopied: 'Lien copié !',
      copyDenied: 'Copie refusée par le navigateur (HTTPS requis).',
      searching: 'Recherche de {name}…', loaded: 'Tenue de {name} chargée.',
      notFound: 'Joueur introuvable.', lookupDown: 'Recherche indisponible.',
      maxLayers: 'Limite atteinte : {n} calques maximum.',
      taintedCanvas: 'Le navigateur a bloqué l\\'export à cause d\\'une image externe. Utilise le rendu serveur.',
      hostsHint: 'Le rendu serveur autorise : {hosts}', hostsNone: 'Le rendu serveur n\\'autorise aucune image externe (rien de configuré).',
      emptyScene: 'Aucun calque pour le moment.', exported: 'Image téléchargée.',
      wardrobe: 'Vestiaire', close: 'Fermer', showHc: 'Afficher les HC', removeItem: 'Retirer',
      genderAll: 'Tous', genderMale: 'Homme', genderFemale: 'Femme',
      noItems: 'Rien avec ces filtres.', loading: 'Chargement…',
      wardrobeDown: 'Vestiaire indisponible.',
      cat_hd: 'Visage', cat_hr: 'Cheveux', cat_ha: 'Chapeau', cat_he: 'Accessoire de tête', cat_ea: 'Lunettes',
      cat_fa: 'Accessoire de visage', cat_ch: 'Haut', cat_cc: 'Manteau', cat_cp: 'Motif', cat_ca: 'Accessoire de torse',
      cat_wa: 'Ceinture', cat_lg: 'Pantalon', cat_sh: 'Chaussures'
    },
    de: {
      layers: 'Ebenen', addAvatar: 'Figur hinzufügen', addImage: 'Bild', addText: 'Text',
      canvas: 'Arbeitsfläche', width: 'Breite', height: 'Höhe', background: 'Hintergrund',
      bgNone: 'Transparent', bgColor: 'Einfarbig', bgImage: 'Bild', colour: 'Farbe',
      imageUrl: 'Bild-URL', fit: 'Anpassung', fitCover: 'Füllen', fitContain: 'Einpassen',
      fitStretch: 'Strecken', fitTile: 'Kacheln',
      downloadPng: 'PNG herunterladen', copySceneUrl: 'Szenen-URL kopieren', openServer: 'Server-Render',
      properties: 'Eigenschaften', selectLayer: 'Wähle eine Ebene oder füge eine Figur hinzu.',
      scale: 'Größe', opacity: 'Deckkraft', flip: 'Spiegeln', duplicate: 'Duplizieren', delete: 'Löschen',
      figure: 'Figur', openWardrobe: 'Kleidung ändern', bodyDir: 'Körperrichtung', headDir: 'Kopfrichtung',
      action: 'Aktion', none: 'Keine', walk: 'Gehen', sit: 'Sitzen', lay: 'Liegen', wave: 'Winken',
      drink: 'Trinken', carry: 'Halten', expression: 'Ausdruck', gestureNormal: 'Normal',
      gestureSmile: 'Lächeln', gestureSad: 'Traurig', gestureAngry: 'Wütend', gestureSurprised: 'Überrascht',
      size: 'Größe', sizeSmall: 'Klein', sizeNormal: 'Normal', sizeLarge: 'Groß',
      effect: 'Effekt', crop: 'Ausschnitt', fullBody: 'Ganzer Körper', headOnly: 'Nur Kopf',
      message: 'Nachricht', msgPh: 'Leer lassen für keine Sprechblase', textColor: 'Textfarbe',
      bubbleColor: 'Blasenfarbe', text: 'Text', fontSize: 'Schriftgröße',
      playerName: 'Spielername', usernamePh: 'Spielername…', load: 'Laden',
      backToPanel: 'Zurück zum Panel', logout: 'Abmelden',
      character: 'Figur', image: 'Bild',
      copied: 'Kopiert!', linkCopied: 'Link kopiert!',
      copyDenied: 'Kopieren vom Browser blockiert (HTTPS erforderlich).',
      searching: 'Suche nach {name}…', loaded: 'Outfit von {name} geladen.',
      notFound: 'Spieler nicht gefunden.', lookupDown: 'Suche nicht verfügbar.',
      maxLayers: 'Grenze erreicht: maximal {n} Ebenen.',
      taintedCanvas: 'Der Browser hat den Export wegen eines externen Bildes blockiert. Nutze den Server-Render.',
      hostsHint: 'Server-Render erlaubt: {hosts}', hostsNone: 'Server-Render erlaubt keine externen Bilder (nichts konfiguriert).',
      emptyScene: 'Noch keine Ebene.', exported: 'Bild heruntergeladen.',
      wardrobe: 'Kleiderschrank', close: 'Schließen', showHc: 'HC anzeigen', removeItem: 'Entfernen',
      genderAll: 'Alle', genderMale: 'Männlich', genderFemale: 'Weiblich',
      noItems: 'Nichts mit diesen Filtern.', loading: 'Lädt…',
      wardrobeDown: 'Kleiderschrank nicht verfügbar.',
      cat_hd: 'Gesicht', cat_hr: 'Haare', cat_ha: 'Hut', cat_he: 'Kopf-Accessoire', cat_ea: 'Brille',
      cat_fa: 'Gesichts-Accessoire', cat_ch: 'Oberteil', cat_cc: 'Mantel', cat_cp: 'Aufdruck', cat_ca: 'Brust-Accessoire',
      cat_wa: 'Gürtel', cat_lg: 'Hose', cat_sh: 'Schuhe'
    }
  };

  var LANG_KEY = 'avatar-studio.lang';

  function detectLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved && I18N[saved]) { return saved; }
    } catch (e) {}
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return I18N[nav] ? nav : 'en';
  }

  var LANG = detectLang();

  function t(key, vars) {
    var dict = I18N[LANG] || I18N.en;
    var text = dict[key] !== undefined ? dict[key] : (I18N.en[key] !== undefined ? I18N.en[key] : key);
    if (vars) {
      Object.keys(vars).forEach(function (k) { text = text.split('{' + k + '}').join(vars[k]); });
    }
    return text;
  }

  function applyLang() {
    document.documentElement.lang = LANG;
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) { nodes[i].textContent = t(nodes[i].getAttribute('data-i18n')); }
    nodes = document.querySelectorAll('[data-i18n-ph]');
    for (var j = 0; j < nodes.length; j++) { nodes[j].setAttribute('placeholder', t(nodes[j].getAttribute('data-i18n-ph'))); }
    var sel = $('langSel');
    if (sel) { sel.value = LANG; }
    renderLayerList();
    updateHostHint();
  }

  window.applyLang = applyLang;

  var $msg = $('msg');

  function setMsg(cls, text) {
    $msg.textContent = '';
    if (!text) { return; }
    var span = document.createElement('span');
    span.className = cls;
    span.textContent = text;
    $msg.appendChild(span);
  }

  var scene = {
    w: 700,
    h: 420,
    bg: { c: null, i: null, m: 'cover' },
    l: []
  };

  var selected = null;
  var seq = 0;

  function qs(p) {
    return Object.keys(p).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(p[k]);
    }).join('&');
  }

  function avatarUrl(layer, override) {
    var p = {
      figure: layer.figure,
      direction: layer.direction,
      head_direction: layer.head_direction,
      gesture: layer.gesture || 'std',
      size: layer.size || 'n',
      img_format: 'png'
    };
    if (layer.action) { p.action = layer.action; }
    if (layer.headonly) { p.headonly = 1; }
    if (layer.effect > 0) { p.effect = layer.effect; }
    if (layer.dance > 0) { p.dance = layer.dance; }
    if (layer.frame_num > 0) { p.frame_num = layer.frame_num; }
    if (layer.text) {
      p.text = layer.text;
      p.text_color = layer.text_color;
      p.bubble_color = layer.bubble_color;
    }
    if (override) { Object.keys(override).forEach(function (k) { p[k] = override[k]; }); }
    var q = qs(p);
    if (API_KEY) { q += '&key=' + encodeURIComponent(API_KEY); }
    return IMAGER + '?' + q;
  }

  function newAvatar() {
    return {
      id: ++seq, t: 'a', x: 40 + (scene.l.length % 5) * 30, y: 40, s: 100, f: 0, o: 100,
      figure: START_FIGURE, action: '', gesture: 'std', direction: 2, head_direction: 2,
      headonly: 0, effect: 0, dance: 0, size: 'n', frame_num: 0,
      text: '', text_color: '000000', bubble_color: 'ffffff'
    };
  }

  function newImage() {
    return { id: ++seq, t: 'i', x: 40, y: 40, s: 100, f: 0, o: 100, u: '' };
  }

  function newText() {
    return { id: ++seq, t: 't', x: 40, y: 40, s: 100, f: 0, o: 100, v: 'Hello', c: '#16212f', fs: 22, b: 0 };
  }

  function layerLabel(layer) {
    if (layer.t === 'a') { return t('character') + ' ' + (scene.l.indexOf(layer) + 1); }
    if (layer.t === 'i') { return t('image'); }
    return layer.v.split('\\n')[0].slice(0, 24) || t('text');
  }

  function renderLayerList() {
    var host = $('layerList');
    host.textContent = '';

    if (!scene.l.length) {
      var empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = t('emptyScene');
      host.appendChild(empty);
      return;
    }

    scene.l.slice().reverse().forEach(function (layer) {
      var row = document.createElement('div');
      row.className = 'lrow' + (selected === layer ? ' on' : '');

      var ico = document.createElement('div');
      ico.className = 'ico';
      if (layer.t === 'a') {
        var im = document.createElement('img');
        im.alt = '';
        im.src = avatarUrl(layer, { headonly: 1, size: 's', action: '', text: '', dance: 0, effect: 0 });
        ico.appendChild(im);
      } else {
        ico.textContent = layer.t === 'i' ? '▣' : 'T';
      }

      var nm = document.createElement('div');
      nm.className = 'nm';
      nm.textContent = layerLabel(layer);

      var up = document.createElement('button');
      up.type = 'button';
      up.className = 'zz';
      up.textContent = '▲';
      up.addEventListener('click', function (e) { e.stopPropagation(); move(layer, 1); });

      var down = document.createElement('button');
      down.type = 'button';
      down.className = 'zz';
      down.textContent = '▼';
      down.addEventListener('click', function (e) { e.stopPropagation(); move(layer, -1); });

      row.appendChild(ico);
      row.appendChild(nm);
      row.appendChild(up);
      row.appendChild(down);
      row.addEventListener('click', function () { select(layer); });
      host.appendChild(row);
    });
  }

  function move(layer, delta) {
    var index = scene.l.indexOf(layer);
    var next = index + delta;
    if (next < 0 || next >= scene.l.length) { return; }
    scene.l.splice(index, 1);
    scene.l.splice(next, 0, layer);
    draw();
  }

  function select(layer) {
    selected = layer;
    fillProps();
    draw();
  }

  function fillProps() {
    var has = !!selected;
    $('noSel').style.display = has ? 'none' : '';
    $('propBody').style.display = has ? '' : 'none';
    if (!has) { return; }

    $('pX').value = Math.round(selected.x);
    $('pY').value = Math.round(selected.y);
    $('pS').value = selected.s;
    $('pSVal').textContent = selected.s + '%';
    $('pO').value = selected.o;
    $('pOVal').textContent = selected.o + '%';

    $('avatarProps').style.display = selected.t === 'a' ? '' : 'none';
    $('imageProps').style.display = selected.t === 'i' ? '' : 'none';
    $('textProps').style.display = selected.t === 't' ? '' : 'none';

    if (selected.t === 'a') {
      $('pFigure').value = selected.figure;
      $('pGesture').value = selected.gesture;
      $('pSize').value = selected.size;
      $('pEffect').value = selected.effect;
      $('pCrop').value = String(selected.headonly);
      $('pText').value = selected.text;
      $('pTextColor').value = '#' + selected.text_color;
      $('pBubbleColor').value = '#' + selected.bubble_color;
      paintDirs();
      var chips = document.querySelectorAll('#pActs .chip');
      for (var i = 0; i < chips.length; i++) {
        chips[i].classList.toggle('on', chips[i].dataset.act === selected.action);
      }
    } else if (selected.t === 'i') {
      $('pUrl').value = selected.u;
    } else {
      $('pTxt').value = selected.v;
      $('pFs').value = selected.fs;
      $('pTc').value = selected.c;
    }
  }

  function buildDirs() {
    [['pDirs', 'direction'], ['pHeadDirs', 'head_direction']].forEach(function (pair) {
      var host = $(pair[0]);
      for (var d = 0; d < 8; d++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'dirBtn';
        b.dataset.dir = d;
        b.dataset.kind = pair[1];
        b.textContent = d;
        b.addEventListener('click', function () {
          if (!selected || selected.t !== 'a') { return; }
          selected[this.dataset.kind] = parseInt(this.dataset.dir, 10);
          paintDirs();
          draw();
        });
        host.appendChild(b);
      }
    });
  }

  function paintDirs() {
    var all = document.querySelectorAll('.dirBtn');
    for (var i = 0; i < all.length; i++) {
      var b = all[i];
      b.classList.toggle('on', selected && selected.t === 'a' &&
        selected[b.dataset.kind] === parseInt(b.dataset.dir, 10));
    }
  }

  var $stage = $('stage');

  function draw() {
    $stage.style.width = scene.w + 'px';
    $stage.style.height = scene.h + 'px';
    $stage.style.background = scene.bg.c || 'transparent';
    if (scene.bg.i) {
      $stage.style.backgroundImage = 'url("' + scene.bg.i.replace(/"/g, '%22') + '")';
      $stage.style.backgroundRepeat = scene.bg.m === 'tile' ? 'repeat' : 'no-repeat';
      $stage.style.backgroundPosition = 'center';
      $stage.style.backgroundSize = scene.bg.m === 'stretch' ? '100% 100%'
        : (scene.bg.m === 'tile' ? 'auto' : scene.bg.m);
    } else {
      $stage.style.backgroundImage = 'none';
    }

    $stage.textContent = '';

    scene.l.forEach(function (layer) {
      var node = document.createElement('div');
      node.className = 'lyr' + (selected === layer ? ' sel' : '');
      node.style.left = layer.x + 'px';
      node.style.top = layer.y + 'px';
      node.style.opacity = layer.o / 100;
      node.style.transform = 'scale(' + (layer.s / 100) + ')' + (layer.f ? ' scaleX(-1)' : '');
      if (layer.f) { node.style.transformOrigin = 'top left'; }

      if (layer.t === 't') {
        var span = document.createElement('div');
        span.className = 'txt';
        span.style.font = (layer.b ? 'bold ' : '') + layer.fs + 'px sans-serif';
        span.style.color = layer.c;
        span.style.lineHeight = '1.25';
        span.textContent = layer.v;
        node.appendChild(span);
      } else {
        var img = document.createElement('img');
        img.alt = '';
        img.crossOrigin = 'anonymous';
        if (layer.t === 'a') { img.src = avatarUrl(layer); } else if (layer.u) { img.src = layer.u; }
        img.addEventListener('load', updateUrl);
        node.appendChild(img);
      }

      node.addEventListener('pointerdown', function (e) { startDrag(e, layer, node); });
      $stage.appendChild(node);
    });

    renderLayerList();
    updateUrl();
  }

  function startDrag(e, layer, node) {
    e.preventDefault();
    select(layer);
    var startX = e.clientX;
    var startY = e.clientY;
    var originX = layer.x;
    var originY = layer.y;
    node.classList.add('dragging');
    node.setPointerCapture(e.pointerId);

    function onMove(ev) {
      layer.x = Math.round(originX + (ev.clientX - startX));
      layer.y = Math.round(originY + (ev.clientY - startY));
      node.style.left = layer.x + 'px';
      node.style.top = layer.y + 'px';
      $('pX').value = layer.x;
      $('pY').value = layer.y;
    }

    function onUp() {
      node.classList.remove('dragging');
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerup', onUp);
      updateUrl();
    }

    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerup', onUp);
  }

  function payload() {
    return {
      w: scene.w,
      h: scene.h,
      bg: { c: scene.bg.c, i: scene.bg.i, m: scene.bg.m },
      l: scene.l.map(function (layer) {
        var copy = {};
        Object.keys(layer).forEach(function (k) { if (k !== 'id') { copy[k] = layer[k]; } });
        return copy;
      })
    };
  }

  function encodePayload() {
    var json = JSON.stringify(payload());
    var bytes = new TextEncoder().encode(json);
    var binary = '';
    for (var i = 0; i < bytes.length; i++) { binary += String.fromCharCode(bytes[i]); }
    return btoa(binary).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
  }

  function sceneLink() {
    var q = 's=' + encodePayload();
    if (API_KEY) { q += '&key=' + encodeURIComponent(API_KEY); }
    return location.origin + SCENE_URL + '?' + q;
  }

  function updateUrl() {
    if (!scene.l.length) {
      $('sceneUrlBox').textContent = t('emptyScene');
      $('openScene').removeAttribute('href');
      return;
    }
    var url = sceneLink();
    $('sceneUrlBox').textContent = url;
    $('openScene').href = url;
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('image failed')); };
      img.src = src;
    });
  }

  async function exportPng() {
    if (!scene.l.length) { return; }
    var canvas = document.createElement('canvas');
    canvas.width = scene.w;
    canvas.height = scene.h;
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    if (scene.bg.c) {
      ctx.fillStyle = scene.bg.c;
      ctx.fillRect(0, 0, scene.w, scene.h);
    }

    if (scene.bg.i) {
      try {
        var bg = await loadImage(scene.bg.i);
        if (scene.bg.m === 'stretch') {
          ctx.drawImage(bg, 0, 0, scene.w, scene.h);
        } else if (scene.bg.m === 'tile') {
          for (var y = 0; y < scene.h; y += bg.height) {
            for (var x = 0; x < scene.w; x += bg.width) { ctx.drawImage(bg, x, y); }
          }
        } else {
          var ratio = scene.bg.m === 'contain'
            ? Math.min(scene.w / bg.width, scene.h / bg.height)
            : Math.max(scene.w / bg.width, scene.h / bg.height);
          ctx.drawImage(bg, (scene.w - bg.width * ratio) / 2, (scene.h - bg.height * ratio) / 2,
            bg.width * ratio, bg.height * ratio);
        }
      } catch (e) {}
    }

    for (var i = 0; i < scene.l.length; i++) {
      var layer = scene.l[i];
      ctx.save();
      ctx.globalAlpha = layer.o / 100;
      ctx.translate(layer.x, layer.y);
      var scale = layer.s / 100;

      if (layer.t === 't') {
        ctx.scale(scale, scale);
        ctx.font = (layer.b ? 'bold ' : '') + layer.fs + 'px sans-serif';
        ctx.fillStyle = layer.c;
        ctx.textBaseline = 'top';
        layer.v.split('\\n').forEach(function (line, index) {
          ctx.fillText(line, 0, index * layer.fs * 1.25);
        });
        ctx.restore();
        continue;
      }

      try {
        var src = layer.t === 'a' ? avatarUrl(layer) : layer.u;
        if (!src) { ctx.restore(); continue; }
        var image = await loadImage(src);
        var w = image.width * scale;
        var h = image.height * scale;
        if (layer.f) { ctx.translate(w, 0); ctx.scale(-1, 1); }
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, 0, 0, w, h);
      } catch (e) {}

      ctx.restore();
    }

    try {
      var link = document.createElement('a');
      link.download = 'scene.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      setMsg('ok', t('exported'));
    } catch (e) {
      setMsg('err', t('taintedCanvas'));
    }
  }

  function copy(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { setMsg('err', t('copyDenied')); });
      return;
    }
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  function updateHostHint() {
    var hint = $('hostHint');
    if (!hint) { return; }
    hint.textContent = HOSTS.length ? t('hostsHint', { hosts: HOSTS.join(', ') }) : t('hostsNone');
  }

  function addLayer(layer) {
    if (scene.l.length >= MAX_LAYERS) {
      setMsg('err', t('maxLayers', { n: MAX_LAYERS }));
      return;
    }
    scene.l.push(layer);
    select(layer);
  }

  $('addAvatar').addEventListener('click', function () { addLayer(newAvatar()); });
  $('addImage').addEventListener('click', function () { addLayer(newImage()); });
  $('addText').addEventListener('click', function () { addLayer(newText()); });

  $('pDel').addEventListener('click', function () {
    if (!selected) { return; }
    scene.l.splice(scene.l.indexOf(selected), 1);
    selected = null;
    fillProps();
    draw();
  });

  $('pDup').addEventListener('click', function () {
    if (!selected) { return; }
    var copyLayer = JSON.parse(JSON.stringify(selected));
    copyLayer.id = ++seq;
    copyLayer.x += 24;
    copyLayer.y += 12;
    addLayer(copyLayer);
    draw();
  });

  $('pFlip').addEventListener('click', function () {
    if (!selected) { return; }
    selected.f = selected.f ? 0 : 1;
    draw();
  });

  ['pX', 'pY'].forEach(function (id) {
    $(id).addEventListener('input', function () {
      if (!selected) { return; }
      selected[id === 'pX' ? 'x' : 'y'] = parseInt(this.value, 10) || 0;
      draw();
    });
  });

  $('pS').addEventListener('input', function () {
    if (!selected) { return; }
    selected.s = parseInt(this.value, 10);
    $('pSVal').textContent = selected.s + '%';
    draw();
  });

  $('pO').addEventListener('input', function () {
    if (!selected) { return; }
    selected.o = parseInt(this.value, 10);
    $('pOVal').textContent = selected.o + '%';
    draw();
  });

  var figTimer = null;
  $('pFigure').addEventListener('input', function () {
    if (!selected || selected.t !== 'a') { return; }
    selected.figure = this.value.trim();
    clearTimeout(figTimer);
    figTimer = setTimeout(draw, 350);
  });

  ['pGesture', 'pSize', 'pCrop'].forEach(function (id) {
    $(id).addEventListener('change', function () {
      if (!selected || selected.t !== 'a') { return; }
      if (id === 'pGesture') { selected.gesture = this.value; }
      if (id === 'pSize') { selected.size = this.value; }
      if (id === 'pCrop') { selected.headonly = parseInt(this.value, 10); }
      draw();
    });
  });

  $('pEffect').addEventListener('input', function () {
    if (!selected || selected.t !== 'a') { return; }
    selected.effect = parseInt(this.value, 10) || 0;
    clearTimeout(figTimer);
    figTimer = setTimeout(draw, 350);
  });

  $('pText').addEventListener('input', function () {
    if (!selected || selected.t !== 'a') { return; }
    selected.text = this.value;
    clearTimeout(figTimer);
    figTimer = setTimeout(draw, 400);
  });

  ['pTextColor', 'pBubbleColor'].forEach(function (id) {
    $(id).addEventListener('change', function () {
      if (!selected || selected.t !== 'a') { return; }
      selected[id === 'pTextColor' ? 'text_color' : 'bubble_color'] = this.value.replace('#', '');
      draw();
    });
  });

  var acts = document.querySelectorAll('#pActs .chip');
  for (var a = 0; a < acts.length; a++) {
    acts[a].addEventListener('click', function () {
      if (!selected || selected.t !== 'a') { return; }
      for (var k = 0; k < acts.length; k++) { acts[k].classList.remove('on'); }
      this.classList.add('on');
      selected.action = this.dataset.act;
      draw();
    });
  }

  var urlTimer = null;
  $('pUrl').addEventListener('input', function () {
    if (!selected || selected.t !== 'i') { return; }
    selected.u = this.value.trim();
    clearTimeout(urlTimer);
    urlTimer = setTimeout(draw, 400);
  });

  var txtTimer = null;
  $('pTxt').addEventListener('input', function () {
    if (!selected || selected.t !== 't') { return; }
    selected.v = this.value;
    clearTimeout(txtTimer);
    txtTimer = setTimeout(draw, 250);
  });

  $('pFs').addEventListener('input', function () {
    if (!selected || selected.t !== 't') { return; }
    selected.fs = parseInt(this.value, 10) || 20;
    draw();
  });

  $('pTc').addEventListener('change', function () {
    if (!selected || selected.t !== 't') { return; }
    selected.c = this.value;
    draw();
  });

  ['cvW', 'cvH'].forEach(function (id) {
    $(id).addEventListener('input', function () {
      var n = parseInt(this.value, 10);
      if (!n || n < 32) { return; }
      scene[id === 'cvW' ? 'w' : 'h'] = Math.min(n, 2000);
      draw();
    });
  });

  $('bgMode').addEventListener('change', function () {
    $('bgColorField').style.display = this.value === 'color' ? '' : 'none';
    $('bgImageField').style.display = this.value === 'image' ? '' : 'none';
    scene.bg.c = this.value === 'color' ? val('bgColor') : null;
    scene.bg.i = this.value === 'image' ? val('bgUrl').trim() || null : null;
    draw();
  });

  $('bgColor').addEventListener('change', function () {
    if (val('bgMode') !== 'color') { return; }
    scene.bg.c = this.value;
    draw();
  });

  var bgTimer = null;
  $('bgUrl').addEventListener('input', function () {
    if (val('bgMode') !== 'image') { return; }
    scene.bg.i = this.value.trim() || null;
    clearTimeout(bgTimer);
    bgTimer = setTimeout(draw, 400);
  });

  $('bgFit').addEventListener('change', function () {
    scene.bg.m = this.value;
    draw();
  });

  $('dlPng').addEventListener('click', exportPng);
  $('copyScene').addEventListener('click', function () {
    if (!scene.l.length) { return; }
    copy(sceneLink(), function () { setMsg('ok', t('linkCopied')); });
  });

  $('langSel').addEventListener('change', function () {
    LANG = this.value;
    try { localStorage.setItem(LANG_KEY, LANG); } catch (e) {}
    applyLang();
  });

  var tokenQs = TOKEN ? '&token=' + encodeURIComponent(TOKEN) : '';

  if (LOOKUP) {
    $('userField').style.display = '';
    var $sug = $('sugList');
    var sugTimer = null;

    function hideSug() { $sug.style.display = 'none'; $sug.textContent = ''; }

    function useFigure(name, figure) {
      if (!selected || selected.t !== 'a') { return; }
      selected.figure = figure;
      $('pFigure').value = figure;
      setMsg('ok', t('loaded', { name: name }));
      hideSug();
      draw();
    }

    function doLookup() {
      var u = val('fUser').trim();
      if (!u || !selected || selected.t !== 'a') { return; }
      setMsg('wait', t('searching', { name: u }));
      fetch(BASE + '/look?username=' + encodeURIComponent(u) + tokenQs, { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.ok && d.figure) { useFigure(d.username || u, d.figure); }
          else { setMsg('err', (d && d.error) || t('notFound')); }
        })
        .catch(function () { setMsg('err', t('lookupDown')); });
    }

    function suggest() {
      if (!SEARCH) { return; }
      var q = val('fUser').trim();
      if (q.length < 2) { hideSug(); return; }
      fetch(BASE + '/search?q=' + encodeURIComponent(q) + tokenQs, { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d || !d.ok || !d.results || !d.results.length) { hideSug(); return; }
          $sug.textContent = '';
          d.results.forEach(function (row) {
            var li = document.createElement('button');
            li.type = 'button';
            li.className = 'sug';
            var im = document.createElement('img');
            im.alt = '';
            im.src = avatarUrl({ figure: row.figure, direction: 2, head_direction: 2, size: 's' }, { headonly: 1 });
            var sp = document.createElement('span');
            sp.textContent = row.username;
            li.appendChild(im);
            li.appendChild(sp);
            li.addEventListener('click', function () {
              $('fUser').value = row.username;
              useFigure(row.username, row.figure);
            });
            $sug.appendChild(li);
          });
          $sug.style.display = 'block';
        })
        .catch(hideSug);
    }

    $('fetchLook').addEventListener('click', doLookup);
    $('fUser').addEventListener('input', function () {
      clearTimeout(sugTimer);
      sugTimer = setTimeout(suggest, 250);
    });
    $('fUser').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); doLookup(); }
      if (e.key === 'Escape') { hideSug(); }
    });
    document.addEventListener('click', function (e) {
      if (!$('userField').contains(e.target)) { hideSug(); }
    });
  }

${ WARDROBE_JS }

  if (WARDROBE) {
    var wardrobe = createWardrobe({
      dataUrl: BASE + '/figuredata' + (TOKEN ? '?token=' + encodeURIComponent(TOKEN) : ''),
      thumbUrl: function (figure, head) {
        return avatarUrl({ figure: figure, direction: 2, head_direction: 2, size: 'n' },
          head ? { headonly: 1 } : { size: 's' });
      }
    });

    var openBtn = $('openWardrobe');
    if (openBtn) {
      openBtn.addEventListener('click', function () {
        if (!selected || selected.t !== 'a') { return; }
        wardrobe.open({
          figure: function () { return selected.figure; },
          apply: function (figure) {
            selected.figure = figure;
            $('pFigure').value = figure;
            draw();
          }
        });
      });
    }
  }

  buildDirs();
  addLayer(newAvatar());
  applyLang();
  draw();
})();
</script>
</body>
</html>`;

export default renderScenePage;
