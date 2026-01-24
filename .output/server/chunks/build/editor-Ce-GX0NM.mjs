import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderStyle } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { a as useAuth } from './server.mjs';
import { G as GameEngine } from './game-engine-B6GgZhSo.mjs';
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
    const obstacleTypes = ["spike", "block", "saw", "mini_spike", "laser", "spike_ball", "v_laser", "mine", "orb"];
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "editor-page" }, _attrs))} data-v-d4a7a276><div class="background-anim" data-v-d4a7a276></div><header class="editor-header glass-panel" data-v-d4a7a276><div class="left" data-v-d4a7a276><h1 class="title" data-v-d4a7a276>MAP_ARCHITECT <span class="version" data-v-d4a7a276>v2.0</span></h1><div class="map-meta" data-v-d4a7a276><input${ssrRenderAttr("value", mapData.value.title)} placeholder="Map Title" class="map-title-input" data-v-d4a7a276><span class="creator" data-v-d4a7a276>BY: ${ssrInterpolate(unref(user)?.username || "Guest")}</span></div></div><div class="center" data-v-d4a7a276><div class="transport-controls" data-v-d4a7a276><button class="control-btn test" data-v-d4a7a276><span class="icon" data-v-d4a7a276>▶</span> TEST </button><button class="control-btn save" data-v-d4a7a276><span class="icon" data-v-d4a7a276>💾</span> SAVE </button><button class="control-btn exit" data-v-d4a7a276>EXIT</button></div></div><div class="right" data-v-d4a7a276><div class="config-summary" data-v-d4a7a276><span class="stat" data-v-d4a7a276>OBJ: ${ssrInterpolate(mapData.value.engineObstacles.length)}</span><span class="stat" data-v-d4a7a276>PORT: ${ssrInterpolate(mapData.value.enginePortals.length)}</span></div></div></header><div class="main-layout" data-v-d4a7a276><aside class="sidebar left-sidebar glass-panel" data-v-d4a7a276><h3 data-v-d4a7a276>PALETTE</h3><div class="object-list" data-v-d4a7a276><!--[-->`);
      ssrRenderList(obstacleTypes, (type) => {
        _push(`<div class="${ssrRenderClass([{ selected: selectedPaletteType.value === type }, "palette-item"])}" data-v-d4a7a276><div class="symbol" data-v-d4a7a276>${ssrInterpolate(getSymbol(type))}</div><span class="name" data-v-d4a7a276>${ssrInterpolate(type.split("_").join(" ").toUpperCase())}</span></div>`);
      });
      _push(`<!--]--><div class="separator" data-v-d4a7a276>PORTALS</div><!--[-->`);
      ssrRenderList(portalTypes, (type) => {
        _push(`<div class="${ssrRenderClass([{ selected: selectedPaletteType.value === type }, "palette-item portal"])}" data-v-d4a7a276><div class="symbol" data-v-d4a7a276>${ssrInterpolate(getPortalSymbol(type))}</div><span class="name" data-v-d4a7a276>${ssrInterpolate(type.split("_").join(" ").toUpperCase())}</span></div>`);
      });
      _push(`<!--]--></div></aside><main class="workspace glass-panel" data-v-d4a7a276><canvas width="1200" height="600" class="editor-canvas" data-v-d4a7a276></canvas><div class="grid-info" data-v-d4a7a276><span data-v-d4a7a276>ZOOM: ${ssrInterpolate((zoom.value * 100).toFixed(0))}%</span><span data-v-d4a7a276>X: ${ssrInterpolate(Math.floor(cameraX.value))}</span></div><div class="timeline-container" data-v-d4a7a276><input type="range" min="0"${ssrRenderAttr("max", totalLength.value)}${ssrRenderAttr("value", cameraX.value)} class="timeline-slider" data-v-d4a7a276></div></main><aside class="sidebar right-sidebar glass-panel" data-v-d4a7a276><h3 data-v-d4a7a276>PROPERTIES</h3>`);
      if (selectedObjects.value.length === 1) {
        _push(`<div class="properties-list" data-v-d4a7a276><div class="prop-group" data-v-d4a7a276><label data-v-d4a7a276>TYPE</label><span class="prop-val-static" data-v-d4a7a276>${ssrInterpolate(selectedObjects.value[0].type.toUpperCase())}</span></div><div class="prop-group" data-v-d4a7a276><label data-v-d4a7a276>POSITION X / Y</label><div class="input-pair" data-v-d4a7a276><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].x)} data-v-d4a7a276><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].y)} data-v-d4a7a276></div></div><div class="prop-group" data-v-d4a7a276><label data-v-d4a7a276>SIZE W / H</label><div class="input-pair" data-v-d4a7a276><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].width)} data-v-d4a7a276><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].height)} data-v-d4a7a276></div></div>`);
        if ("angle" in selectedObjects.value[0]) {
          _push(`<div class="prop-group" data-v-d4a7a276><label data-v-d4a7a276>ROTATION (DEG)</label><div class="rotation-controls" data-v-d4a7a276><button class="rot-btn" data-v-d4a7a276>↺ -45°</button><button class="rot-btn" data-v-d4a7a276>45° ↻</button></div><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].angle)} data-v-d4a7a276><input type="range" min="0" max="360"${ssrRenderAttr("value", selectedObjects.value[0].angle)} data-v-d4a7a276></div>`);
        } else {
          _push(`<!---->`);
        }
        if ("movement" in selectedObjects.value[0]) {
          _push(`<div class="prop-group" data-v-d4a7a276><label data-v-d4a7a276>MOVEMENT</label>`);
          if (selectedObjects.value[0].movement) {
            _push(`<select data-v-d4a7a276><option value="none" data-v-d4a7a276${ssrIncludeBooleanAttr(Array.isArray(selectedObjects.value[0].movement.type) ? ssrLooseContain(selectedObjects.value[0].movement.type, "none") : ssrLooseEqual(selectedObjects.value[0].movement.type, "none")) ? " selected" : ""}>NONE</option><option value="updown" data-v-d4a7a276${ssrIncludeBooleanAttr(Array.isArray(selectedObjects.value[0].movement.type) ? ssrLooseContain(selectedObjects.value[0].movement.type, "updown") : ssrLooseEqual(selectedObjects.value[0].movement.type, "updown")) ? " selected" : ""}>UP-DOWN BOUNCE</option><option value="rotate" data-v-d4a7a276${ssrIncludeBooleanAttr(Array.isArray(selectedObjects.value[0].movement.type) ? ssrLooseContain(selectedObjects.value[0].movement.type, "rotate") : ssrLooseEqual(selectedObjects.value[0].movement.type, "rotate")) ? " selected" : ""}>CONTINUOUS ROTATE</option></select>`);
          } else {
            _push(`<!---->`);
          }
          if (selectedObjects.value[0].movement && selectedObjects.value[0].movement.type !== "none") {
            _push(`<div class="movement-details" data-v-d4a7a276><label data-v-d4a7a276>SPEED</label><input type="number" step="0.1"${ssrRenderAttr("value", selectedObjects.value[0].movement.speed)} data-v-d4a7a276><label data-v-d4a7a276>RANGE</label><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].movement.range)} data-v-d4a7a276><label data-v-d4a7a276>PHASE OFFSET</label><input type="number" step="0.1"${ssrRenderAttr("value", selectedObjects.value[0].movement.phase)} data-v-d4a7a276></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="delete-btn" data-v-d4a7a276>DELETE OBJECT</button></div>`);
      } else if (selectedObjects.value.length > 1) {
        _push(`<div class="properties-list" data-v-d4a7a276><div class="prop-group" data-v-d4a7a276><label data-v-d4a7a276>MULTIPLE SELECTION</label><span class="prop-val-static" data-v-d4a7a276>${ssrInterpolate(selectedObjects.value.length)} OBJECTS</span></div><button class="delete-btn" data-v-d4a7a276>DELETE ALL</button></div>`);
      } else {
        _push(`<div class="empty-selection" data-v-d4a7a276> SELECT OBJECTS TO MODIFY </div>`);
      }
      _push(`<div class="global-settings prop-group" data-v-d4a7a276><h3 data-v-d4a7a276>LEVEL CONFIG</h3><label data-v-d4a7a276>TOTAL DURATION (S)</label><input type="number"${ssrRenderAttr("value", mapData.value.duration)} data-v-d4a7a276><label data-v-d4a7a276>DIFFICULTY</label><input type="number"${ssrRenderAttr("value", mapData.value.difficulty)} data-v-d4a7a276></div><div class="audio-settings prop-group" data-v-d4a7a276><h3 data-v-d4a7a276>AUDIO CONFIG</h3><label data-v-d4a7a276>BPM</label><input type="number"${ssrRenderAttr("value", mapData.value.bpm)} data-v-d4a7a276><label data-v-d4a7a276>MEASURE LENGTH (S)</label><input type="number" step="0.1"${ssrRenderAttr("value", mapData.value.measureLength)} data-v-d4a7a276><div class="audio-upload" data-v-d4a7a276><label data-v-d4a7a276>AUDIO FILE</label><button class="upload-btn" data-v-d4a7a276>${ssrInterpolate(mapData.value.audioData ? "AUDIO LOADED" : "UPLOAD MP3")}</button><input type="file" accept="audio/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-d4a7a276>`);
      if (mapData.value.audioData) {
        _push(`<p class="audio-hint" data-v-d4a7a276>Audio embedded in map data</p>`);
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
const editor = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d4a7a276"]]);

export { editor as default };
//# sourceMappingURL=editor-Ce-GX0NM.mjs.map
