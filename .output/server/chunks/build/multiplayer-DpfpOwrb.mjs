import { _ as __nuxt_component_0, s as setInterval } from './GameCanvas-Btz3R1ec.mjs';
import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderStyle, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { a as useAuth } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './game-engine-B6GgZhSo.mjs';
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
  __name: "multiplayer",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const { user, updateRating } = useAuth();
    const step = ref("MODESELECT");
    const matchStatus = ref("Connecting to server...");
    const opponentName = ref("");
    const selectedMap = ref(null);
    const selectedCategory = ref("");
    const playerProgress = ref(0);
    const opponentProgress = ref(0);
    const playerY = ref(360);
    const opponentY = ref(360);
    const bestPlayerProgress = ref(0);
    const bestOpponentProgress = ref(0);
    const results = ref({ p1: 0, p2: 0 });
    const winner = ref("draw");
    const audioBuffer = ref(null);
    const obstacles = ref([]);
    const sections = ref([]);
    const timeRemaining = ref(180);
    let matchTimer = null;
    ref(null);
    let statusInterval = null;
    computed(() => {
      if (user.value?._id) return user.value._id;
      let tid = sessionStorage.getItem("umm_player_id");
      if (!tid) {
        tid = "guest_" + Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem("umm_player_id", tid);
      }
      return tid;
    });
    async function startGame() {
      if (!selectedMap.value) return;
      if (selectedCategory.value === "3m") timeRemaining.value = 180;
      else if (selectedCategory.value === "10m") timeRemaining.value = 600;
      else if (selectedCategory.value === "1h") timeRemaining.value = 3600;
      obstacles.value = selectedMap.value.beatTimes || [];
      sections.value = selectedMap.value.sections || [];
      const audioCtx = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
      const bufferLength = Math.max(1, audioCtx.sampleRate * (selectedMap.value.duration || 120));
      audioBuffer.value = audioCtx.createBuffer(1, bufferLength, audioCtx.sampleRate);
      step.value = "PLAY";
      playerProgress.value = 0;
      opponentProgress.value = 0;
      bestPlayerProgress.value = 0;
      bestOpponentProgress.value = 0;
      clearInterval(matchTimer);
      matchTimer = setInterval();
      clearInterval(statusInterval);
      statusInterval = setInterval();
    }
    function updateProgress(data) {
      playerProgress.value = data.progress;
      if (data.progress > bestPlayerProgress.value) {
        bestPlayerProgress.value = data.progress;
      }
      playerY.value = data.y;
      if (bestPlayerProgress.value >= 100) {
        finalizeMatch("player");
      } else if (bestOpponentProgress.value >= 100) {
        finalizeMatch("opponent");
      }
    }
    function handleRoundFinish(data) {
      if (data?.outcome === "fail") ;
      else if (bestPlayerProgress.value >= 100) {
        finalizeMatch("player");
      }
    }
    function finalizeMatch(win) {
      clearInterval(matchTimer);
      winner.value = win;
      results.value.p1 = bestPlayerProgress.value;
      results.value.p2 = bestOpponentProgress.value;
      if (user.value && !user.value.isGuest && (win === "player" || win === "opponent")) {
        const currentRating = user.value.rating || 1e3;
        const ratingChange = win === "player" ? 25 : -15;
        const newRating = Math.max(0, currentRating + ratingChange);
        updateRating(newRating, {
          opponent: opponentName.value,
          winner: win === "player" ? user.value.username : opponentName.value,
          myScore: results.value.p1,
          opponentScore: results.value.p2,
          date: /* @__PURE__ */ new Date(),
          ratingChange
        });
      }
      step.value = "RESULT";
    }
    function formatTime(seconds) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_GameCanvas = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "multi-container" }, _attrs))} data-v-c743d19b><div class="background-anim" data-v-c743d19b></div>`);
      if (step.value === "MODESELECT") {
        _push(`<div class="setup-screen glass-panel" data-v-c743d19b><h1 class="glow-text" data-v-c743d19b>BATTLE CATEGORY</h1><div class="mode-grid" data-v-c743d19b><div class="mode-card" data-v-c743d19b><div class="mode-icon" data-v-c743d19b>⚡</div><h3 data-v-c743d19b>SPRINT</h3><p data-v-c743d19b>3 MINUTE MATCH</p></div><div class="mode-card" data-v-c743d19b><div class="mode-icon" data-v-c743d19b>⚔️</div><h3 data-v-c743d19b>STANDARD</h3><p data-v-c743d19b>10 MINUTE MATCH</p></div><div class="mode-card" data-v-c743d19b><div class="mode-icon" data-v-c743d19b>🌌</div><h3 data-v-c743d19b>ENDURANCE</h3><p data-v-c743d19b>1 HOUR MATCH</p></div></div><button class="back-btn-simple" data-v-c743d19b>BACK TO MENU</button></div>`);
      } else if (step.value === "MATCHMAKING") {
        _push(`<div class="setup-screen glass-panel" data-v-c743d19b><div class="matchmaking-box" data-v-c743d19b><h1 class="glow-text" data-v-c743d19b>SEARCHING_OPPONENT</h1><div class="category-badge" data-v-c743d19b>${ssrInterpolate(selectedCategory.value)} CLASS</div><div class="radar" data-v-c743d19b><div class="radar-line" data-v-c743d19b></div><div class="pings" data-v-c743d19b><div class="ping" style="${ssrRenderStyle({ "top": "20%", "left": "30%" })}" data-v-c743d19b></div><div class="ping" style="${ssrRenderStyle({ "top": "70%", "left": "80%" })}" data-v-c743d19b></div></div></div><p class="status-msg" data-v-c743d19b>${ssrInterpolate(matchStatus.value)}</p><button class="cancel-btn" data-v-c743d19b>CANCEL</button></div></div>`);
      } else if (step.value === "READY") {
        _push(`<div class="setup-screen glass-panel" data-v-c743d19b><div class="ready-box" data-v-c743d19b><div class="vs-header" data-v-c743d19b><div class="player-info" data-v-c743d19b><div class="avatar" data-v-c743d19b>◆</div><span data-v-c743d19b>${ssrInterpolate(unref(user)?.username || "GUEST")}</span></div><div class="vs-badge" data-v-c743d19b>VS</div><div class="player-info" data-v-c743d19b><div class="avatar opponent" data-v-c743d19b>◇</div><span data-v-c743d19b>${ssrInterpolate(opponentName.value)}</span></div></div>`);
        if (selectedMap.value) {
          _push(`<div class="selected-map" data-v-c743d19b><h2 class="map-label" data-v-c743d19b>SELECTED_MAP</h2><h1 class="map-name" data-v-c743d19b>${ssrInterpolate(selectedMap.value.title)}</h1><p class="map-meta" data-v-c743d19b>DIFF: ${ssrInterpolate(selectedMap.value.difficulty)} | BY: ${ssrInterpolate(selectedMap.value.creatorName)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="battle-btn" data-v-c743d19b>BATTLE START</button></div></div>`);
      } else if (step.value === "RESULT") {
        _push(`<div class="setup-screen glass-panel" data-v-c743d19b><div class="result-box" data-v-c743d19b><h1 class="${ssrRenderClass([{ loss: winner.value === "opponent", draw: winner.value === "draw" }, "victory-text"])}" data-v-c743d19b>${ssrInterpolate(winner.value === "player" ? "VICTORY" : winner.value === "opponent" ? "DEFEAT" : "DRAW")}</h1><div class="duel-res" data-v-c743d19b><div class="res-item" data-v-c743d19b><span data-v-c743d19b>${ssrInterpolate(unref(user)?.username || "YOU")}</span><div class="prog-bar" data-v-c743d19b><div class="fill" style="${ssrRenderStyle({ width: results.value.p1 + "%" })}" data-v-c743d19b></div></div><span data-v-c743d19b>${ssrInterpolate(results.value.p1.toFixed(1))}%</span></div><div class="res-item" data-v-c743d19b><span data-v-c743d19b>${ssrInterpolate(opponentName.value)}</span><div class="prog-bar" data-v-c743d19b><div class="fill enemy" style="${ssrRenderStyle({ width: results.value.p2 + "%" })}" data-v-c743d19b></div></div><span data-v-c743d19b>${ssrInterpolate(results.value.p2.toFixed(1))}%</span></div></div>`);
        if (timeRemaining.value <= 0) {
          _push(`<div class="match-meta" data-v-c743d19b><span class="timeout-badge" data-v-c743d19b>TIME OUT RESULT</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="action-btn" data-v-c743d19b>REMATCH</button><button class="action-btn secondary" data-v-c743d19b>EXIT</button></div></div>`);
      } else if (step.value === "PLAY") {
        _push(`<div class="ingame-container" data-v-c743d19b><div class="match-hud" data-v-c743d19b><div class="${ssrRenderClass([{ critical: timeRemaining.value < 30 }, "timer-display"])}" data-v-c743d19b>${ssrInterpolate(formatTime(timeRemaining.value))}</div><div class="concurrent-progress" data-v-c743d19b><div class="p-bar" data-v-c743d19b><div class="fill" style="${ssrRenderStyle({ width: bestPlayerProgress.value + "%" })}" data-v-c743d19b></div><div class="current-marker" style="${ssrRenderStyle({ left: playerProgress.value + "%" })}" data-v-c743d19b></div></div><div class="p-bar" data-v-c743d19b><div class="fill enemy" style="${ssrRenderStyle({ width: bestOpponentProgress.value + "%" })}" data-v-c743d19b></div><div class="current-marker enemy" style="${ssrRenderStyle({ left: opponentProgress.value + "%" })}" data-v-c743d19b></div></div></div></div>`);
        if (audioBuffer.value) {
          _push(ssrRenderComponent(_component_GameCanvas, {
            audioBuffer: audioBuffer.value,
            obstacles: obstacles.value,
            sections: sections.value,
            loadMap: selectedMap.value,
            multiplayerMode: true,
            opponentY: opponentY.value,
            opponentProgress: opponentProgress.value,
            onRetry: startGame,
            onExit: handleRoundFinish,
            onProgressUpdate: updateProgress
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/multiplayer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const multiplayer = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c743d19b"]]);

export { multiplayer as default };
//# sourceMappingURL=multiplayer-DpfpOwrb.mjs.map
