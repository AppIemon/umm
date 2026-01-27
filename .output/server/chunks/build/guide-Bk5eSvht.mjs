import { _ as __nuxt_component_0 } from './nuxt-link-6iJx3ywR.mjs';
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "guide",
  __ssrInlineRender: true,
  setup(__props) {
    const currentStep = ref(0);
    const steps = [
      {
        title: "기본 조작 (CONTROLS)",
        desc: "스페이스바나 마우스 왼쪽 버튼을 길게 누르면 위로 올라가고, 떼면 아래로 내려옵니다. 파도처럼 리듬을 타보세요!"
      },
      {
        title: "포탈 시스템 (PORTALS)",
        desc: "다양한 포탈을 통과하면 속도가 빨라지거나, 중력이 반대로 바뀌거나, 기체가 작아집니다. 변화에 빠르게 적응하세요!"
      },
      {
        title: "생존 전략 (STRATEGY)",
        desc: "음악의 비트에 맞춰 장애물이 등장합니다. 눈으로만 보지 말고, 귀로 들으며 리듬을 타면 더 쉽게 피할 수 있습니다."
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "guide-page" }, _attrs))} data-v-d5c276fc><div class="background-anim" data-v-d5c276fc></div><div class="guide-container" data-v-d5c276fc><h1 class="page-title" data-v-d5c276fc>GAME GUIDE</h1><div class="guide-card" data-v-d5c276fc><div class="step-image" data-v-d5c276fc>`);
      if (currentStep.value === 0) {
        _push(`<div class="demo-box input-demo" data-v-d5c276fc><div class="key-icon space" data-v-d5c276fc>SPACE</div><div class="key-icon mouse" data-v-d5c276fc>CLICK</div><p data-v-d5c276fc>누르고 있으면 <strong data-v-d5c276fc>상승</strong><br data-v-d5c276fc>떼면 <strong data-v-d5c276fc>하강</strong></p></div>`);
      } else {
        _push(`<!---->`);
      }
      if (currentStep.value === 1) {
        _push(`<div class="demo-box portal-demo" data-v-d5c276fc><div class="portal-row" data-v-d5c276fc><span class="p-icon speed" data-v-d5c276fc>&gt;&gt;</span><span data-v-d5c276fc>속도 변화</span></div><div class="portal-row" data-v-d5c276fc><span class="p-icon gravity" data-v-d5c276fc>⟳</span><span data-v-d5c276fc>중력 반전</span></div><div class="portal-row" data-v-d5c276fc><span class="p-icon mini" data-v-d5c276fc>◆</span><span data-v-d5c276fc>미니 모드</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (currentStep.value === 2) {
        _push(`<div class="demo-box tips-demo" data-v-d5c276fc><div class="tip-item" data-v-d5c276fc>⚡ <strong data-v-d5c276fc>붉은색</strong>은 장애물입니다. 피하세요!</div><div class="tip-item" data-v-d5c276fc>🎵 <strong data-v-d5c276fc>박자</strong>에 맞춰 움직이는게 중요합니다.</div><div class="tip-item" data-v-d5c276fc>★ <strong data-v-d5c276fc>100%</strong> 완주에 도전하세요!</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="step-text" data-v-d5c276fc><h3 data-v-d5c276fc>${ssrInterpolate(steps[currentStep.value].title)}</h3><p data-v-d5c276fc>${ssrInterpolate(steps[currentStep.value].desc)}</p></div><div class="guide-nav" data-v-d5c276fc><!--[-->`);
      ssrRenderList(steps, (s, i) => {
        _push(`<button class="${ssrRenderClass([{ active: i === currentStep.value }, "nav-dot"])}" data-v-d5c276fc>${ssrInterpolate(s.title)}</button>`);
      });
      _push(`<!--]--></div></div><div class="actions" data-v-d5c276fc>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/play",
        class: "action-btn"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`PLAY NOW`);
          } else {
            return [
              createTextVNode("PLAY NOW")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/guide.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const guide = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d5c276fc"]]);

export { guide as default };
//# sourceMappingURL=guide-Bk5eSvht.mjs.map
