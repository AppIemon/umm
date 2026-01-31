import { defineComponent, ref, computed, mergeProps, watch, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { _ as __nuxt_component_1 } from './GameCanvas-CvvWQa28.mjs';
import { useRouter } from 'vue-router';
import { a as useAuth, e as useState } from './server.mjs';
import './game-engine-Dr6cT55m.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "MultiplayerChat",
  __ssrInlineRender: true,
  props: {
    roomId: {},
    userId: {},
    username: {},
    messages: {}
  },
  setup(__props) {
    const props = __props;
    const inputText = ref("");
    const msgContainer = ref(null);
    function scrollToBottom() {
      if (msgContainer.value) {
        msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
      }
    }
    watch(() => props.messages, () => {
      nextTick(() => scrollToBottom());
    }, { deep: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "chat-container glass-panel" }, _attrs))} data-v-6cc4137d><div class="chat-messages" data-v-6cc4137d>`);
      if (__props.messages.length === 0) {
        _push(`<div class="empty-chat" data-v-6cc4137d>No messages yet...</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(__props.messages, (msg, i) => {
        _push(`<div class="chat-msg" data-v-6cc4137d><span class="${ssrRenderClass([{ "me": msg.userId === __props.userId }, "msg-sender"])}" data-v-6cc4137d>${ssrInterpolate(msg.username)}:</span><span class="msg-text" data-v-6cc4137d>${ssrInterpolate(msg.text)}</span></div>`);
      });
      _push(`<!--]--></div><div class="chat-input-row" data-v-6cc4137d><input${ssrRenderAttr("value", inputText.value)} placeholder="Type a message..." class="chat-input" maxlength="100" data-v-6cc4137d><button class="send-btn" data-v-6cc4137d>SEND</button></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MultiplayerChat.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-6cc4137d"]]), { __name: "MultiplayerChat" });
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
    const newRoomDuration = ref(120);
    const newRoomDifficulty = ref(10);
    const newRoomMusic = ref(null);
    const sampleTracks = [
      { id: "1", name: "God Chang-seop (신창섭) '바로 리부트 정상화' MV", url: "/audio/samples/God Chang-seop (신창섭) '바로 리부트 정상화' MV.mp3" },
      { id: "2", name: "I Love You", url: "/audio/samples/I Love You.mp3" },
      { id: "3", name: "Nyan Cat! [Official]", url: "/audio/samples/Nyan Cat! [Official].mp3" },
      { id: "random", name: "Random Sample", url: null }
    ];
    const currentRoom = ref(null);
    const currentRoomId = ref(null);
    const currentMapIndex = ref(0);
    const playerId = computed(() => user.value?._id || sessionStorage.getItem("umm_player_id") || "guest_" + Math.random().toString(36).substr(2, 9));
    const playerUsername = computed(() => user.value?.displayName || user.value?.username || "Guest");
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
    const playerClearCount = ref(0);
    const allPlayers = ref([]);
    useState("showNavbar");
    async function handlePlayerClear() {
      playerClearCount.value++;
      const me = allPlayers.value.find((p) => p.userId === playerId.value);
      if (me) {
        me.clearCount = (me.clearCount || 0) + 1;
      }
      try {
        await $fetch("/api/rooms/clear", {
          method: "POST",
          body: {
            matchId: currentRoomId.value,
            // Backend expects 'matchId'
            userId: playerId.value
          }
        });
      } catch (e) {
        console.error("Failed to notify clear", e);
      }
    }
    async function loadNextMap() {
      const nextIndex = currentMapIndex.value + 1;
      try {
        const res = await $fetch("/api/rooms/next-map", {
          method: "POST",
          body: {
            roomId: currentRoomId.value,
            userId: playerId.value,
            mapIndex: nextIndex
          }
        });
        if (res.map) {
          selectedMap.value = res.map;
          currentMapIndex.value = res.mapIndex;
          obstacles.value = res.map.engineObstacles || [];
          sections.value = res.map.sections || [];
          myProgress.value = 0;
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
      if (data?.outcome === "win") {
        handlePlayerClear();
        setTimeout(() => {
          loadNextMap();
        }, 1500);
      }
    }
    function formatTime(s) {
      return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
    }
    const top3Players = computed(() => {
      return [...allPlayers.value].sort((a, b) => {
        if ((b.clearCount || 0) !== (a.clearCount || 0)) {
          return (b.clearCount || 0) - (a.clearCount || 0);
        }
        return b.progress - a.progress;
      }).slice(0, 3);
    });
    const sortedPlayers = computed(() => {
      return [...allPlayers.value].sort((a, b) => {
        if ((b.clearCount || 0) !== (a.clearCount || 0)) {
          return (b.clearCount || 0) - (a.clearCount || 0);
        }
        return b.progress - a.progress;
      });
    });
    const bestOpponent = computed(() => {
      return sortedPlayers.value.find((p) => p.userId !== playerId.value);
    });
    const didIWin = computed(() => {
      return sortedPlayers.value[0]?.userId === playerId.value;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_MultiplayerChat = __nuxt_component_0;
      const _component_GameCanvas = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "multi-container" }, _attrs))} data-v-abf20490><div class="background-anim" data-v-abf20490></div>`);
      if (step.value === "LOBBY") {
        _push(`<div class="setup-screen glass-panel lobby-panel" data-v-abf20490><h1 class="glow-text" data-v-abf20490>MULTIPLAYER LOBBY</h1><div class="lobby-actions" data-v-abf20490><button class="create-btn" data-v-abf20490>CREATE ROOM</button><button class="refresh-btn" data-v-abf20490>REFRESH</button></div><div class="room-list" data-v-abf20490>`);
        if (rooms.value.length === 0) {
          _push(`<div class="no-rooms" data-v-abf20490>NO ROOMS AVAILABLE</div>`);
        } else {
          _push(`<!--[-->`);
          ssrRenderList(rooms.value, (room) => {
            _push(`<div class="room-card" data-v-abf20490><div class="room-info" data-v-abf20490><h3 class="room-title" data-v-abf20490>${ssrInterpolate(room.title)}</h3><div class="room-meta-row" data-v-abf20490><span class="room-host" data-v-abf20490>HOST: ${ssrInterpolate(room.host)}</span><span class="room-time" data-v-abf20490>TIME: ${ssrInterpolate(room.duration)}s</span></div></div><div class="room-status-badge" data-v-abf20490>${ssrInterpolate(room.currentPlayers)} / ${ssrInterpolate(room.maxPlayers)}</div></div>`);
          });
          _push(`<!--]-->`);
        }
        _push(`</div><button class="back-btn-simple" data-v-abf20490>BACK TO MENU</button></div>`);
      } else if (step.value === "CREATE") {
        _push(`<div class="setup-screen glass-panel" data-v-abf20490><h1 class="glow-text" data-v-abf20490>CREATE ROOM</h1><div class="form-container" data-v-abf20490><div class="form-group" data-v-abf20490><label data-v-abf20490>ROOM TITLE</label><input${ssrRenderAttr("value", newRoomTitle.value)} class="input-field" placeholder="Enter room name" maxlength="20" data-v-abf20490></div><div class="form-group" data-v-abf20490><label data-v-abf20490>MAX PLAYERS: ${ssrInterpolate(newRoomMaxPlayers.value)}</label><input type="range"${ssrRenderAttr("value", newRoomMaxPlayers.value)} min="2" max="10" class="range-slider" data-v-abf20490></div><div class="form-group" data-v-abf20490><label data-v-abf20490>DURATION (Seconds: 30 ~ 1800)</label><input type="number"${ssrRenderAttr("value", newRoomDuration.value)} class="input-field" min="30" max="1800" step="10" data-v-abf20490><div class="duration-hint" data-v-abf20490>30s (30sec) ~ 1800s (30min)</div></div><div class="form-group" data-v-abf20490><label data-v-abf20490>DIFFICULTY: ${ssrInterpolate(newRoomDifficulty.value)}</label><input type="range"${ssrRenderAttr("value", newRoomDifficulty.value)} min="1" max="30" class="range-slider" data-v-abf20490></div><div class="form-group" data-v-abf20490><label data-v-abf20490>MUSIC</label><select class="input-field select-field" data-v-abf20490><!--[-->`);
        ssrRenderList(sampleTracks, (track) => {
          _push(`<option${ssrRenderAttr("value", track)} data-v-abf20490${ssrIncludeBooleanAttr(Array.isArray(newRoomMusic.value) ? ssrLooseContain(newRoomMusic.value, track) : ssrLooseEqual(newRoomMusic.value, track)) ? " selected" : ""}>${ssrInterpolate(track.name)}</option>`);
        });
        _push(`<!--]--></select></div></div><div class="action-row" data-v-abf20490><button class="confirm-btn" data-v-abf20490>CREATE</button><button class="cancel-btn" data-v-abf20490>CANCEL</button></div></div>`);
      } else if (step.value === "ROOM") {
        _push(`<div class="setup-screen glass-panel room-view" data-v-abf20490><h2 class="room-header-title" data-v-abf20490>${ssrInterpolate(currentRoom.value?.title)}</h2><div class="room-header-meta" data-v-abf20490><span data-v-abf20490>TIME: ${ssrInterpolate(currentRoom.value?.duration)}s</span><span data-v-abf20490>DIFF: ${ssrInterpolate(currentRoom.value?.difficulty)}</span><span data-v-abf20490>MUSIC: ${ssrInterpolate(currentRoom.value?.musicTitle || "Random")}</span><span data-v-abf20490>PLAYERS: ${ssrInterpolate(currentRoom.value?.players.length)} / ${ssrInterpolate(currentRoom.value?.maxPlayers)}</span></div><div class="room-content-row" data-v-abf20490><div class="player-grid" data-v-abf20490><!--[-->`);
        ssrRenderList(currentRoom.value?.players, (pl) => {
          _push(`<div class="${ssrRenderClass([{ host: pl.isHost }, "player-card-lg"])}" data-v-abf20490><div class="avatar-lg" data-v-abf20490>◆</div><div class="player-name" data-v-abf20490>${ssrInterpolate(pl.username)}</div>`);
          if (pl.userId === playerId.value) {
            _push(`<span class="me-badge" data-v-abf20490>YOU</span>`);
          } else {
            _push(`<!---->`);
          }
          if (pl.isHost) {
            _push(`<span class="host-badge" data-v-abf20490>HOST</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--><!--[-->`);
        ssrRenderList(currentRoom.value ? currentRoom.value.maxPlayers - currentRoom.value.players.length : 0, (i) => {
          _push(`<div class="player-card-lg empty" data-v-abf20490><div class="avatar-lg empty" data-v-abf20490>+</div><div class="player-name" data-v-abf20490>EMPTY</div></div>`);
        });
        _push(`<!--]--></div><div class="chat-sidebar" data-v-abf20490>`);
        if (currentRoomId.value) {
          _push(ssrRenderComponent(_component_MultiplayerChat, {
            roomId: currentRoomId.value,
            userId: playerId.value,
            username: playerUsername.value,
            messages: currentRoom.value?.messages || []
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
        if (isHost.value) {
          _push(`<div class="host-controls" data-v-abf20490><button class="start-btn"${ssrIncludeBooleanAttr(!currentRoom.value || currentRoom.value.players.length < 1) ? " disabled" : ""} data-v-abf20490>START GAME</button>`);
          if (currentRoom.value && currentRoom.value.players.length < 2) {
            _push(`<p class="hint-text" data-v-abf20490>Waiting for players...</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<div class="guest-controls" data-v-abf20490><div class="loading-spinner" data-v-abf20490></div><p class="waiting-text" data-v-abf20490>WAITING FOR HOST TO START...</p></div>`);
        }
        _push(`<button class="leave-btn" data-v-abf20490>LEAVE ROOM</button></div>`);
      } else if (step.value === "PLAY" || step.value === "RESULT") {
        _push(`<div class="ingame-container" data-v-abf20490>`);
        if (step.value === "RESULT") {
          _push(`<div class="result-overlay" data-v-abf20490><div class="result-box glass-panel" data-v-abf20490><h1 class="victory-text" data-v-abf20490>${ssrInterpolate(didIWin.value ? "VICTORY" : "FINISH")}</h1><div class="result-list" data-v-abf20490><!--[-->`);
          ssrRenderList(sortedPlayers.value, (p, idx) => {
            _push(`<div class="${ssrRenderClass([{ winner: idx === 0, me: p.userId === playerId.value }, "result-row"])}" data-v-abf20490><span class="rank" data-v-abf20490>#${ssrInterpolate(idx + 1)}</span><span class="name" data-v-abf20490>${ssrInterpolate(p.username)}</span><span class="score" data-v-abf20490>${ssrInterpolate(p.progress.toFixed(1))}% (${ssrInterpolate(p.clearCount || 0)} Wins)</span></div>`);
          });
          _push(`<!--]--></div><button class="action-btn" data-v-abf20490>EXIT TO LOBBY</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="match-hud" data-v-abf20490><div class="${ssrRenderClass([{ critical: timeRemaining.value < 30 }, "timer-display"])}" data-v-abf20490>${ssrInterpolate(formatTime(timeRemaining.value))}</div><div class="leaderboard-hud" data-v-abf20490><!--[-->`);
        ssrRenderList(top3Players.value, (p, idx) => {
          _push(`<div class="lb-item" data-v-abf20490><span class="lb-rank" data-v-abf20490>#${ssrInterpolate(idx + 1)}</span><span class="lb-name" data-v-abf20490>${ssrInterpolate(p.username)}</span><span class="lb-score" data-v-abf20490>${ssrInterpolate(p.progress.toFixed(0))}%</span></div>`);
        });
        _push(`<!--]--></div></div>`);
        if (audioBuffer.value) {
          _push(ssrRenderComponent(_component_GameCanvas, {
            key: currentMapIndex.value,
            audioBuffer: audioBuffer.value,
            obstacles: obstacles.value,
            sections: sections.value,
            loadMap: selectedMap.value,
            multiplayerMode: true,
            opponentY: bestOpponent.value?.y || 360,
            opponentProgress: bestOpponent.value?.progress || 0,
            onExit: handleRoundFinish,
            onComplete: ($event) => handleRoundFinish({ outcome: "win" }),
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
const multiplayer = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-abf20490"]]);

export { multiplayer as default };
//# sourceMappingURL=multiplayer-BAXdUjhP.mjs.map
