import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrRenderAttr } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
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

const playerColor = ref("#00ffff");
const trailColor = ref("#ff00ff");
const obstacleColor = ref("#ff4444");
if (typeof localStorage !== "undefined") {
  const saved = localStorage.getItem("wave_game_settings");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      playerColor.value = parsed.playerColor || "#00ffff";
      trailColor.value = parsed.trailColor || "#ff00ff";
      obstacleColor.value = parsed.obstacleColor || "#ff4444";
    } catch (e) {
    }
  }
}
const saveSettings = () => {
  localStorage.setItem("wave_game_settings", JSON.stringify({
    playerColor: playerColor.value,
    trailColor: trailColor.value,
    obstacleColor: obstacleColor.value
  }));
};
const useGameSettings = () => {
  return {
    playerColor,
    trailColor,
    obstacleColor,
    saveSettings
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "mypage",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const { user } = useAuth();
    const settings = useGameSettings();
    const songs = ref([]);
    ref(null);
    function formatDate(ts) {
      return new Date(ts).toLocaleDateString();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mypage-container" }, _attrs))} data-v-d107291a><div class="header" data-v-d107291a><h1 class="title" data-v-d107291a>PILOT PROFILE</h1><button class="back-btn" data-v-d107291a>BACK TO MENU</button></div><div class="content" data-v-d107291a><div class="stats-col" data-v-d107291a><div class="glass-panel profile-card" data-v-d107291a><div class="user-id" data-v-d107291a>@${ssrInterpolate(unref(user)?.username)}</div><div class="rating-display" data-v-d107291a><span class="label" data-v-d107291a>SKILL RATING</span><span class="value" data-v-d107291a>${ssrInterpolate(unref(user)?.rating || 1e3)}</span></div></div><div class="glass-panel history-section" data-v-d107291a><h2 data-v-d107291a>MATCH HISTORY</h2>`);
      if (unref(user)?.matchHistory?.length) {
        _push(`<div class="history-list" data-v-d107291a><!--[-->`);
        ssrRenderList(unref(user).matchHistory, (match, idx) => {
          _push(`<div class="${ssrRenderClass([{ win: match.winner === unref(user).username }, "match-item"])}" data-v-d107291a><div class="match-meta" data-v-d107291a><span class="m-date" data-v-d107291a>${ssrInterpolate(formatDate(new Date(match.date).getTime()))}</span><span class="m-opp" data-v-d107291a>VS ${ssrInterpolate(match.opponent)}</span></div><div class="match-res" data-v-d107291a><span class="res-tag" data-v-d107291a>${ssrInterpolate(match.winner === unref(user).username ? "WIN" : "LOSS")}</span><span class="${ssrRenderClass([{ plus: match.ratingChange > 0 }, "m-rating"])}" data-v-d107291a>${ssrInterpolate(match.ratingChange > 0 ? "+" : "")}${ssrInterpolate(match.ratingChange)}</span></div><div class="m-score" data-v-d107291a>${ssrInterpolate(match.myScore.toFixed(0))}% - ${ssrInterpolate(match.opponentScore.toFixed(0))}%</div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="empty-state" data-v-d107291a>NO BATTLE DATA</div>`);
      }
      _push(`</div><div class="upload-section glass-panel" data-v-d107291a><h2 data-v-d107291a>UPLOAD NEW TRACK</h2><div class="drop-zone" data-v-d107291a><p data-v-d107291a>DROP FILE OR CLICK TO UPLOAD</p></div><input type="file" accept="audio/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-d107291a></div></div><div class="right-col" data-v-d107291a><div class="settings-section glass-panel" data-v-d107291a><h2 data-v-d107291a>ENGINE CUSTOMIZATION</h2><div class="setting-row" data-v-d107291a><label data-v-d107291a>FIRE PLANET COLOR</label><input type="color"${ssrRenderAttr("value", unref(settings).fireColor.value)} data-v-d107291a></div><div class="setting-row" data-v-d107291a><label data-v-d107291a>ICE PLANET COLOR</label><input type="color"${ssrRenderAttr("value", unref(settings).iceColor.value)} data-v-d107291a></div></div><div class="storage-section glass-panel" data-v-d107291a><h2 data-v-d107291a>SAVED TRACKS (${ssrInterpolate(songs.value.length)})</h2>`);
      if (songs.value.length > 0) {
        _push(`<div class="song-list" data-v-d107291a><!--[-->`);
        ssrRenderList(songs.value, (song) => {
          _push(`<div class="song-item" data-v-d107291a><div class="song-info" data-v-d107291a><span class="song-name" data-v-d107291a>${ssrInterpolate(song.name)}</span><span class="song-date" data-v-d107291a>${ssrInterpolate(formatDate(song.date))}</span></div><div class="actions" data-v-d107291a><button class="delete-btn" data-v-d107291a>DELETE</button></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="empty-state" data-v-d107291a> NO TRACKS SAVED </div>`);
      }
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/mypage.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const mypage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d107291a"]]);

export { mypage as default };
//# sourceMappingURL=mypage-Cm96yJc-.mjs.map
