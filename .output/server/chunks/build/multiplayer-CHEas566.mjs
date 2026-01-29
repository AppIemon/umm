import { _ as __nuxt_component_0 } from './GameCanvas-BR3LeziT.mjs';
import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderStyle, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { a as useAuth } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './game-engine-CV48549j.mjs';
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

const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.";
const setInterval = () => {
  console.error(intervalError);
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "multiplayer",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const { user } = useAuth();
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
    ref({ p1: 0, p2: 0 });
    const winner = ref("draw");
    const playerClearCount = ref(0);
    const opponentClearCount = ref(0);
    const showOpponentClearAlert = ref(false);
    const currentMapIndex = ref(0);
    ref([]);
    const audioBuffer = ref(null);
    const obstacles = ref([]);
    const sections = ref([]);
    const timeRemaining = ref(180);
    let matchTimer = null;
    const matchId = ref(null);
    let statusInterval = null;
    const playerId = computed(() => {
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
      if (selectedCategory.value === "1m") timeRemaining.value = 60;
      else if (selectedCategory.value === "3m") timeRemaining.value = 180;
      else if (selectedCategory.value === "10m") timeRemaining.value = 600;
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
    }
    async function handlePlayerClear() {
      playerClearCount.value++;
      try {
        await $fetch("/api/matchmaking/clear", {
          method: "POST",
          body: {
            matchId: matchId.value,
            userId: playerId.value
          }
        });
      } catch (e) {
      }
      await loadNextMap();
    }
    async function loadNextMap() {
      currentMapIndex.value++;
      try {
        const res = await $fetch("/api/matchmaking/next-map", {
          method: "POST",
          body: {
            matchId: matchId.value,
            userId: playerId.value,
            mapIndex: currentMapIndex.value
          }
        });
        if (res.map) {
          selectedMap.value = res.map;
          obstacles.value = res.map.beatTimes || [];
          sections.value = res.map.sections || [];
          bestPlayerProgress.value = 0;
          playerProgress.value = 0;
        }
      } catch (e) {
        console.error("Failed to load next map", e);
      }
    }
    function handleRoundFinish(data) {
      if (data?.outcome === "complete" || bestPlayerProgress.value >= 100) {
        handlePlayerClear();
      }
    }
    function formatTime(seconds) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_GameCanvas = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "multi-container" }, _attrs))} data-v-67b945f8><div class="background-anim" data-v-67b945f8></div>`);
      if (step.value === "MODESELECT") {
        _push(`<div class="setup-screen glass-panel" data-v-67b945f8><h1 class="glow-text" data-v-67b945f8>BATTLE CATEGORY</h1><div class="mode-grid" data-v-67b945f8><div class="mode-card" data-v-67b945f8><div class="mode-icon" data-v-67b945f8>⚡</div><h3 data-v-67b945f8>SPRINT</h3><p data-v-67b945f8>1 MINUTE MATCH</p></div><div class="mode-card" data-v-67b945f8><div class="mode-icon" data-v-67b945f8>⚔️</div><h3 data-v-67b945f8>STANDARD</h3><p data-v-67b945f8>3 MINUTE MATCH</p></div><div class="mode-card" data-v-67b945f8><div class="mode-icon" data-v-67b945f8>🌌</div><h3 data-v-67b945f8>ENDURANCE</h3><p data-v-67b945f8>10 MINUTE MATCH</p></div></div><button class="back-btn-simple" data-v-67b945f8>BACK TO MENU</button></div>`);
      } else if (step.value === "MATCHMAKING") {
        _push(`<div class="setup-screen glass-panel" data-v-67b945f8><div class="matchmaking-box" data-v-67b945f8><h1 class="glow-text" data-v-67b945f8>SEARCHING_OPPONENT</h1><div class="category-badge" data-v-67b945f8>${ssrInterpolate(selectedCategory.value)} CLASS</div><div class="radar" data-v-67b945f8><div class="radar-line" data-v-67b945f8></div><div class="pings" data-v-67b945f8><div class="ping" style="${ssrRenderStyle({ "top": "20%", "left": "30%" })}" data-v-67b945f8></div><div class="ping" style="${ssrRenderStyle({ "top": "70%", "left": "80%" })}" data-v-67b945f8></div></div></div><p class="status-msg" data-v-67b945f8>${ssrInterpolate(matchStatus.value)}</p><button class="cancel-btn" data-v-67b945f8>CANCEL</button></div></div>`);
      } else if (step.value === "READY") {
        _push(`<div class="setup-screen glass-panel" data-v-67b945f8><div class="ready-box" data-v-67b945f8><div class="vs-header" data-v-67b945f8><div class="player-info" data-v-67b945f8><div class="avatar" data-v-67b945f8>◆</div><span data-v-67b945f8>${ssrInterpolate(unref(user)?.username || "GUEST")}</span></div><div class="vs-badge" data-v-67b945f8>VS</div><div class="player-info" data-v-67b945f8><div class="avatar opponent" data-v-67b945f8>◇</div><span data-v-67b945f8>${ssrInterpolate(opponentName.value)}</span></div></div>`);
        if (selectedMap.value) {
          _push(`<div class="selected-map" data-v-67b945f8><h2 class="map-label" data-v-67b945f8>SELECTED_MAP</h2><h1 class="map-name" data-v-67b945f8>${ssrInterpolate(selectedMap.value.title)}</h1><p class="map-meta" data-v-67b945f8>DIFF: ${ssrInterpolate(selectedMap.value.difficulty)} | BY: ${ssrInterpolate(selectedMap.value.creatorName)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="battle-btn" data-v-67b945f8>BATTLE START</button></div></div>`);
      } else if (step.value === "RESULT") {
        _push(`<div class="setup-screen glass-panel" data-v-67b945f8><div class="result-box" data-v-67b945f8><h1 class="${ssrRenderClass([{ loss: winner.value === "opponent", draw: winner.value === "draw" }, "victory-text"])}" data-v-67b945f8>${ssrInterpolate(winner.value === "player" ? "VICTORY" : winner.value === "opponent" ? "DEFEAT" : "DRAW")}</h1><div class="duel-res" data-v-67b945f8><div class="res-item" data-v-67b945f8><span data-v-67b945f8>${ssrInterpolate(unref(user)?.username || "YOU")}</span><div class="clear-count" data-v-67b945f8>${ssrInterpolate(playerClearCount.value)} CLEARS</div></div><div class="res-item" data-v-67b945f8><span data-v-67b945f8>${ssrInterpolate(opponentName.value)}</span><div class="clear-count enemy" data-v-67b945f8>${ssrInterpolate(opponentClearCount.value)} CLEARS</div></div></div>`);
        if (timeRemaining.value <= 0) {
          _push(`<div class="match-meta" data-v-67b945f8><span class="timeout-badge" data-v-67b945f8>TIME OUT RESULT</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="action-btn" data-v-67b945f8>REMATCH</button><button class="action-btn secondary" data-v-67b945f8>EXIT</button></div></div>`);
      } else if (step.value === "PLAY") {
        _push(`<div class="ingame-container" data-v-67b945f8><div class="match-hud" data-v-67b945f8><div class="${ssrRenderClass([{ critical: timeRemaining.value < 30 }, "timer-display"])}" data-v-67b945f8>${ssrInterpolate(formatTime(timeRemaining.value))}</div><div class="clear-counts-hud" data-v-67b945f8><span class="my-clears" data-v-67b945f8>YOU: ${ssrInterpolate(playerClearCount.value)}</span><span class="vs-text" data-v-67b945f8>VS</span><span class="enemy-clears" data-v-67b945f8>${ssrInterpolate(opponentName.value)}: ${ssrInterpolate(opponentClearCount.value)}</span></div>`);
        if (showOpponentClearAlert.value) {
          _push(`<div class="opponent-clear-alert" data-v-67b945f8> 🎉 ${ssrInterpolate(opponentName.value)}이(가) 레벨을 클리어했습니다! </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
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
const multiplayer = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-67b945f8"]]);

export { multiplayer as default };
//# sourceMappingURL=multiplayer-CHEas566.mjs.map
