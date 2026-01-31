import { _ as __nuxt_component_0 } from './LandscapeOverlay-CFpyYAJT.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-6iJx3ywR.mjs';
import { defineComponent, mergeProps, unref, computed, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrRenderSlot, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { p as publicAssetsURL } from '../routes/renderer.mjs';
import { e as useState, a as useAuth } from './server.mjs';
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
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';

const _imports_0 = publicAssetsURL("/umm.png");
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "NavBar",
  __ssrInlineRender: true,
  setup(__props) {
    const { user } = useAuth();
    computed(() => user.value?.isGuest ?? true);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<nav${ssrRenderAttrs(mergeProps({ class: "cyber-nav" }, _attrs))} data-v-65f12c68><div class="brand" data-v-65f12c68><div class="logo-wrapper" data-v-65f12c68><img${ssrRenderAttr("src", _imports_0)} alt="UMM" class="nav-logo" data-v-65f12c68></div></div><div class="links" data-v-65f12c68>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "nav-item"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="icon" data-v-65f12c68${_scopeId}>🏠</span><span class="label" data-v-65f12c68${_scopeId}>HOME</span>`);
          } else {
            return [
              createVNode("span", { class: "icon" }, "🏠"),
              createVNode("span", { class: "label" }, "HOME")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/play",
        class: "nav-item"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="icon" data-v-65f12c68${_scopeId}>🎮</span><span class="label" data-v-65f12c68${_scopeId}>PLAY</span>`);
          } else {
            return [
              createVNode("span", { class: "icon" }, "🎮"),
              createVNode("span", { class: "label" }, "PLAY")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/maps",
        class: "nav-item"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="icon" data-v-65f12c68${_scopeId}>📁</span><span class="label" data-v-65f12c68${_scopeId}>MAPS</span>`);
          } else {
            return [
              createVNode("span", { class: "icon" }, "📁"),
              createVNode("span", { class: "label" }, "MAPS")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/editor",
        class: "nav-item"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="icon" data-v-65f12c68${_scopeId}>🛠️</span><span class="label" data-v-65f12c68${_scopeId}>EDITOR</span>`);
          } else {
            return [
              createVNode("span", { class: "icon" }, "🛠️"),
              createVNode("span", { class: "label" }, "EDITOR")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/multiplayer",
        class: "nav-item"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="icon" data-v-65f12c68${_scopeId}>⚔️</span><span class="label" data-v-65f12c68${_scopeId}>MULTI</span>`);
          } else {
            return [
              createVNode("span", { class: "icon" }, "⚔️"),
              createVNode("span", { class: "label" }, "MULTI")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/guide",
        class: "nav-item"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="icon" data-v-65f12c68${_scopeId}>📖</span><span class="label" data-v-65f12c68${_scopeId}>GUIDE</span>`);
          } else {
            return [
              createVNode("span", { class: "icon" }, "📖"),
              createVNode("span", { class: "label" }, "GUIDE")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="user-panel" data-v-65f12c68>`);
      if (unref(user)) {
        _push(`<div class="user-info" data-v-65f12c68><span class="username" data-v-65f12c68>${ssrInterpolate(unref(user).username)}</span><button class="logout-btn" data-v-65f12c68>LOGOUT</button></div>`);
      } else {
        _push(`<div class="auth-btns" data-v-65f12c68>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/login",
          class: "auth-btn login"
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
          class: "auth-btn register"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`JOIN`);
            } else {
              return [
                createTextVNode("JOIN")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</div></nav>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/NavBar.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-65f12c68"]]), { __name: "NavBar" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const showNavbar = useState("showNavbar", () => true);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LandscapeOverlay = __nuxt_component_0;
      const _component_NavBar = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "layout-container" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_LandscapeOverlay, null, null, _parent));
      if (unref(showNavbar)) {
        _push(ssrRenderComponent(_component_NavBar, null, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="${ssrRenderClass([{ "full-width": !unref(showNavbar) }, "content-area"])}">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-DROZG8ze.mjs.map
