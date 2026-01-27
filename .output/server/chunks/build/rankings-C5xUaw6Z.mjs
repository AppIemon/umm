import { _ as __nuxt_component_0 } from './nuxt-link-6iJx3ywR.mjs';
import { ref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
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
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = {
  __name: "rankings",
  __ssrInlineRender: true,
  setup(__props) {
    const scores = ref([]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "rankings-page" }, _attrs))} data-v-8af7a897><div class="background-anim" data-v-8af7a897></div><div class="header" data-v-8af7a897><h1 class="title" data-v-8af7a897>HALL OF SYNCHRONIZATION</h1>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "back-btn"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`RETURN`);
          } else {
            return [
              createTextVNode("RETURN")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="rank-list glass-panel" data-v-8af7a897>`);
      if (scores.value.length === 0) {
        _push(`<div class="no-scores" data-v-8af7a897>NO DATA RECORDED</div>`);
      } else {
        _push(`<!--[-->`);
        ssrRenderList(scores.value, (s, i) => {
          _push(`<div class="rank-item" data-v-8af7a897><div class="${ssrRenderClass([{ "top-3": i < 3 }, "rank-pos"])}" data-v-8af7a897>#${ssrInterpolate(i + 1)}</div><div class="score-data" data-v-8af7a897><span class="score-val" data-v-8af7a897>${ssrInterpolate(s.score)}</span><span class="score-label" data-v-8af7a897>TILES</span></div><span class="date" data-v-8af7a897>${ssrInterpolate(new Date(s.date).toLocaleDateString())}</span></div>`);
        });
        _push(`<!--]-->`);
      }
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/rankings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const rankings = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8af7a897"]]);

export { rankings as default };
//# sourceMappingURL=rankings-C5xUaw6Z.mjs.map
