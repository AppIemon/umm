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
      if (d < 4) return "#00ff88";
      if (d < 7) return "#ffff00";
      return "#ff4444";
    };
    watch(currentTab, fetchMaps);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "maps-page" }, _attrs))} data-v-5846ad1c><div class="background-anim" data-v-5846ad1c></div><div class="container" data-v-5846ad1c><header class="page-header" data-v-5846ad1c><h1 class="title" data-v-5846ad1c>MAP_DATABASE</h1><div class="tabs" data-v-5846ad1c><button class="${ssrRenderClass(["tab-btn", { active: currentTab.value === "my" }])}" data-v-5846ad1c> MY_ENTRIES </button><button class="${ssrRenderClass(["tab-btn", { active: currentTab.value === "shared" }])}" data-v-5846ad1c> GLOBAL_UPLOADS </button></div></header>`);
      if (!loading.value) {
        _push(`<div class="map-grid" data-v-5846ad1c><!--[-->`);
        ssrRenderList(filteredMaps.value, (map) => {
          _push(`<div class="map-card" data-v-5846ad1c><div class="card-header" data-v-5846ad1c><span class="diff-tag" style="${ssrRenderStyle({ color: getDiffColor(map.difficulty) })}" data-v-5846ad1c> DIFF: ${ssrInterpolate(map.difficulty)}</span>`);
          if (map.rating > 0) {
            _push(`<span class="rating-tag" data-v-5846ad1c> RATE: ★${ssrInterpolate(map.rating)}</span>`);
          } else {
            _push(`<span class="rating-tag empty" data-v-5846ad1c> RATE: - </span>`);
          }
          _push(`<span class="date" data-v-5846ad1c>${ssrInterpolate(new Date(map.createdAt).toLocaleDateString())}</span></div><h3 class="map-title" data-v-5846ad1c>${ssrInterpolate(map.title)}</h3><div class="map-info" data-v-5846ad1c><span class="creator" data-v-5846ad1c>BY: ${ssrInterpolate(map.creatorName)}</span><span class="duration" data-v-5846ad1c>${ssrInterpolate(Math.floor(map.duration))}s</span></div><div class="actions" data-v-5846ad1c><button class="action-btn play" data-v-5846ad1c>PLAY</button>`);
          if (currentTab.value === "my") {
            _push(`<!--[--><button class="action-btn edit" data-v-5846ad1c>EDIT</button><button class="action-btn rename" data-v-5846ad1c>RENAME</button><button class="action-btn share" data-v-5846ad1c>${ssrInterpolate(map.isShared ? "PRIVATE" : "SHARE")}</button><button class="action-btn delete" data-v-5846ad1c>DEL</button><!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]-->`);
        if (renamingMap.value) {
          _push(`<div class="rename-modal" data-v-5846ad1c><div class="modal-content glass-panel" data-v-5846ad1c><h3 data-v-5846ad1c>RENAME_ENTRY</h3><input${ssrRenderAttr("value", newTitle.value)} placeholder="Enter new title..." data-v-5846ad1c><div class="modal-actions" data-v-5846ad1c><button class="confirm" data-v-5846ad1c>CONFIRM</button><button class="cancel" data-v-5846ad1c>CANCEL</button></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (filteredMaps.value.length === 0) {
          _push(`<div class="empty-state" data-v-5846ad1c> NO DATA FOUND IN THIS SECTOR </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="loading-state" data-v-5846ad1c> ACCESSING DATABASE... </div>`);
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
const maps = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-5846ad1c"]]);

export { maps as default };
//# sourceMappingURL=maps-Ca1g0v1R.mjs.map
