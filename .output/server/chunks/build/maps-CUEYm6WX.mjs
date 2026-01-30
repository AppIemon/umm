import { defineComponent, ref, computed, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderList, ssrRenderStyle, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { a as useAuth } from './server.mjs';
import { useRouter } from 'vue-router';
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
  __name: "maps",
  __ssrInlineRender: true,
  setup(__props) {
    const { user } = useAuth();
    useRouter();
    const currentTab = ref("my");
    const maps2 = ref([]);
    const loading = ref(true);
    const renamingMap = ref(null);
    const newTitle = ref("");
    const ratingMap = ref(null);
    const newRating = ref(15);
    const fetchMaps = async () => {
      loading.value = true;
      try {
        const creator = currentTab.value === "my" ? user.value?.username || "Guest" : void 0;
        const shared = currentTab.value === "shared" ? "true" : void 0;
        maps2.value = await $fetch("/api/maps", {
          query: { creator, shared }
        });
      } catch (e) {
        console.error("Fetch maps error:", e);
      } finally {
        loading.value = false;
      }
    };
    const filteredMaps = computed(() => maps2.value);
    const getDiffColor = (d) => {
      if (d < 8) return "#00ff88";
      if (d < 16) return "#ffff00";
      if (d < 24) return "#ff8800";
      return "#ff4444";
    };
    watch(currentTab, fetchMaps);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "maps-page" }, _attrs))} data-v-f167607d><div class="background-anim" data-v-f167607d></div><div class="container" data-v-f167607d><header class="page-header" data-v-f167607d><h1 class="title" data-v-f167607d>MAP_DATABASE</h1><div class="tabs" data-v-f167607d><button class="${ssrRenderClass(["tab-btn", { active: currentTab.value === "my" }])}" data-v-f167607d> MY_ENTRIES </button><button class="${ssrRenderClass(["tab-btn", { active: currentTab.value === "shared" }])}" data-v-f167607d> GLOBAL_UPLOADS </button></div></header>`);
      if (!loading.value) {
        _push(`<div class="map-grid" data-v-f167607d><!--[-->`);
        ssrRenderList(filteredMaps.value, (map) => {
          _push(`<div class="${ssrRenderClass(["map-card", { "is-verified": map.isVerified }])}" data-v-f167607d><div class="card-header" data-v-f167607d><span class="diff-tag" style="${ssrRenderStyle({ color: getDiffColor(map.difficulty) })}" data-v-f167607d> DIFF: ${ssrInterpolate(map.difficulty)}</span>`);
          if (map.isVerified) {
            _push(`<span class="verified-tag" data-v-f167607d>✓ VERIFIED</span>`);
          } else {
            _push(`<!---->`);
          }
          if (map.rating > 0) {
            _push(`<span class="rating-tag" data-v-f167607d> RATE: ★${ssrInterpolate(map.rating.toFixed(1))}</span>`);
          } else {
            _push(`<span class="rating-tag empty" data-v-f167607d> RATE: - </span>`);
          }
          _push(`<span class="date" data-v-f167607d>${ssrInterpolate(new Date(map.createdAt).toLocaleDateString())}</span></div><h3 class="map-title" data-v-f167607d>${ssrInterpolate(map.title)} `);
          if (map.isVerified) {
            _push(`<span class="verified-icon" title="Verified Map" data-v-f167607d>✓</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</h3><div class="map-info" data-v-f167607d><span class="creator" data-v-f167607d>BY: ${ssrInterpolate(map.creatorName)}</span><span class="duration" data-v-f167607d>${ssrInterpolate(Math.floor(map.duration))}s</span>`);
          if (map.myBestProgress !== void 0) {
            _push(`<span class="my-progress" data-v-f167607d>MY: ${ssrInterpolate(Math.floor(map.myBestProgress))}%</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="actions" data-v-f167607d><button class="action-btn play" data-v-f167607d>PLAY</button>`);
          if (currentTab.value === "my") {
            _push(`<!--[--><button class="action-btn edit" data-v-f167607d>EDIT</button><button class="action-btn rename" data-v-f167607d>RENAME</button><button class="action-btn share" data-v-f167607d>${ssrInterpolate(map.isShared ? "PRIVATE" : "SHARE")}</button><button class="action-btn delete" data-v-f167607d>DEL</button><!--]-->`);
          } else {
            _push(`<!---->`);
          }
          if (currentTab.value === "shared" && map.isVerified) {
            _push(`<button class="action-btn rate" data-v-f167607d>RATE</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]-->`);
        if (renamingMap.value) {
          _push(`<div class="rename-modal" data-v-f167607d><div class="modal-content glass-panel" data-v-f167607d><h3 data-v-f167607d>RENAME_ENTRY</h3><input${ssrRenderAttr("value", newTitle.value)} placeholder="Enter new title..." data-v-f167607d><div class="modal-actions" data-v-f167607d><button class="confirm" data-v-f167607d>CONFIRM</button><button class="cancel" data-v-f167607d>CANCEL</button></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (ratingMap.value) {
          _push(`<div class="rename-modal" data-v-f167607d><div class="modal-content glass-panel" data-v-f167607d><h3 data-v-f167607d>RATE_MAP</h3><p class="rating-info" data-v-f167607d>${ssrInterpolate(ratingMap.value.title)}</p><div class="rating-slider-container" data-v-f167607d><input type="range" min="1" max="30"${ssrRenderAttr("value", newRating.value)} class="rating-slider" data-v-f167607d><span class="rating-value" style="${ssrRenderStyle({ color: getDiffColor(newRating.value) })}" data-v-f167607d>${ssrInterpolate(newRating.value)}</span></div><div class="modal-actions" data-v-f167607d><button class="confirm" data-v-f167607d>SUBMIT</button><button class="cancel" data-v-f167607d>CANCEL</button></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (filteredMaps.value.length === 0) {
          _push(`<div class="empty-state" data-v-f167607d> NO DATA FOUND IN THIS SECTOR </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="loading-state" data-v-f167607d> ACCESSING DATABASE... </div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/maps.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const maps = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f167607d"]]);

export { maps as default };
//# sourceMappingURL=maps-CUEYm6WX.mjs.map
