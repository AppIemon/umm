import { _ as __nuxt_component_0 } from './nuxt-link-6iJx3ywR.mjs';
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    const username = ref("");
    const password = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "auth-page" }, _attrs))} data-v-92e086da><div class="background-anim" data-v-92e086da></div><div class="auth-card" data-v-92e086da><h1 class="glitch-title" data-text="LOGIN" data-v-92e086da>P_LOGIN</h1><form data-v-92e086da><div class="input-group" data-v-92e086da><label data-v-92e086da>IDENTIFIER</label><input${ssrRenderAttr("value", username.value)} type="text" placeholder="USER_ID" required data-v-92e086da></div><div class="input-group" data-v-92e086da><label data-v-92e086da>ACCESS_CODE</label><input${ssrRenderAttr("value", password.value)} type="password" placeholder="********" required data-v-92e086da></div><button type="submit" class="cta-btn" data-v-92e086da>INITIALIZE SESSION</button></form><div class="divider" data-v-92e086da>-- OR --</div><button class="guest-btn" data-v-92e086da>GUEST_MODE</button><div class="footer-link" data-v-92e086da> New entity? `);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/register" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Register Identity`);
          } else {
            return [
              createTextVNode("Register Identity")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-92e086da"]]);

export { login as default };
//# sourceMappingURL=login-BdLBhdjQ.mjs.map
