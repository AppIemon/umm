import { defineComponent, ref, watch, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { a as useAuth } from './server.mjs';
import { G as GameEngine } from './game-engine--bomXVDE.mjs';
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
      difficulty: 15,
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
    const obstacleTypes = ["spike", "block", "saw", "mini_spike", "laser", "spike_ball", "v_laser", "mine", "orb", "slope", "triangle", "steep_triangle", "piston_v", "falling_spike", "hammer", "rotor", "cannon", "spark_mine", "laser_beam", "crusher_jaw", "swing_blade", "growing_spike", "planet", "star", "invisible_wall", "fake_block"];
    const portalTypes = ["gravity_yellow", "gravity_blue", "speed_0.25", "speed_0.5", "speed_1", "speed_2", "speed_3", "speed_4", "mini_pink", "mini_green", "teleport_in", "teleport_out"];
    const getSymbol = (type) => engine.getPortalSymbol(type) || "■";
    const getPortalSymbol = (type) => engine.getPortalSymbol(type);
    ref([]);
    ref(-1);
    ref([]);
    ref(false);
    const isPreviewing = ref(false);
    ref(0);
    ref(200);
    ref(360);
    ref([]);
    ref(false);
    ref({ x1: 0, y1: 0, x2: 0, y2: 0 });
    const isMobile = ref(false);
    const showPalette = ref(true);
    const showProperties = ref(true);
    const showSmartGenModal = ref(false);
    const smartGenLog = ref([]);
    const smartGenProgress = ref(0);
    const smartGenStatus = ref("");
    const isGenerating = ref(false);
    const isTesting = ref(false);
    const isSaving = ref(false);
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
    const ensureCustomData = (obj) => {
      if (!obj.customData) {
        obj.customData = {};
      }
      return obj.customData;
    };
    const updateTotalLength = () => {
      totalLength.value = mapData.value.duration * 350 + 500;
    };
    const updateMapDurationIndices = () => {
      let maxX = 0;
      const obs = mapData.value.engineObstacles || [];
      const prt = mapData.value.enginePortals || [];
      for (let i = 0; i < obs.length; i++) {
        const right = obs[i].x + obs[i].width;
        if (right > maxX) maxX = right;
      }
      for (let i = 0; i < prt.length; i++) {
        const right = prt[i].x + prt[i].width;
        if (right > maxX) maxX = right;
      }
      const buffer = 1500;
      const targetLength = Math.max(2e3, maxX + buffer);
      const newDuration = Math.max(10, Math.ceil((targetLength - 500) / 350));
      if (mapData.value.duration !== newDuration) {
        mapData.value.duration = newDuration;
        updateTotalLength();
      }
    };
    watch(
      [
        () => mapData.value.engineObstacles,
        () => mapData.value.enginePortals
      ],
      () => {
        updateMapDurationIndices();
      },
      { deep: true }
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "editor-page" }, _attrs))} data-v-a5565fde><div class="background-anim" data-v-a5565fde></div><header class="editor-header glass-panel" data-v-a5565fde><div class="left" data-v-a5565fde><h1 class="title" data-v-a5565fde>MAP_ARCHITECT <span class="version" data-v-a5565fde>v2.0</span></h1><div class="map-meta" data-v-a5565fde><input${ssrRenderAttr("value", mapData.value.title)} placeholder="Map Title" class="map-title-input" data-v-a5565fde><span class="creator" data-v-a5565fde>BY: ${ssrInterpolate(unref(user)?.username || "Guest")}</span></div></div><div class="center" data-v-a5565fde><div class="transport-controls" data-v-a5565fde>`);
      if (isMobile.value) {
        _push(`<button class="${ssrRenderClass([{ active: showPalette.value }, "control-btn mobile-toggle"])}" data-v-a5565fde> 🎨 </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="control-btn test"${ssrIncludeBooleanAttr(isTesting.value) ? " disabled" : ""} data-v-a5565fde><span class="icon" data-v-a5565fde>▶</span> `);
      if (!isMobile.value) {
        _push(`<span data-v-a5565fde>${ssrInterpolate(isTesting.value ? "TESTING..." : "TEST")}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button><button class="${ssrRenderClass([{ active: isPreviewing.value }, "control-btn tutorial"])}" data-v-a5565fde><span class="icon" data-v-a5565fde>🎓</span> `);
      if (!isMobile.value) {
        _push(`<span data-v-a5565fde>${ssrInterpolate(isPreviewing.value ? "STOP" : "TUTORIAL")}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button><button class="control-btn save"${ssrIncludeBooleanAttr(isSaving.value) ? " disabled" : ""} data-v-a5565fde><span class="icon" data-v-a5565fde>💾</span> `);
      if (!isMobile.value) {
        _push(`<span data-v-a5565fde>${ssrInterpolate(isSaving.value ? "SAVING..." : "SAVE")}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button><button class="${ssrRenderClass([{ active: showHitboxes.value }, "control-btn"])}" data-v-a5565fde><span class="icon" data-v-a5565fde>⛶</span> `);
      if (!isMobile.value) {
        _push(`<span data-v-a5565fde>HITBOX</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button>`);
      if (isMobile.value) {
        _push(`<button class="${ssrRenderClass([{ active: showProperties.value }, "control-btn mobile-toggle"])}" data-v-a5565fde> ⚙️ </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="control-btn exit" data-v-a5565fde>`);
      if (!isMobile.value) {
        _push(`<span data-v-a5565fde>EXIT</span>`);
      } else {
        _push(`<span data-v-a5565fde>✕</span>`);
      }
      _push(`</button></div></div><div class="right" data-v-a5565fde><div class="config-summary" data-v-a5565fde><span class="stat" data-v-a5565fde>OBJ: ${ssrInterpolate(mapData.value.engineObstacles.length)}</span><span class="stat" data-v-a5565fde>PORT: ${ssrInterpolate(mapData.value.enginePortals.length)}</span></div></div></header><div class="${ssrRenderClass([{ "is-mobile": isMobile.value }, "main-layout"])}" data-v-a5565fde><aside class="${ssrRenderClass([{ "mobile-drawer": isMobile.value, "open": showPalette.value }, "sidebar left-sidebar glass-panel"])}" data-v-a5565fde>`);
      if (isMobile.value) {
        _push(`<div class="drawer-header" data-v-a5565fde><h3 data-v-a5565fde>PALETTE</h3><button class="close-drawer" data-v-a5565fde>✕</button></div>`);
      } else {
        _push(`<h3 data-v-a5565fde>PALETTE</h3>`);
      }
      _push(`<div class="object-list" data-v-a5565fde><!--[-->`);
      ssrRenderList(obstacleTypes, (type) => {
        _push(`<div class="${ssrRenderClass([{ selected: selectedPaletteType.value === type }, "palette-item"])}" data-v-a5565fde><div class="symbol" data-v-a5565fde>${ssrInterpolate(getSymbol(type))}</div><span class="name" data-v-a5565fde>${ssrInterpolate(type.split("_").join(" ").toUpperCase())}</span></div>`);
      });
      _push(`<!--]--><div class="separator" data-v-a5565fde>PORTALS</div><!--[-->`);
      ssrRenderList(portalTypes, (type) => {
        _push(`<div class="${ssrRenderClass([{ selected: selectedPaletteType.value === type }, "palette-item portal"])}" data-v-a5565fde><div class="symbol" data-v-a5565fde>${ssrInterpolate(getPortalSymbol(type))}</div><span class="name" data-v-a5565fde>${ssrInterpolate(type.split("_").join(" ").toUpperCase())}</span></div>`);
      });
      _push(`<!--]--></div></aside><main class="workspace glass-panel" data-v-a5565fde><canvas width="1200" height="600" class="editor-canvas" data-v-a5565fde></canvas><div class="grid-info" data-v-a5565fde><span data-v-a5565fde>ZOOM: ${ssrInterpolate((zoom.value * 100).toFixed(0))}%</span><span data-v-a5565fde>X: ${ssrInterpolate(Math.floor(cameraX.value))}</span></div><div class="timeline-container" data-v-a5565fde><input type="range" min="0"${ssrRenderAttr("max", totalLength.value)}${ssrRenderAttr("value", cameraX.value)} class="timeline-slider" data-v-a5565fde></div></main><aside class="${ssrRenderClass([{ "mobile-drawer": isMobile.value, "open": showProperties.value }, "sidebar right-sidebar glass-panel"])}" data-v-a5565fde>`);
      if (isMobile.value) {
        _push(`<div class="drawer-header" data-v-a5565fde><h3 data-v-a5565fde>PROPERTIES</h3><button class="close-drawer" data-v-a5565fde>✕</button></div>`);
      } else {
        _push(`<h3 data-v-a5565fde>PROPERTIES</h3>`);
      }
      if (selectedObjects.value.length === 1) {
        _push(`<div class="properties-list" data-v-a5565fde><div class="prop-group" data-v-a5565fde><label data-v-a5565fde>TYPE</label><span class="prop-val-static" data-v-a5565fde>${ssrInterpolate(selectedObjects.value[0].type.toUpperCase())}</span></div><div class="prop-group" data-v-a5565fde><label data-v-a5565fde>POSITION X / Y</label><div class="input-pair" data-v-a5565fde><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].x)} data-v-a5565fde><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].y)} data-v-a5565fde></div></div><div class="prop-group" data-v-a5565fde><label data-v-a5565fde>SIZE W / H</label><div class="input-pair" data-v-a5565fde><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].width)} data-v-a5565fde><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].height)} data-v-a5565fde></div></div><div class="prop-group" data-v-a5565fde><label data-v-a5565fde>ROTATION (DEG)</label><div class="rotation-controls" data-v-a5565fde><button title="Rotate -45" class="rot-btn" data-v-a5565fde>↺</button><button title="Rotate 45" class="rot-btn" data-v-a5565fde>↻</button><button title="Rotate 90" class="rot-btn" data-v-a5565fde>90°</button><button title="Rotate 180" class="rot-btn" data-v-a5565fde>180°</button></div><div class="input-pair" data-v-a5565fde><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].angle)} data-v-a5565fde><input type="range" min="0" max="360"${ssrRenderAttr("value", selectedObjects.value[0].angle)} data-v-a5565fde></div></div>`);
        if (selectedObjects.value[0].movement) {
          _push(`<div class="prop-group" data-v-a5565fde><label data-v-a5565fde>MOVEMENT TYPE</label><select${ssrRenderAttr("value", selectedObjects.value[0].movement.type)} data-v-a5565fde><option value="none" data-v-a5565fde>NONE</option><option value="updown" data-v-a5565fde>UP-DOWN</option><option value="leftright" data-v-a5565fde>LEFT-RIGHT</option><option value="rotate" data-v-a5565fde>ROTATE</option><option value="bounce" data-v-a5565fde>BOUNCE</option></select>`);
          if (selectedObjects.value[0].movement.type !== "none") {
            _push(`<!--[--><label data-v-a5565fde>SPEED / RANGE</label><div class="input-pair" data-v-a5565fde><input type="number" step="0.1"${ssrRenderAttr("value", selectedObjects.value[0].movement.speed)} placeholder="Speed" data-v-a5565fde><input type="number"${ssrRenderAttr("value", selectedObjects.value[0].movement.range)} placeholder="Range" data-v-a5565fde></div><label data-v-a5565fde>PHASE OFFSET</label><input type="number" step="0.1"${ssrRenderAttr("value", selectedObjects.value[0].movement.phase)} data-v-a5565fde><!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (["planet", "star"].includes(selectedObjects.value[0].type)) {
          _push(`<!--[-->`);
          if (selectedObjects.value[0].type === "planet") {
            _push(`<div data-v-a5565fde><label data-v-a5565fde>ORBIT MOON COUNT</label><input type="number"${ssrRenderAttr("value", ensureCustomData(selectedObjects.value[0]).orbitCount)} placeholder="0 or 2" data-v-a5565fde></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<label data-v-a5565fde>ORBIT SPEED</label><input type="number" step="0.1"${ssrRenderAttr("value", ensureCustomData(selectedObjects.value[0]).orbitSpeed)} placeholder="Speed" data-v-a5565fde><label data-v-a5565fde>ORBIT DISTANCE</label><input type="number"${ssrRenderAttr("value", ensureCustomData(selectedObjects.value[0]).orbitDistance)} placeholder="Distance" data-v-a5565fde>`);
          if (selectedObjects.value[0].type === "star") {
            _push(`<div class="hint-text" data-v-a5565fde> Drag a Planet onto this Star to attach it! </div>`);
          } else {
            _push(`<!---->`);
          }
          if (selectedObjects.value[0].children && selectedObjects.value[0].children.length > 0) {
            _push(`<div class="children-list" data-v-a5565fde><label data-v-a5565fde>ATTACHED PLANETS: ${ssrInterpolate(selectedObjects.value[0].children.length)}</label><!--[-->`);
            ssrRenderList(selectedObjects.value[0].children, (child, idx) => {
              _push(`<div class="child-item" data-v-a5565fde><span data-v-a5565fde>Planet ${ssrInterpolate(idx + 1)}</span></div>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="delete-btn" data-v-a5565fde>DELETE OBJECT</button></div>`);
      } else if (selectedObjects.value.length > 1) {
        _push(`<div class="properties-list" data-v-a5565fde><div class="prop-group" data-v-a5565fde><label data-v-a5565fde>MULTIPLE SELECTION</label><span class="prop-val-static" data-v-a5565fde>${ssrInterpolate(selectedObjects.value.length)} OBJECTS</span></div><button class="delete-btn" data-v-a5565fde>DELETE ALL</button></div>`);
      } else {
        _push(`<div class="empty-selection" data-v-a5565fde> SELECT OBJECTS TO MODIFY </div>`);
      }
      _push(`<div class="global-settings prop-group" data-v-a5565fde><h3 data-v-a5565fde>LEVEL CONFIG</h3></div><div class="audio-settings prop-group" data-v-a5565fde><h3 data-v-a5565fde>AUDIO CONFIG</h3><label data-v-a5565fde>BPM</label><input type="number"${ssrRenderAttr("value", mapData.value.bpm)} data-v-a5565fde><label data-v-a5565fde>MEASURE LENGTH (S)</label><input type="number" step="0.1"${ssrRenderAttr("value", mapData.value.measureLength)} data-v-a5565fde><div class="audio-upload" data-v-a5565fde><label data-v-a5565fde>AUDIO FILE</label><button class="upload-btn" data-v-a5565fde>${ssrInterpolate(mapData.value.audioData ? "AUDIO LOADED" : "UPLOAD MP3")}</button><input type="file" accept="audio/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-a5565fde>`);
      if (mapData.value.audioData) {
        _push(`<p class="audio-hint" data-v-a5565fde>Audio embedded in map data</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></aside></div>`);
      if (showSmartGenModal.value) {
        _push(`<div class="modal-overlay" data-v-a5565fde><div class="modal-box glass-panel" data-v-a5565fde><h2 data-v-a5565fde>SMART MAP GENERATION</h2><div class="progress-section" data-v-a5565fde><div class="progress-bar" data-v-a5565fde><div class="fill" style="${ssrRenderStyle({ width: smartGenProgress.value + "%" })}" data-v-a5565fde></div></div><span class="status-text" data-v-a5565fde>${ssrInterpolate(getStatusText(smartGenStatus.value))} (${ssrInterpolate(smartGenProgress.value.toFixed(0))}%)</span></div><div class="log-console" data-v-a5565fde><!--[-->`);
        ssrRenderList(smartGenLog.value, (line, i) => {
          _push(`<div class="log-line" data-v-a5565fde>${ssrInterpolate(line)}</div>`);
        });
        _push(`<!--]--></div><div class="modal-actions" data-v-a5565fde><button${ssrIncludeBooleanAttr(isGenerating.value && smartGenProgress.value < 100) ? " disabled" : ""} class="control-btn exit" data-v-a5565fde>CLOSE</button></div></div></div>`);
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
const editor = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a5565fde"]]);

export { editor as default };
//# sourceMappingURL=editor-CsrgrzB5.mjs.map
