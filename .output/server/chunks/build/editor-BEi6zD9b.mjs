import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderStyle } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { a as useAuth } from './server.mjs';
import { G as GameEngine } from './game-engine-WKw9rqTg.mjs';
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
    const showHitboxes = ref(true);
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
    const showSmartGenModal = ref(false);
    const smartGenLog = ref([]);
    const smartGenProgress = ref(0);
    const smartGenStatus = ref("");
    const isGenerating = ref(false);
    const getStatusText = (status) => {
      const map = {
        "idle": "IDLE",
        "analyzing_song": "SONG ANALYSIS",
        "generating_path": "MOVEMENT PATH GENERATION",
        "adjusting_path": "MOVEMENT PATH ADJUSTMENT",
        "generating_map": "MAP GENERATION",
        "adjusting_map": "MAP ADJUSTMENT",
        "saving_map": "MAP SAVING",
        "completed": "COMPLETED",
        "failed": "FAILED"
      };
      return map[status] || status.toUpperCase().replace("_", " ");
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "editor-page" }, _attrs))} data-v-6a20ed98><div class="background-anim" data-v-6a20ed98></div><header class="editor-header glass-panel" data-v-6a20ed98><div class="left" data-v-6a20ed98><h1 class="title" data-v-6a20ed98>MAP_ARCHITECT <span class="version" data-v-6a20ed98>v2.0</span></h1><div class="map-meta" data-v-6a20ed98><input${ssrRenderAttr("value", mapData.value.title)} placeholder="Map Title" class="map-title-input" data-v-6a20ed98><span class="creator" data-v-6a20ed98>BY: ${ssrInterpolate(unref(user)?.username || "Guest")}</span></div></div><div class="center" data-v-6a20ed98><div class="transport-controls" data-v-6a20ed98><button class="control-btn test" data-v-6a20ed98><span class="icon" data-v-6a20ed98>▶</span> TEST </button><button class="control-btn save" data-v-6a20ed98><span class="icon" data-v-6a20ed98>💾</span> SAVE </button><button class="${ssrRenderClass([{ active: showHitboxes.value }, "control-btn"])}" data-v-6a20ed98><span class="icon" data-v-6a20ed98>⛶</span> HITBOX </button><button class="control-btn exit" data-v-6a20ed98>EXIT</button></div></div><div class="right" data-v-6a20ed98><div class="config-summary" data-v-6a20ed98><span class="stat" data-v-6a20ed98>OBJ: ${ssrInterpolate(mapData.value.engineObstacles.length)}</span><span class="stat" data-v-6a20ed98>PORT: ${ssrInterpolate(mapData.value.enginePortals.length)}</span></div></div></header><div class="main-layout" data-v-6a20ed98><aside class="sidebar left-sidebar glass-panel" data-v-6a20ed98><h3 data-v-6a20ed98>PALETTE</h3><div class="object-list" data-v-6a20ed98><!--[-->`);
      ssrRenderList(obstacleTypes, (type) => {
        _push(`<div class="${ssrRenderClass([{ selected: selectedPaletteType.value === type }, "palette-item"])}" data-v-6a20ed98><div class="symbol" data-v-6a20ed98>${ssrInterpolate(getSymbol(type))}</div><span class="name" data-v-6a20ed98>${ssrInterpolate(type.split("_").join(" ").toUpperCase())}</span></div>`);
      });
      _push(`<!--]--><div class="separator" data-v-6a20ed98>PORTALS</div><!--[-->`);
      ssrRenderList(portalTypes, (type) => {
        _push(`<div class="${ssrRenderClass([{ selected: selectedPaletteType.value === type }, "palette-item portal"])}" data-v-6a20ed98><div class="symbol" data-v-6a20ed98>${ssrInterpolate(getPortalSymbol(type))}</div><span class="name" data-v-6a20ed98>${ssrInterpolate(type.split("_").join(" ").toUpperCase())}</span></div>`);
      });
      _push(`<!--]--></div></aside><main class="workspace glass-panel" data-v-6a20ed98><canvas width="1200" height="600" class="editor-canvas" data-v-6a20ed98></canvas><div class="grid-info" data-v-6a20ed98><span data-v-6a20ed98>ZOOM: ${ssrInterpolate((zoom.value * 100).toFixed(0))}%</span><span data-v-6a20ed98>X: ${ssrInterpolate(Math.floor(cameraX.value))}</span></div><div class="timeline-container" data-v-6a20ed98><input type="range" min="0"${ssrRenderAttr("max", totalLength.value)}${ssrRenderAttr("value", cameraX.value)} class="timeline-slider" data-v-6a20ed98></div></main><aside class="sidebar right-sidebar glass-panel" data-v-6a20ed98><h3 data-v-6a20ed98>PROPERTIES</h3>`);
      if (selectedObjects.value.length === 1) {
        _push(`<div class="properties-list" data-v-6a20ed98><div class="prop-group" data-v-6a20ed98><label data-v-6a20ed98>TYPE</label><span class="prop-val-static" data-v-6a20ed98>${ssrInterpolate(selectedObjects.value[0].type.toUpperCase())}</span></div><div class="prop-group" data-v-6a20ed98><label data-v-6a20ed98>POSITION X / Y</label><div class="input-pair" data-v-6a20ed98><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].x)} data-v-6a20ed98><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].y)} data-v-6a20ed98></div></div><div class="prop-group" data-v-6a20ed98><label data-v-6a20ed98>SIZE W / H</label><div class="input-pair" data-v-6a20ed98><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].width)} data-v-6a20ed98><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].height)} data-v-6a20ed98></div></div>`);
        if ("type" in selectedObjects.value[0]) {
          _push(`<div class="prop-group" data-v-6a20ed98><label data-v-6a20ed98>ROTATION (DEG)</label><div class="rotation-controls" data-v-6a20ed98><button class="rot-btn" data-v-6a20ed98>↺ -45°</button><button class="rot-btn" data-v-6a20ed98>45° ↻</button></div><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].angle)} data-v-6a20ed98><input type="range" min="0" max="360"${ssrRenderAttr("value", selectedObjects.value[0].angle)} data-v-6a20ed98></div>`);
        } else {
          _push(`<!---->`);
        }
        if ("movement" in selectedObjects.value[0]) {
          _push(`<div class="prop-group" data-v-6a20ed98><label data-v-6a20ed98>MOVEMENT</label>`);
          if (selectedObjects.value[0].movement) {
            _push(`<select data-v-6a20ed98><option value="none" data-v-6a20ed98${ssrIncludeBooleanAttr(Array.isArray(selectedObjects.value[0].movement.type) ? ssrLooseContain(selectedObjects.value[0].movement.type, "none") : ssrLooseEqual(selectedObjects.value[0].movement.type, "none")) ? " selected" : ""}>NONE</option><option value="updown" data-v-6a20ed98${ssrIncludeBooleanAttr(Array.isArray(selectedObjects.value[0].movement.type) ? ssrLooseContain(selectedObjects.value[0].movement.type, "updown") : ssrLooseEqual(selectedObjects.value[0].movement.type, "updown")) ? " selected" : ""}>UP-DOWN BOUNCE</option><option value="rotate" data-v-6a20ed98${ssrIncludeBooleanAttr(Array.isArray(selectedObjects.value[0].movement.type) ? ssrLooseContain(selectedObjects.value[0].movement.type, "rotate") : ssrLooseEqual(selectedObjects.value[0].movement.type, "rotate")) ? " selected" : ""}>CONTINUOUS ROTATE</option></select>`);
          } else {
            _push(`<!---->`);
          }
          if (selectedObjects.value[0].movement && selectedObjects.value[0].movement.type !== "none") {
            _push(`<div class="movement-details" data-v-6a20ed98><label data-v-6a20ed98>SPEED</label><input type="number" step="0.1"${ssrRenderAttr("value", selectedObjects.value[0].movement.speed)} data-v-6a20ed98><label data-v-6a20ed98>RANGE</label><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].movement.range)} data-v-6a20ed98><label data-v-6a20ed98>PHASE OFFSET</label><input type="number" step="0.1"${ssrRenderAttr("value", selectedObjects.value[0].movement.phase)} data-v-6a20ed98></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="delete-btn" data-v-6a20ed98>DELETE OBJECT</button></div>`);
      } else if (selectedObjects.value.length > 1) {
        _push(`<div class="properties-list" data-v-6a20ed98><div class="prop-group" data-v-6a20ed98><label data-v-6a20ed98>MULTIPLE SELECTION</label><span class="prop-val-static" data-v-6a20ed98>${ssrInterpolate(selectedObjects.value.length)} OBJECTS</span></div><button class="delete-btn" data-v-6a20ed98>DELETE ALL</button></div>`);
      } else {
        _push(`<div class="empty-selection" data-v-6a20ed98> SELECT OBJECTS TO MODIFY </div>`);
      }
      _push(`<div class="global-settings prop-group" data-v-6a20ed98><h3 data-v-6a20ed98>LEVEL CONFIG</h3><label data-v-6a20ed98>TOTAL DURATION (S)</label><input type="number"${ssrRenderAttr("value", mapData.value.duration)} data-v-6a20ed98><label data-v-6a20ed98>DIFFICULTY</label><input type="number"${ssrRenderAttr("value", mapData.value.difficulty)} data-v-6a20ed98></div><div class="audio-settings prop-group" data-v-6a20ed98><h3 data-v-6a20ed98>AUDIO CONFIG</h3><label data-v-6a20ed98>BPM</label><input type="number"${ssrRenderAttr("value", mapData.value.bpm)} data-v-6a20ed98><label data-v-6a20ed98>MEASURE LENGTH (S)</label><input type="number" step="0.1"${ssrRenderAttr("value", mapData.value.measureLength)} data-v-6a20ed98><div class="audio-upload" data-v-6a20ed98><label data-v-6a20ed98>AUDIO FILE</label><button class="upload-btn" data-v-6a20ed98>${ssrInterpolate(mapData.value.audioData ? "AUDIO LOADED" : "UPLOAD MP3")}</button><input type="file" accept="audio/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-6a20ed98>`);
      if (mapData.value.audioData) {
        _push(`<p class="audio-hint" data-v-6a20ed98>Audio embedded in map data</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></aside></div>`);
      if (showSmartGenModal.value) {
        _push(`<div class="modal-overlay" data-v-6a20ed98><div class="modal-box glass-panel" data-v-6a20ed98><h2 data-v-6a20ed98>SMART MAP GENERATION</h2><div class="progress-section" data-v-6a20ed98><div class="progress-bar" data-v-6a20ed98><div class="fill" style="${ssrRenderStyle({ width: smartGenProgress.value + "%" })}" data-v-6a20ed98></div></div><span class="status-text" data-v-6a20ed98>${ssrInterpolate(getStatusText(smartGenStatus.value))} (${ssrInterpolate(smartGenProgress.value.toFixed(0))}%)</span></div><div class="log-console" data-v-6a20ed98><!--[-->`);
        ssrRenderList(smartGenLog.value, (line, i) => {
          _push(`<div class="log-line" data-v-6a20ed98>${ssrInterpolate(line)}</div>`);
        });
        _push(`<!--]--></div><div class="modal-actions" data-v-6a20ed98><button${ssrIncludeBooleanAttr(isGenerating.value && smartGenProgress.value < 100) ? " disabled" : ""} class="control-btn exit" data-v-6a20ed98>CLOSE</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/editor.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const editor = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6a20ed98"]]);

export { editor as default };
//# sourceMappingURL=editor-BEi6zD9b.mjs.map
