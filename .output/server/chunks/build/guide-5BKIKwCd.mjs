import { _ as __nuxt_component_0$1 } from './nuxt-link-6iJx3ywR.mjs';
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { _ as __nuxt_component_0 } from './GameCanvas-BsmqE8-y.mjs';
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
import './game-engine-WKw9rqTg.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "guide",
  __ssrInlineRender: true,
  setup(__props) {
    const currentStep = ref(0);
    const isGameMode = ref(false);
    const audioBuffer = ref(null);
    const mapData = ref(null);
    const guideMessage = ref("");
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
    const finishTutorial = () => {
      alert("훌륭합니다! 이제 실전으로 갈 준비가 되었습니다.");
      isGameMode.value = false;
    };
    const handleProgress = (data) => {
      const p = data.progress;
      if (p < 5) guideMessage.value = "튜토리얼을 시작합니다.<br>장애물을 피해 끝까지 생존하세요!";
      else if (p < 15) guideMessage.value = "바닥의 가시는 <strong>점프(클릭 유지)</strong>하여 피하세요.";
      else if (p < 25) guideMessage.value = "천장의 가시는 <strong>버튼을 떼서</strong> 피하세요.";
      else if (p < 35) guideMessage.value = "<strong>속도 변화 포탈</strong>입니다.<br>속도가 느려지거나 빨라집니다.";
      else if (p < 45) guideMessage.value = "중앙에 있는 <strong>톱니바퀴</strong>와 <strong>레이저</strong>를 주의하세요!";
      else if (p < 55) guideMessage.value = "이제 <strong>미니 모드</strong>입니다.<br>몸이 작아지고 더 민첩해집니다.";
      else if (p < 65) guideMessage.value = "좁은 틈 사이를 조심해서 통과하세요!";
      else if (p < 75) guideMessage.value = "<strong>중력 반전</strong>!<br>이제 위아래 조작이 반대가 됩니다.";
      else if (p < 85) guideMessage.value = "빠른 속도에 적응하세요!<br>마지막 관문입니다.";
      else if (p < 95) guideMessage.value = "거의 다 왔습니다! 조금만 더!";
      else guideMessage.value = "축하합니다!<br>튜토리얼 완료!";
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "guide-page" }, _attrs))} data-v-fcd3c431><div class="background-anim" data-v-fcd3c431></div>`);
      if (isGameMode.value) {
        _push(`<div class="game-view" data-v-fcd3c431>`);
        _push(ssrRenderComponent(__nuxt_component_0, {
          class: "guide-game",
          audioBuffer: audioBuffer.value,
          obstacles: mapData.value.beatTimes,
          sections: mapData.value.sections,
          loadMap: mapData.value,
          difficulty: 1,
          tutorialMode: true,
          invincible: false,
          onExit: ($event) => isGameMode.value = false,
          onComplete: finishTutorial,
          onProgressUpdate: handleProgress
        }, null, _parent));
        if (isGameMode.value) {
          _push(`<div class="tutorial-overlay" data-v-fcd3c431>`);
          if (guideMessage.value) {
            _push(`<div class="message-box" data-v-fcd3c431><div class="message-content" data-v-fcd3c431>${guideMessage.value ?? ""}</div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="key-guide" data-v-fcd3c431><span data-v-fcd3c431>HOLD SPACE = UP</span><span data-v-fcd3c431>RELEASE = DOWN</span></div><button class="exit-btn" data-v-fcd3c431>EXIT TUTORIAL</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="guide-container" data-v-fcd3c431><h1 class="page-title" data-v-fcd3c431>GAME GUIDE</h1><div class="guide-card" data-v-fcd3c431><div class="step-image" data-v-fcd3c431>`);
        if (currentStep.value === 0) {
          _push(`<div class="demo-box input-demo" data-v-fcd3c431><div class="key-icon space" data-v-fcd3c431>SPACE</div><div class="key-icon mouse" data-v-fcd3c431>CLICK</div><p data-v-fcd3c431>누르고 있으면 <strong data-v-fcd3c431>상승</strong><br data-v-fcd3c431>떼면 <strong data-v-fcd3c431>하강</strong></p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (currentStep.value === 1) {
          _push(`<div class="demo-box portal-demo" data-v-fcd3c431><div class="portal-row" data-v-fcd3c431><span class="p-icon speed" data-v-fcd3c431>&gt;&gt;</span><span data-v-fcd3c431>속도 변화</span></div><div class="portal-row" data-v-fcd3c431><span class="p-icon gravity" data-v-fcd3c431>⟳</span><span data-v-fcd3c431>중력 반전</span></div><div class="portal-row" data-v-fcd3c431><span class="p-icon mini" data-v-fcd3c431>◆</span><span data-v-fcd3c431>미니 모드</span></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (currentStep.value === 2) {
          _push(`<div class="demo-box tips-demo" data-v-fcd3c431><div class="tip-item" data-v-fcd3c431>⚡ <strong data-v-fcd3c431>붉은색</strong>은 장애물입니다. 피하세요!</div><div class="tip-item" data-v-fcd3c431>🎵 <strong data-v-fcd3c431>박자</strong>에 맞춰 움직이는게 중요합니다.</div><div class="tip-item" data-v-fcd3c431>★ <strong data-v-fcd3c431>100%</strong> 완주에 도전하세요!</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="step-text" data-v-fcd3c431><h3 data-v-fcd3c431>${ssrInterpolate(steps[currentStep.value].title)}</h3><p data-v-fcd3c431>${ssrInterpolate(steps[currentStep.value].desc)}</p></div><div class="guide-nav" data-v-fcd3c431><!--[-->`);
        ssrRenderList(steps, (s, i) => {
          _push(`<button class="${ssrRenderClass([{ active: i === currentStep.value }, "nav-dot"])}" data-v-fcd3c431>${ssrInterpolate(s.title)}</button>`);
        });
        _push(`<!--]--></div></div><div class="actions" data-v-fcd3c431><button class="action-btn tutorial-btn" data-v-fcd3c431> 🎮 TRY TUTORIAL GAME </button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/play",
          class: "action-btn play-btn"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`PLAY REAL GAME`);
            } else {
              return [
                createTextVNode("PLAY REAL GAME")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/guide.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const guide = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-fcd3c431"]]);

export { guide as default };
//# sourceMappingURL=guide-5BKIKwCd.mjs.map
