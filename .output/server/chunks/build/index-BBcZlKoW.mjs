import { _ as __nuxt_component_0 } from './nuxt-link-6iJx3ywR.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { a as useAuth } from './server.mjs';
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
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { user } = useAuth();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "menu-container" }, _attrs))} data-v-48a5bc0f><div class="wave-bg" data-v-48a5bc0f><div class="wave wave1" data-v-48a5bc0f></div><div class="wave wave2" data-v-48a5bc0f></div><div class="wave wave3" data-v-48a5bc0f></div></div><div class="hero-content" data-v-48a5bc0f><div class="logo-container" data-v-48a5bc0f><div class="wave-icon-large" data-v-48a5bc0f>◆</div><h1 class="game-title-main" data-v-48a5bc0f>ULTRA MUSIC MANIA</h1></div><p class="subtitle" data-v-48a5bc0f>GEOMETRY • RHYTHM • WAVE</p><div class="actions" data-v-48a5bc0f>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/play",
        class: "play-btn-large"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`SINGLE PLAY`);
          } else {
            return [
              createTextVNode("SINGLE PLAY")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/multiplayer",
        class: "play-btn-large secondary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`MULTIPLAYER`);
          } else {
            return [
              createTextVNode("MULTIPLAYER")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(user)) {
        _push(`<div class="user-preview" data-v-48a5bc0f><span class="welcome" data-v-48a5bc0f>WELCOME, <strong data-v-48a5bc0f>${ssrInterpolate(unref(user).username)}</strong></span><div class="user-stats" data-v-48a5bc0f><span class="rating" data-v-48a5bc0f>RATING: ${ssrInterpolate(unref(user).rating || 1e3)}</span>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/mypage",
          class: "profile-link"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`[ PROFILE ]`);
            } else {
              return [
                createTextVNode("[ PROFILE ]")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<div class="auth-actions" data-v-48a5bc0f>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/login",
          class: "auth-btn"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`LOGIN`);
            } else {
              return [
                createTextVNode("LOGIN")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/register",
          class: "auth-btn"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`REGISTER`);
            } else {
              return [
                createTextVNode("REGISTER")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`<div class="stats-preview" data-v-48a5bc0f><div class="stat-box" data-v-48a5bc0f><span class="val" data-v-48a5bc0f>${ssrInterpolate(unref(user)?.matchHistory?.length || 0)}</span><span class="lbl" data-v-48a5bc0f>BATTLES</span></div><div class="stat-box" data-v-48a5bc0f><span class="val" data-v-48a5bc0f>WAVE</span><span class="lbl" data-v-48a5bc0f>MODE</span></div><div class="stat-box" data-v-48a5bc0f><span class="val" data-v-48a5bc0f>${ssrInterpolate(unref(user)?.rating || 1e3)}</span><span class="lbl" data-v-48a5bc0f>SKILL</span></div></div><div class="how-to-play" data-v-48a5bc0f><h3 data-v-48a5bc0f>HOW TO PLAY</h3><p data-v-48a5bc0f>클릭/터치 유지 = 위로 이동</p><p data-v-48a5bc0f>해제 = 아래로 이동</p><p data-v-48a5bc0f>장애물을 피해 끝까지 도달하세요!</p></div></div><div class="particles" data-v-48a5bc0f><div class="particle p1" data-v-48a5bc0f></div><div class="particle p2" data-v-48a5bc0f></div><div class="particle p3" data-v-48a5bc0f></div><div class="particle p4" data-v-48a5bc0f></div><div class="particle p5" data-v-48a5bc0f></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-48a5bc0f"]]);

export { index as default };
//# sourceMappingURL=index-BBcZlKoW.mjs.map
