import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderStyle } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { a as useAuth } from './server.mjs';
import { G as GameEngine } from './game-engine-CV48549j.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "editor",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const { user } = useAuth();
    const engine = new GameEngine();
    const mapData = ref({
      title: "NEW UNTITLED MAP",
      duration: 60,
      difficulty: 10,
      engineObstacles: [],
      enginePortals: [],
      beatTimes: [],
      sections: [],
      seed: 0,
      bpm: 120,
      measureLength: 2
    });
    const totalLength = ref(60 * 350 + 500);
    const cameraX = ref(0);
    const zoom = ref(1);
    const selectedObjects = ref([]);
    const selectedPaletteType = ref("spike");
    ref(null);
    ref(null);
    ref(null);
    const obstacleTypes = ["spike", "block", "saw", "mini_spike", "laser", "spike_ball", "v_laser", "mine", "orb", "slope"];
    const portalTypes = ["gravity_yellow", "gravity_blue", "speed_0.25", "speed_0.5", "speed_1", "speed_2", "speed_3", "speed_4", "mini_pink", "mini_green"];
    const getSymbol = (type) => engine.getPortalSymbol(type) || "■";
    const getPortalSymbol = (type) => engine.getPortalSymbol(type);
    ref([]);
    ref(-1);
    ref([]);
    ref(false);
    ref(false);
    ref({ x1: 0, y1: 0, x2: 0, y2: 0 });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "editor-page" }, _attrs))} data-v-ac3287de><div class="background-anim" data-v-ac3287de></div><header class="editor-header glass-panel" data-v-ac3287de><div class="left" data-v-ac3287de><h1 class="title" data-v-ac3287de>MAP_ARCHITECT <span class="version" data-v-ac3287de>v2.0</span></h1><div class="map-meta" data-v-ac3287de><input${ssrRenderAttr("value", mapData.value.title)} placeholder="Map Title" class="map-title-input" data-v-ac3287de><span class="creator" data-v-ac3287de>BY: ${ssrInterpolate(unref(user)?.username || "Guest")}</span></div></div><div class="center" data-v-ac3287de><div class="transport-controls" data-v-ac3287de><button class="control-btn test" data-v-ac3287de><span class="icon" data-v-ac3287de>▶</span> TEST </button><button class="control-btn save" data-v-ac3287de><span class="icon" data-v-ac3287de>💾</span> SAVE </button><button class="control-btn exit" data-v-ac3287de>EXIT</button></div></div><div class="right" data-v-ac3287de><div class="config-summary" data-v-ac3287de><span class="stat" data-v-ac3287de>OBJ: ${ssrInterpolate(mapData.value.engineObstacles.length)}</span><span class="stat" data-v-ac3287de>PORT: ${ssrInterpolate(mapData.value.enginePortals.length)}</span></div></div></header><div class="main-layout" data-v-ac3287de><aside class="sidebar left-sidebar glass-panel" data-v-ac3287de><h3 data-v-ac3287de>PALETTE</h3><div class="object-list" data-v-ac3287de><!--[-->`);
      ssrRenderList(obstacleTypes, (type) => {
        _push(`<div class="${ssrRenderClass([{ selected: selectedPaletteType.value === type }, "palette-item"])}" data-v-ac3287de><div class="symbol" data-v-ac3287de>${ssrInterpolate(getSymbol(type))}</div><span class="name" data-v-ac3287de>${ssrInterpolate(type.split("_").join(" ").toUpperCase())}</span></div>`);
      });
      _push(`<!--]--><div class="separator" data-v-ac3287de>PORTALS</div><!--[-->`);
      ssrRenderList(portalTypes, (type) => {
        _push(`<div class="${ssrRenderClass([{ selected: selectedPaletteType.value === type }, "palette-item portal"])}" data-v-ac3287de><div class="symbol" data-v-ac3287de>${ssrInterpolate(getPortalSymbol(type))}</div><span class="name" data-v-ac3287de>${ssrInterpolate(type.split("_").join(" ").toUpperCase())}</span></div>`);
      });
      _push(`<!--]--></div></aside><main class="workspace glass-panel" data-v-ac3287de><canvas width="1200" height="600" class="editor-canvas" data-v-ac3287de></canvas><div class="grid-info" data-v-ac3287de><span data-v-ac3287de>ZOOM: ${ssrInterpolate((zoom.value * 100).toFixed(0))}%</span><span data-v-ac3287de>X: ${ssrInterpolate(Math.floor(cameraX.value))}</span></div><div class="timeline-container" data-v-ac3287de><input type="range" min="0"${ssrRenderAttr("max", totalLength.value)}${ssrRenderAttr("value", cameraX.value)} class="timeline-slider" data-v-ac3287de></div></main><aside class="sidebar right-sidebar glass-panel" data-v-ac3287de><h3 data-v-ac3287de>PROPERTIES</h3>`);
      if (selectedObjects.value.length === 1) {
        _push(`<div class="properties-list" data-v-ac3287de><div class="prop-group" data-v-ac3287de><label data-v-ac3287de>TYPE</label><span class="prop-val-static" data-v-ac3287de>${ssrInterpolate(selectedObjects.value[0].type.toUpperCase())}</span></div><div class="prop-group" data-v-ac3287de><label data-v-ac3287de>POSITION X / Y</label><div class="input-pair" data-v-ac3287de><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].x)} data-v-ac3287de><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].y)} data-v-ac3287de></div></div><div class="prop-group" data-v-ac3287de><label data-v-ac3287de>SIZE W / H</label><div class="input-pair" data-v-ac3287de><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].width)} data-v-ac3287de><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].height)} data-v-ac3287de></div></div>`);
        if ("type" in selectedObjects.value[0]) {
          _push(`<div class="prop-group" data-v-ac3287de><label data-v-ac3287de>ROTATION (DEG)</label><div class="rotation-controls" data-v-ac3287de><button class="rot-btn" data-v-ac3287de>↺ -45°</button><button class="rot-btn" data-v-ac3287de>45° ↻</button></div><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].angle)} data-v-ac3287de><input type="range" min="0" max="360"${ssrRenderAttr("value", selectedObjects.value[0].angle)} data-v-ac3287de></div>`);
        } else {
          _push(`<!---->`);
        }
        if ("movement" in selectedObjects.value[0]) {
          _push(`<div class="prop-group" data-v-ac3287de><label data-v-ac3287de>MOVEMENT</label>`);
          if (selectedObjects.value[0].movement) {
            _push(`<select data-v-ac3287de><option value="none" data-v-ac3287de${ssrIncludeBooleanAttr(Array.isArray(selectedObjects.value[0].movement.type) ? ssrLooseContain(selectedObjects.value[0].movement.type, "none") : ssrLooseEqual(selectedObjects.value[0].movement.type, "none")) ? " selected" : ""}>NONE</option><option value="updown" data-v-ac3287de${ssrIncludeBooleanAttr(Array.isArray(selectedObjects.value[0].movement.type) ? ssrLooseContain(selectedObjects.value[0].movement.type, "updown") : ssrLooseEqual(selectedObjects.value[0].movement.type, "updown")) ? " selected" : ""}>UP-DOWN BOUNCE</option><option value="rotate" data-v-ac3287de${ssrIncludeBooleanAttr(Array.isArray(selectedObjects.value[0].movement.type) ? ssrLooseContain(selectedObjects.value[0].movement.type, "rotate") : ssrLooseEqual(selectedObjects.value[0].movement.type, "rotate")) ? " selected" : ""}>CONTINUOUS ROTATE</option></select>`);
          } else {
            _push(`<!---->`);
          }
          if (selectedObjects.value[0].movement && selectedObjects.value[0].movement.type !== "none") {
            _push(`<div class="movement-details" data-v-ac3287de><label data-v-ac3287de>SPEED</label><input type="number" step="0.1"${ssrRenderAttr("value", selectedObjects.value[0].movement.speed)} data-v-ac3287de><label data-v-ac3287de>RANGE</label><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].movement.range)} data-v-ac3287de><label data-v-ac3287de>PHASE OFFSET</label><input type="number" step="0.1"${ssrRenderAttr("value", selectedObjects.value[0].movement.phase)} data-v-ac3287de></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="delete-btn" data-v-ac3287de>DELETE OBJECT</button></div>`);
      } else if (selectedObjects.value.length > 1) {
        _push(`<div class="properties-list" data-v-ac3287de><div class="prop-group" data-v-ac3287de><label data-v-ac3287de>MULTIPLE SELECTION</label><span class="prop-val-static" data-v-ac3287de>${ssrInterpolate(selectedObjects.value.length)} OBJECTS</span></div><button class="delete-btn" data-v-ac3287de>DELETE ALL</button></div>`);
      } else {
        _push(`<div class="empty-selection" data-v-ac3287de> SELECT OBJECTS TO MODIFY </div>`);
      }
      _push(`<div class="global-settings prop-group" data-v-ac3287de><h3 data-v-ac3287de>LEVEL CONFIG</h3><label data-v-ac3287de>TOTAL DURATION (S)</label><input type="number"${ssrRenderAttr("value", mapData.value.duration)} data-v-ac3287de><label data-v-ac3287de>DIFFICULTY</label><input type="number"${ssrRenderAttr("value", mapData.value.difficulty)} data-v-ac3287de></div><div class="audio-settings prop-group" data-v-ac3287de><h3 data-v-ac3287de>AUDIO CONFIG</h3><label data-v-ac3287de>BPM</label><input type="number"${ssrRenderAttr("value", mapData.value.bpm)} data-v-ac3287de><label data-v-ac3287de>MEASURE LENGTH (S)</label><input type="number" step="0.1"${ssrRenderAttr("value", mapData.value.measureLength)} data-v-ac3287de><div class="audio-upload" data-v-ac3287de><label data-v-ac3287de>AUDIO FILE</label><button class="upload-btn" data-v-ac3287de>${ssrInterpolate(mapData.value.audioData ? "AUDIO LOADED" : "UPLOAD MP3")}</button><input type="file" accept="audio/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-ac3287de>`);
      if (mapData.value.audioData) {
        _push(`<p class="audio-hint" data-v-ac3287de>Audio embedded in map data</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></aside></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/editor.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const editor = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ac3287de"]]);

export { editor as default };
//# sourceMappingURL=editor-Bmq84gE8.mjs.map
