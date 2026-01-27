import { defineComponent, ref, computed, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderList, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "maps-page" }, _attrs))} data-v-a06a8dc1><div class="background-anim" data-v-a06a8dc1></div><div class="container" data-v-a06a8dc1><header class="page-header" data-v-a06a8dc1><h1 class="title" data-v-a06a8dc1>MAP_DATABASE</h1><div class="tabs" data-v-a06a8dc1><button class="${ssrRenderClass(["tab-btn", { active: currentTab.value === "my" }])}" data-v-a06a8dc1> MY_ENTRIES </button><button class="${ssrRenderClass(["tab-btn", { active: currentTab.value === "shared" }])}" data-v-a06a8dc1> GLOBAL_UPLOADS </button></div></header>`);
      if (!loading.value) {
        _push(`<div class="map-grid" data-v-a06a8dc1><!--[-->`);
        ssrRenderList(filteredMaps.value, (map) => {
          _push(`<div class="map-card" data-v-a06a8dc1><div class="card-header" data-v-a06a8dc1><span class="diff-tag" style="${ssrRenderStyle({ color: getDiffColor(map.difficulty) })}" data-v-a06a8dc1> DIFF: ${ssrInterpolate(map.difficulty)}</span>`);
          if (map.isVerified) {
            _push(`<span class="verified-tag" data-v-a06a8dc1>✓ VERIFIED</span>`);
          } else {
            _push(`<!---->`);
          }
          if (map.rating > 0) {
            _push(`<span class="rating-tag" data-v-a06a8dc1> RATE: ★${ssrInterpolate(map.rating.toFixed(1))}</span>`);
          } else {
            _push(`<span class="rating-tag empty" data-v-a06a8dc1> RATE: - </span>`);
          }
          _push(`<span class="date" data-v-a06a8dc1>${ssrInterpolate(new Date(map.createdAt).toLocaleDateString())}</span></div><h3 class="map-title" data-v-a06a8dc1>${ssrInterpolate(map.title)}</h3><div class="map-info" data-v-a06a8dc1><span class="creator" data-v-a06a8dc1>BY: ${ssrInterpolate(map.creatorName)}</span><span class="duration" data-v-a06a8dc1>${ssrInterpolate(Math.floor(map.duration))}s</span>`);
          if (map.myBestProgress !== void 0) {
            _push(`<span class="my-progress" data-v-a06a8dc1>MY: ${ssrInterpolate(Math.floor(map.myBestProgress))}%</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="actions" data-v-a06a8dc1><button class="action-btn play" data-v-a06a8dc1>PLAY</button>`);
          if (currentTab.value === "my") {
            _push(`<!--[--><button class="action-btn edit" data-v-a06a8dc1>EDIT</button><button class="action-btn rename" data-v-a06a8dc1>RENAME</button><button class="action-btn share"${ssrIncludeBooleanAttr(!map.autoplayLog || map.autoplayLog.length === 0) ? " disabled" : ""}${ssrRenderAttr("title", !map.autoplayLog || map.autoplayLog.length === 0 ? "AI 검증된 맵만 공유 가능" : "")} data-v-a06a8dc1>${ssrInterpolate(map.isShared ? "PRIVATE" : "SHARE")}</button><button class="action-btn delete" data-v-a06a8dc1>DEL</button><!--]-->`);
          } else {
            _push(`<!---->`);
          }
          if (currentTab.value === "shared" && map.isVerified) {
            _push(`<button class="action-btn rate" data-v-a06a8dc1>RATE</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]-->`);
        if (renamingMap.value) {
          _push(`<div class="rename-modal" data-v-a06a8dc1><div class="modal-content glass-panel" data-v-a06a8dc1><h3 data-v-a06a8dc1>RENAME_ENTRY</h3><input${ssrRenderAttr("value", newTitle.value)} placeholder="Enter new title..." data-v-a06a8dc1><div class="modal-actions" data-v-a06a8dc1><button class="confirm" data-v-a06a8dc1>CONFIRM</button><button class="cancel" data-v-a06a8dc1>CANCEL</button></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (ratingMap.value) {
          _push(`<div class="rename-modal" data-v-a06a8dc1><div class="modal-content glass-panel" data-v-a06a8dc1><h3 data-v-a06a8dc1>RATE_MAP</h3><p class="rating-info" data-v-a06a8dc1>${ssrInterpolate(ratingMap.value.title)}</p><div class="rating-slider-container" data-v-a06a8dc1><input type="range" min="1" max="30"${ssrRenderAttr("value", newRating.value)} class="rating-slider" data-v-a06a8dc1><span class="rating-value" style="${ssrRenderStyle({ color: getDiffColor(newRating.value) })}" data-v-a06a8dc1>${ssrInterpolate(newRating.value)}</span></div><div class="modal-actions" data-v-a06a8dc1><button class="confirm" data-v-a06a8dc1>SUBMIT</button><button class="cancel" data-v-a06a8dc1>CANCEL</button></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (filteredMaps.value.length === 0) {
          _push(`<div class="empty-state" data-v-a06a8dc1> NO DATA FOUND IN THIS SECTOR </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="loading-state" data-v-a06a8dc1> ACCESSING DATABASE... </div>`);
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
const maps = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a06a8dc1"]]);

export { maps as default };
//# sourceMappingURL=maps-Ds3p3UYb.mjs.map
