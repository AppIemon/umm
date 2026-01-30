import { _ as __nuxt_component_0 } from './GameCanvas-DYNPGhAt.mjs';
import { defineComponent, ref, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderComponent } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { a as useAuth } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './game-engine--bomXVDE.mjs';
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
    const { user } = useAuth();
    const step = ref("LOBBY");
    const rooms = ref([]);
    const newRoomTitle = ref("New Room");
    const newRoomMaxPlayers = ref(4);
    const newRoomDuration = ref(60);
    const currentRoom = ref(null);
    const currentRoomId = ref(null);
    const playerId = computed(() => user.value?._id || sessionStorage.getItem("umm_player_id") || "guest_" + Math.random().toString(36).substr(2, 9));
    computed(() => user.value?.displayName || user.value?.username || "Guest");
    const isHost = computed(() => currentRoom.value?.hostId === playerId.value);
    const selectedMap = ref(null);
    const audioBuffer = ref(null);
    const obstacles = ref([]);
    const sections = ref([]);
    const timeRemaining = ref(0);
    ref(null);
    ref(null);
    const myProgress = ref(0);
    const myY = ref(360);
    const allPlayers = ref([]);
    async function handlePlayerClear() {
      playerClearCount.value++;
      try {
        await $fetch("/api/rooms/clear", {
          method: "POST",
          body: {
            roomId: currentRoomId.value,
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
        const res = await $fetch("/api/rooms/next-map", {
          method: "POST",
          body: {
            roomId: currentRoomId.value,
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
    function updateMyProgress(data) {
      myProgress.value = data.progress;
      myY.value = data.y;
    }
    function handleRoundFinish(data) {
      if (data?.outcome === "complete" || myProgress.value >= 100) {
        handlePlayerClear();
      }
      if (data?.outcome !== "complete") ;
    }
    function formatTime(s) {
      return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    }
    const top3Players = computed(() => {
      return [...allPlayers.value].sort((a, b) => b.progress - a.progress).slice(0, 3);
    });
    const sortedPlayers = computed(() => {
      return [...allPlayers.value].sort((a, b) => b.progress - a.progress);
    });
    const bestOpponent = computed(() => {
      return sortedPlayers.value.find((p) => p.userId !== playerId.value);
    });
    const didIWin = computed(() => {
      return sortedPlayers.value[0]?.userId === playerId.value;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_GameCanvas = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "multi-container" }, _attrs))} data-v-0d67762f><div class="background-anim" data-v-0d67762f></div>`);
      if (step.value === "LOBBY") {
        _push(`<div class="setup-screen glass-panel lobby-panel" data-v-0d67762f><h1 class="glow-text" data-v-0d67762f>MULTIPLAYER LOBBY</h1><div class="lobby-actions" data-v-0d67762f><button class="create-btn" data-v-0d67762f>CREATE ROOM</button><button class="refresh-btn" data-v-0d67762f>REFRESH</button></div><div class="room-list" data-v-0d67762f>`);
        if (rooms.value.length === 0) {
          _push(`<div class="no-rooms" data-v-0d67762f>NO ROOMS AVAILABLE</div>`);
        } else {
          _push(`<!--[-->`);
          ssrRenderList(rooms.value, (room) => {
            _push(`<div class="room-card" data-v-0d67762f><div class="room-info" data-v-0d67762f><h3 class="room-title" data-v-0d67762f>${ssrInterpolate(room.title)}</h3><div class="room-meta-row" data-v-0d67762f><span class="room-host" data-v-0d67762f>HOST: ${ssrInterpolate(room.host)}</span><span class="room-time" data-v-0d67762f>TIME: ${ssrInterpolate(room.duration)}s</span></div></div><div class="room-status-badge" data-v-0d67762f>${ssrInterpolate(room.currentPlayers)} / ${ssrInterpolate(room.maxPlayers)}</div></div>`);
          });
          _push(`<!--]-->`);
        }
        _push(`</div><button class="back-btn-simple" data-v-0d67762f>BACK TO MENU</button></div>`);
      } else if (step.value === "CREATE") {
        _push(`<div class="setup-screen glass-panel" data-v-0d67762f><h1 class="glow-text" data-v-0d67762f>CREATE ROOM</h1><div class="form-container" data-v-0d67762f><div class="form-group" data-v-0d67762f><label data-v-0d67762f>ROOM TITLE</label><input${ssrRenderAttr("value", newRoomTitle.value)} class="input-field" placeholder="Enter room name" maxlength="20" data-v-0d67762f></div><div class="form-group" data-v-0d67762f><label data-v-0d67762f>MAX PLAYERS: ${ssrInterpolate(newRoomMaxPlayers.value)}</label><input type="range"${ssrRenderAttr("value", newRoomMaxPlayers.value)} min="2" max="10" class="range-slider" data-v-0d67762f></div><div class="form-group" data-v-0d67762f><label data-v-0d67762f>DURATION (Seconds: 30 ~ 1800)</label><input type="number"${ssrRenderAttr("value", newRoomDuration.value)} class="input-field" min="30" max="1800" step="10" data-v-0d67762f><div class="duration-hint" data-v-0d67762f>30s (30sec) ~ 1800s (30min)</div></div></div><div class="action-row" data-v-0d67762f><button class="confirm-btn" data-v-0d67762f>CREATE</button><button class="cancel-btn" data-v-0d67762f>CANCEL</button></div></div>`);
      } else if (step.value === "ROOM") {
        _push(`<div class="setup-screen glass-panel room-view" data-v-0d67762f><h2 class="room-header-title" data-v-0d67762f>${ssrInterpolate(currentRoom.value?.title)}</h2><div class="room-header-meta" data-v-0d67762f><span data-v-0d67762f>TIME: ${ssrInterpolate(currentRoom.value?.duration)}s</span><span data-v-0d67762f>PLAYERS: ${ssrInterpolate(currentRoom.value?.players.length)} / ${ssrInterpolate(currentRoom.value?.maxPlayers)}</span></div><div class="player-grid" data-v-0d67762f><!--[-->`);
        ssrRenderList(currentRoom.value?.players, (pl) => {
          _push(`<div class="${ssrRenderClass([{ host: pl.isHost }, "player-card-lg"])}" data-v-0d67762f><div class="avatar-lg" data-v-0d67762f>◆</div><div class="player-name" data-v-0d67762f>${ssrInterpolate(pl.username)}</div>`);
          if (pl.userId === playerId.value) {
            _push(`<span class="me-badge" data-v-0d67762f>YOU</span>`);
          } else {
            _push(`<!---->`);
          }
          if (pl.isHost) {
            _push(`<span class="host-badge" data-v-0d67762f>HOST</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--><!--[-->`);
        ssrRenderList(currentRoom.value ? currentRoom.value.maxPlayers - currentRoom.value.players.length : 0, (i) => {
          _push(`<div class="player-card-lg empty" data-v-0d67762f><div class="avatar-lg empty" data-v-0d67762f>+</div><div class="player-name" data-v-0d67762f>EMPTY</div></div>`);
        });
        _push(`<!--]--></div>`);
        if (isHost.value) {
          _push(`<div class="host-controls" data-v-0d67762f><button class="start-btn"${ssrIncludeBooleanAttr(!currentRoom.value || currentRoom.value.players.length < 1) ? " disabled" : ""} data-v-0d67762f>START GAME</button>`);
          if (currentRoom.value && currentRoom.value.players.length < 2) {
            _push(`<p class="hint-text" data-v-0d67762f>Waiting for players...</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<div class="guest-controls" data-v-0d67762f><div class="loading-spinner" data-v-0d67762f></div><p class="waiting-text" data-v-0d67762f>WAITING FOR HOST TO START...</p></div>`);
        }
        _push(`<button class="leave-btn" data-v-0d67762f>LEAVE ROOM</button></div>`);
      } else if (step.value === "PLAY" || step.value === "RESULT") {
        _push(`<div class="ingame-container" data-v-0d67762f>`);
        if (step.value === "RESULT") {
          _push(`<div class="result-overlay" data-v-0d67762f><div class="result-box glass-panel" data-v-0d67762f><h1 class="victory-text" data-v-0d67762f>${ssrInterpolate(didIWin.value ? "VICTORY" : "FINISH")}</h1><div class="result-list" data-v-0d67762f><!--[-->`);
          ssrRenderList(sortedPlayers.value, (p, idx) => {
            _push(`<div class="${ssrRenderClass([{ winner: idx === 0, me: p.userId === playerId.value }, "result-row"])}" data-v-0d67762f><span class="rank" data-v-0d67762f>#${ssrInterpolate(idx + 1)}</span><span class="name" data-v-0d67762f>${ssrInterpolate(p.username)}</span><span class="score" data-v-0d67762f>${ssrInterpolate(p.progress.toFixed(1))}% (${ssrInterpolate(p.clearCount || 0)} Wins)</span></div>`);
          });
          _push(`<!--]--></div><button class="action-btn" data-v-0d67762f>EXIT TO LOBBY</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="match-hud" data-v-0d67762f><div class="${ssrRenderClass([{ critical: timeRemaining.value < 30 }, "timer-display"])}" data-v-0d67762f>${ssrInterpolate(formatTime(timeRemaining.value))}</div><div class="leaderboard-hud" data-v-0d67762f><!--[-->`);
        ssrRenderList(top3Players.value, (p, idx) => {
          _push(`<div class="lb-item" data-v-0d67762f><span class="lb-rank" data-v-0d67762f>#${ssrInterpolate(idx + 1)}</span><span class="lb-name" data-v-0d67762f>${ssrInterpolate(p.username)}</span><span class="lb-score" data-v-0d67762f>${ssrInterpolate(p.progress.toFixed(0))}%</span></div>`);
        });
        _push(`<!--]--></div></div>`);
        if (audioBuffer.value) {
          _push(ssrRenderComponent(_component_GameCanvas, {
            audioBuffer: audioBuffer.value,
            obstacles: obstacles.value,
            sections: sections.value,
            loadMap: selectedMap.value,
            multiplayerMode: true,
            opponentY: bestOpponent.value?.y || 360,
            opponentProgress: bestOpponent.value?.progress || 0,
            onExit: handleRoundFinish,
            onProgressUpdate: updateMyProgress
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
const multiplayer = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0d67762f"]]);

export { multiplayer as default };
//# sourceMappingURL=multiplayer-ez-yj-ug.mjs.map
