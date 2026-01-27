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
  __name: "register",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    const username = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "auth-page" }, _attrs))} data-v-d8db6c71><div class="background-anim" data-v-d8db6c71></div><div class="auth-card" data-v-d8db6c71><h1 class="glitch-title" data-v-d8db6c71>REGISTER</h1><form data-v-d8db6c71><div class="input-group" data-v-d8db6c71><label data-v-d8db6c71>NEW_IDENTIFIER</label><input${ssrRenderAttr("value", username.value)} type="text" placeholder="CHOOSE_ID" required data-v-d8db6c71></div><div class="input-group" data-v-d8db6c71><label data-v-d8db6c71>ACCESS_CODE</label><input${ssrRenderAttr("value", password.value)} type="password" placeholder="********" required data-v-d8db6c71></div><div class="input-group" data-v-d8db6c71><label data-v-d8db6c71>CONFIRM_CODE</label><input${ssrRenderAttr("value", confirmPassword.value)} type="password" placeholder="********" required data-v-d8db6c71></div><button type="submit" class="cta-btn secondary" data-v-d8db6c71>CREATE IDENTITY</button></form><div class="footer-link" data-v-d8db6c71> Already registered? `);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/login" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Initialize Session`);
          } else {
            return [
              createTextVNode("Initialize Session")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/register.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const register = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d8db6c71"]]);

export { register as default };
//# sourceMappingURL=register-D9FBXC1B.mjs.map
