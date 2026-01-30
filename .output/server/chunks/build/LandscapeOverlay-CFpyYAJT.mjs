import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "landscape-overlay" }, _attrs))} data-v-d0e574bb><div class="content" data-v-d0e574bb><div class="icon" data-v-d0e574bb>📱</div><h1 data-v-d0e574bb>PLEASE ROTATE YOUR DEVICE</h1><p data-v-d0e574bb>This game is designed for landscape mode.</p></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LandscapeOverlay.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-d0e574bb"]]), { __name: "LandscapeOverlay" });

export { __nuxt_component_0 as _ };
//# sourceMappingURL=LandscapeOverlay-CFpyYAJT.mjs.map
