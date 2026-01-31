import { defineComponent, ref, computed, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderStyle, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderAttr } from 'vue/server-renderer';
import { G as GameEngine } from './game-engine-Dr6cT55m.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

function drawObstacle(ctx, obs, x, y, time, isEditor = false, overrideAngle) {
  const cx = x + obs.width / 2;
  const cy = y + obs.height / 2;
  const angleToUse = obs.angle;
  const hasAngle = angleToUse && angleToUse !== 0;
  if (hasAngle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angleToUse * Math.PI / 180);
    ctx.translate(-cx, -cy);
  }
  if (obs.type === "invisible_wall") {
    if (isEditor) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, obs.width, obs.height);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.fillText("INVISIBLE", x, y + 15);
    }
    if (hasAngle) ctx.restore();
    return;
  } else if (obs.type === "fake_block") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(x, y, obs.width, obs.height);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(x, y, obs.width, obs.height);
    if (isEditor) {
      ctx.fillStyle = "#fff";
      ctx.font = "10px Arial";
      ctx.fillText("FAKE", x + 5, y + 15);
    }
    if (hasAngle) ctx.restore();
    return;
  }
  if (obs.type === "spike" || obs.type === "mini_spike") {
    const isMini = obs.type === "mini_spike";
    ctx.fillStyle = isMini ? "#ff6666" : "#ff4444";
    ctx.shadowBlur = isMini ? 8 : 12;
    ctx.shadowColor = "#ff4444";
    ctx.beginPath();
    if (y > 300) {
      ctx.moveTo(x, y + obs.height);
      ctx.lineTo(x + obs.width / 2, y);
      ctx.lineTo(x + obs.width, y + obs.height);
    } else {
      ctx.moveTo(x, y);
      ctx.lineTo(x + obs.width / 2, y + obs.height);
      ctx.lineTo(x + obs.width, y);
    }
    ctx.closePath();
    ctx.fill();
  } else if (obs.type === "block") {
    ctx.fillStyle = "#444";
    ctx.shadowBlur = 5;
    ctx.shadowColor = "#666";
    ctx.fillRect(x, y, obs.width, obs.height);
    ctx.fillStyle = "#555";
    ctx.fillRect(x + 2, y + 2, obs.width - 4, obs.height - 4);
  } else if (obs.type === "triangle" || obs.type === "steep_triangle") {
    const isSteep = obs.type === "steep_triangle";
    ctx.fillStyle = isSteep ? "#222" : "#333";
    ctx.shadowBlur = 5;
    ctx.shadowColor = "#555";
    ctx.beginPath();
    ctx.moveTo(x, y + obs.height);
    ctx.lineTo(x + obs.width, y + obs.height);
    ctx.lineTo(x + obs.width, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = isSteep ? "#444" : "#555";
    const pad = 4;
    ctx.beginPath();
    ctx.moveTo(x + pad * 2, y + obs.height - pad);
    ctx.lineTo(x + obs.width - pad, y + obs.height - pad);
    ctx.lineTo(x + obs.width - pad, y + pad * 2);
    ctx.fill();
  } else if (obs.type === "saw") {
    const rx = obs.width / 2;
    const ry = obs.height / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = "#ffaa00";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#ffaa00";
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff6600";
    const teeth = 10;
    const rot = time * 8;
    for (let i = 0; i < teeth; i++) {
      const angle = Math.PI * 2 * i / teeth + rot;
      const tx = Math.cos(angle) * rx * 0.75;
      const ty = Math.sin(angle) * ry * 0.75;
      ctx.beginPath();
      ctx.ellipse(tx, ty, rx * 0.15, ry * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#cc8800";
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.25, ry * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (obs.type === "spike_ball") {
    const rx = obs.width / 2;
    const ry = obs.height / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = "#666";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#444";
    const spikes = 8;
    const rotation = time * 3;
    ctx.fillStyle = "#444";
    for (let i = 0; i < spikes; i++) {
      const angle = Math.PI * 2 * i / spikes + rotation;
      ctx.beginPath();
      const tx = Math.cos(angle) * rx * 1.2;
      const ty = Math.sin(angle) * ry * 1.2;
      ctx.moveTo(Math.cos(angle - 0.2) * rx * 0.8, Math.sin(angle - 0.2) * ry * 0.8);
      ctx.lineTo(tx, ty);
      ctx.lineTo(Math.cos(angle + 0.2) * rx * 0.8, Math.sin(angle + 0.2) * ry * 0.8);
      ctx.fill();
    }
    const grad = ctx.createRadialGradient(-rx * 0.3, -ry * 0.3, rx * 0.1, 0, 0, rx);
    grad.addColorStop(0, "#888");
    grad.addColorStop(1, "#222");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.8, ry * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (obs.type === "laser") {
    const centerY = y + obs.height / 2;
    const glow = Math.sin(time * 15) * 5 + 10;
    ctx.strokeStyle = "#ff3333";
    ctx.lineWidth = 2;
    ctx.shadowBlur = Math.max(0, glow);
    ctx.shadowColor = "#ff0000";
    ctx.beginPath();
    ctx.moveTo(x, centerY);
    ctx.lineTo(x + obs.width, centerY);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(x, centerY);
    ctx.lineTo(x + obs.width, centerY);
    ctx.stroke();
    ctx.fillStyle = "#777";
    ctx.fillRect(x, y, 8, obs.height);
    ctx.fillRect(x + obs.width - 8, y, 8, obs.height);
  } else if (obs.type === "v_laser") {
    const centerX = x + obs.width / 2;
    const glow = Math.sin(time * 15) * 5 + 10;
    ctx.strokeStyle = "#ff3333";
    ctx.lineWidth = 2;
    ctx.shadowBlur = Math.max(0, glow);
    ctx.shadowColor = "#ff0000";
    ctx.beginPath();
    ctx.moveTo(centerX, y);
    ctx.lineTo(centerX, y + obs.height);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(centerX, y);
    ctx.lineTo(centerX, y + obs.height);
    ctx.stroke();
    ctx.fillStyle = "#777";
    ctx.fillRect(x, y, obs.width, 8);
    ctx.fillRect(x, y + obs.height - 8, obs.width, 8);
  } else if (obs.type === "slope") {
    ctx.fillStyle = "#222";
    ctx.beginPath();
    if ((obs.angle || 0) > 0) {
      ctx.moveTo(x, y + obs.height);
      ctx.lineTo(x + obs.width, y);
      ctx.lineTo(x, y);
    } else {
      ctx.moveTo(x + obs.width, y + obs.height);
      ctx.lineTo(x, y);
      ctx.lineTo(x + obs.width, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(100,200,255,0.3)";
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (obs.type === "mine") {
    const radius = obs.width / 2;
    const pulse = Math.sin(time * 10) * 0.1 + 0.9;
    ctx.fillStyle = "#ff3333";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ff0000";
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i + time * 2;
      const px = cx + Math.cos(angle) * radius * pulse;
      const py = cy + Math.sin(angle) * radius * pulse;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#550000";
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (obs.type === "orb") {
    const rx = obs.width / 2;
    const ry = obs.height / 2;
    const pulse = Math.sin(time * 5) * 0.1 + 1;
    const grad = ctx.createRadialGradient(cx, cy, rx * 0.1, cx, cy, rx * pulse);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.4, "#aa44ff");
    grad.addColorStop(0.8, "#4400cc");
    grad.addColorStop(1, "rgba(68, 0, 204, 0)");
    ctx.fillStyle = grad;
    ctx.globalCompositeOperation = "lighter";
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * pulse, ry * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  } else if (obs.type === "hammer") {
    ctx.save();
    ctx.translate(cx, cy);
    const swing = Math.sin(time * 3) * 0.5;
    ctx.rotate(swing);
    ctx.fillStyle = "#666";
    ctx.fillRect(-5, -obs.height / 2, 10, obs.height * 0.7);
    ctx.fillStyle = "#888";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#fff";
    ctx.fillRect(-obs.width / 2, obs.height * 0.2 - obs.height / 2, obs.width, obs.height * 0.3);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(-obs.width / 2, obs.height * 0.2 - obs.height / 2, obs.width, obs.height * 0.3);
    ctx.restore();
  } else if (["rotor", "spark_mine"].includes(obs.type)) {
    ctx.save();
    ctx.translate(cx, cy);
    const spinSpeed = obs.type === "spark_mine" ? 2 : 8;
    const timeRot = time * spinSpeed;
    ctx.rotate(timeRot);
    const radius = obs.width / 2;
    if (obs.type === "rotor") {
      ctx.fillStyle = "#ff3333";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ff0000";
      for (let i = 0; i < 3; i++) {
        ctx.rotate(Math.PI * 2 / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-5, -obs.height / 2);
        ctx.lineTo(5, -obs.height / 2);
        ctx.fill();
      }
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (obs.type === "spark_mine") {
      ctx.fillStyle = "#ffaa00";
      ctx.beginPath();
      const spikes = 12;
      for (let k = 0; k < spikes * 2; k++) {
        const r = k % 2 === 0 ? radius : radius * 0.4;
        const theta = Math.PI * k / spikes;
        ctx.lineTo(Math.cos(theta) * r, Math.sin(theta) * r);
      }
      ctx.fill();
    }
    ctx.restore();
  } else if (obs.type === "laser_beam") {
    const cyBeam = y + obs.height / 2;
    const pulse = Math.sin(time * 20) * 2 + 3;
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = obs.height + pulse;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(x, cyBeam);
    ctx.lineTo(x + obs.width, cyBeam);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = obs.height * 0.3;
    ctx.stroke();
  } else if (obs.type === "piston_v") {
    ctx.fillStyle = "#555";
    ctx.fillRect(x, y, obs.width, obs.height);
    ctx.fillStyle = "#888";
    ctx.fillRect(x + obs.width * 0.3, y, obs.width * 0.4, obs.height);
    ctx.fillStyle = "#333";
    if (y < 360) ctx.fillRect(x, y + obs.height - 20, obs.width, 20);
    else ctx.fillRect(x, y, obs.width, 20);
  } else if (obs.type === "cannon") {
    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.arc(x + obs.width / 2, y + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(x + obs.width / 2, y + obs.height / 2, obs.width / 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (["falling_spike", "growing_spike"].includes(obs.type)) {
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    const cx2 = x + obs.width / 2;
    if (obs.type === "falling_spike") {
      ctx.moveTo(x, y);
      ctx.lineTo(x + obs.width, y);
      ctx.lineTo(cx2, y + obs.height);
    } else {
      ctx.moveTo(x, y + obs.height);
      ctx.lineTo(x + obs.width, y + obs.height);
      ctx.lineTo(cx2, y);
    }
    ctx.fill();
  } else if (obs.type === "crusher_jaw") {
    const cx2 = x + obs.width / 2;
    const cy2 = y + obs.height / 2;
    const padding = 5;
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.moveTo(x + padding, y);
    ctx.lineTo(x + obs.width - padding, y);
    ctx.lineTo(cx2, cy2 - 5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + padding, y + obs.height);
    ctx.lineTo(x + obs.width - padding, y + obs.height);
    ctx.lineTo(cx2, cy2 + 5);
    ctx.fill();
    ctx.fillStyle = "#ffaaaa";
    ctx.beginPath();
    ctx.moveTo(x + obs.width * 0.3, y);
    ctx.lineTo(x + obs.width * 0.35, y + obs.height * 0.3);
    ctx.lineTo(x + obs.width * 0.4, y);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + obs.width * 0.6, y + obs.height);
    ctx.lineTo(x + obs.width * 0.65, y + obs.height * 0.7);
    ctx.lineTo(x + obs.width * 0.7, y + obs.height);
    ctx.fill();
  } else if (obs.type === "swing_blade") {
    const cx2 = x + obs.width / 2;
    const cy2 = y;
    ctx.save();
    ctx.translate(cx2, cy2);
    const swing = Math.sin(time * 2) * 0.8;
    ctx.rotate(swing);
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, obs.height);
    ctx.stroke();
    ctx.fillStyle = "#ccc";
    ctx.beginPath();
    ctx.ellipse(0, obs.height, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (obs.type === "planet" || obs.type === "star") {
    const isStar = obs.type === "star";
    const radius = obs.width / 2;
    if (isStar) {
      const pulse = 1 + Math.sin(time * 5) * 0.05;
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * pulse);
      grad.addColorStop(0, "#ffff88");
      grad.addColorStop(0.5, "#ffaa00");
      grad.addColorStop(1, "rgba(255, 68, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.2 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const grad = ctx.createRadialGradient(cx, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      grad.addColorStop(0, "#4488ff");
      grad.addColorStop(1, "#002266");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    if (obs.children && obs.children.length > 0) {
      const speed = obs.customData?.orbitSpeed ?? 1;
      for (let i = 0; i < obs.children.length; i++) {
        const child = obs.children[i];
        if (!child) continue;
        const theta = time * speed + i * (Math.PI * 2 / obs.children.length);
        const dist = obs.customData?.orbitDistance ?? obs.width * 0.85;
        const px = cx + Math.cos(theta) * dist;
        const py = cy + Math.sin(theta) * dist;
        const childX = px - child.width / 2;
        const childY = py - child.height / 2;
        drawObstacle(ctx, child, childX, childY, time, isEditor);
      }
    }
  }
  if (hasAngle) ctx.restore();
}
const interpolationFactor = 0.1;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "GameCanvas",
  __ssrInlineRender: true,
  props: {
    audioBuffer: {},
    obstacles: {},
    sections: {},
    autoRetry: { type: Boolean },
    loadMap: {},
    isViewOnly: { type: Boolean },
    multiplayerMode: { type: Boolean },
    difficulty: {},
    opponentY: {},
    opponentProgress: {},
    practiceMode: { type: Boolean },
    tutorialMode: { type: Boolean },
    invincible: { type: Boolean }
  },
  emits: ["retry", "exit", "complete", "map-ready", "progress-update", "record-update"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const canvas = ref(null);
    const engine = ref(new GameEngine());
    const gameOver = ref(false);
    const victory = ref(false);
    const score = ref(0);
    const progress = ref(0);
    const failReason = ref("");
    const progressPct = ref(0);
    const countdown = ref(null);
    const attempts = ref(0);
    const isGravityInverted = ref(false);
    const isMini = ref(false);
    const difficulty = ref(props.difficulty || 10);
    const isAutoplayUI = ref(false);
    const hasSaved = ref(false);
    const bestProgress = ref(0);
    const isNewBest = ref(false);
    const userRating = ref(15);
    const hasVoted = ref(false);
    const isRecordingSaved = ref(false);
    const isSavingVideo = ref(false);
    let mediaRecorder = null;
    let recordedChunks = [];
    const startRecording = () => {
      if (!canvas.value) return;
      try {
        recordedChunks = [];
        isRecordingSaved.value = false;
        const stream = canvas.value.captureStream(30);
        if (audioCtx && audioSource) {
          try {
            const audioDestination = audioCtx.createMediaStreamDestination();
            audioSource.connect(audioDestination);
            const audioTracks = audioDestination.stream.getAudioTracks();
            audioTracks.forEach((track) => stream.addTrack(track));
          } catch (e) {
            console.log("[Recording] Audio capture not available, video only");
          }
        }
        const options = { mimeType: "video/webm;codecs=vp9" };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = "video/webm";
        }
        mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };
        mediaRecorder.start(100);
        console.log("[Recording] Started");
      } catch (e) {
        console.error("[Recording] Failed to start:", e);
      }
    };
    const stopRecording = () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        console.log("[Recording] Stopped");
      }
    };
    const currentTrackTime = ref(0);
    const isComputingPath = ref(false);
    const computingProgress = ref(0);
    const isMapValidated = ref(false);
    let autoRetryTimer = null;
    const interpOpponentY = ref(360);
    const interpOpponentProgress = ref(0);
    let audioCtx = null;
    let audioSource = null;
    const checkpoints = ref([]);
    let clickDownBuffer = null;
    let clickUpBuffer = null;
    let lastAiHolding = false;
    const dynamicTutorialMessage = ref(null);
    const activeTutorialMessage = computed(() => {
      if (dynamicTutorialMessage.value) return dynamicTutorialMessage.value;
      if (!props.loadMap?.messages) return null;
      const currentProgress = progress.value;
      const msgs = props.loadMap.messages.filter((m) => m.progress <= currentProgress);
      if (msgs.length === 0) return null;
      return msgs[msgs.length - 1].text;
    });
    let animationId;
    let lastFrameTime = 0;
    const isRunning = ref(false);
    const speedColor = computed(() => {
      const mult = engine.value.speedMultiplier;
      if (mult < 0.6) return "#aa5500";
      if (mult < 0.8) return "#ff8800";
      if (mult < 1.1) return "#4488ff";
      if (mult < 1.5) return "#44ff44";
      if (mult < 1.8) return "#ff44ff";
      return "#ff4444";
    });
    const speedLabel = computed(() => {
      const mult = engine.value.speedMultiplier;
      if (mult < 0.6) return "0.25x";
      if (mult < 0.8) return "0.5x";
      if (mult < 1.1) return "1x";
      if (mult < 1.5) return "2x";
      if (mult < 1.8) return "3x";
      return "4x";
    });
    computed(() => {
      if (difficulty.value < 8) return "EASY";
      if (difficulty.value < 16) return "NORMAL";
      if (difficulty.value < 24) return "HARD";
      return "IMPOSSIBLE";
    });
    const loadSfx = async () => {
      if (!audioCtx) return;
      const fetchAudio = async (url) => {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          return await audioCtx.decodeAudioData(arrayBuffer);
        } catch (e) {
          console.error(`Failed to load sfx: ${url}`, e);
          return null;
        }
      };
      if (!clickDownBuffer) clickDownBuffer = await fetchAudio("/audio/click_down.mp3");
      if (!clickUpBuffer) clickUpBuffer = await fetchAudio("/audio/click_up.mp3");
    };
    const playSfx = (buffer, volume = 0.5) => {
      if (!audioCtx || !buffer) return;
      try {
        const source = audioCtx.createBufferSource();
        const gain = audioCtx.createGain();
        source.buffer = buffer;
        gain.gain.value = volume;
        source.connect(gain);
        gain.connect(audioCtx.destination);
        source.start();
      } catch (e) {
      }
    };
    const startGame = () => {
      if (!props.audioBuffer || !canvas.value) return;
      stopGame();
      if (!audioCtx) {
        audioCtx = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      loadSfx();
      const wasAutoplay = props.multiplayerMode ? false : engine.value.isAutoplay;
      engine.value.setMapConfig({
        density: 1,
        portalFrequency: 0.15,
        difficulty: difficulty.value
      });
      engine.value.reset();
      engine.value.isAutoplay = wasAutoplay;
      isAutoplayUI.value = wasAutoplay;
      if (props.loadMap) {
        engine.value.loadMapData(props.loadMap);
        difficulty.value = props.loadMap.difficulty;
        isMapValidated.value = true;
        if (props.tutorialMode && props.loadMap.autoplayLog && props.loadMap.autoplayLog.length > 0) {
          engine.value.isAutoplay = true;
          isAutoplayUI.value = true;
          console.log("[Tutorial] Using saved autoplayLog, length:", props.loadMap.autoplayLog.length);
        }
        if (props.loadMap.bestScore) {
          bestProgress.value = Math.min(100, props.loadMap.bestScore / 10);
        } else {
          bestProgress.value = 0;
        }
      } else {
        engine.value.generateMap(props.obstacles, props.sections, props.audioBuffer.duration, void 0, false);
        if (props.tutorialMode) {
          engine.value.isAutoplay = true;
          isAutoplayUI.value = true;
        }
        validateMapInBackground();
      }
      gameOver.value = false;
      victory.value = false;
      failReason.value = "";
      progressPct.value = 0;
      progress.value = 0;
      score.value = 0;
      isGravityInverted.value = false;
      lastAiHolding = false;
      emit("progress-update", { progress: 0, ghostProgress: 0 });
      emit("progress-update", { progress: 0, ghostProgress: 0 });
      if (checkpoints.value.length === 0) {
        draw();
        startCountdown();
      } else {
        checkpoints.value = [];
        draw();
        startCountdown();
      }
      attempts.value++;
    };
    const restoreCheckpoint = () => {
      if (checkpoints.value.length === 0 || !props.practiceMode) return;
      const cp = checkpoints.value[checkpoints.value.length - 1];
      engine.value.playerX = cp.x;
      engine.value.playerY = cp.y;
      engine.value.velocity = cp.velocity;
      engine.value.isHolding = cp.isHolding;
      engine.value.cameraX = cp.cameraX;
      engine.value.isGravityInverted = cp.isGravityInverted;
      engine.value.speedMultiplier = cp.speedMultiplier;
      engine.value.isMini = cp.isMini;
      engine.value.waveAngle = cp.waveAngle;
      engine.value.score = cp.score;
      engine.value.progress = cp.progress;
      engine.value.obstacles = JSON.parse(JSON.stringify(cp.obstacles));
      engine.value.portals = JSON.parse(JSON.stringify(cp.portals));
      gameOver.value = false;
      victory.value = false;
      failReason.value = "";
      isRunning.value = true;
      engine.value.isDead = false;
      engine.value.isPlaying = true;
      if (audioSource) {
        try {
          audioSource.stop();
        } catch (e) {
        }
      }
      if (audioCtx && props.audioBuffer) {
        audioSource = audioCtx.createBufferSource();
        audioSource.buffer = props.audioBuffer;
        audioSource.connect(audioCtx.destination);
        const offset = cp.startTimeOffset;
        engine.value.startTime = audioCtx.currentTime - offset;
        audioSource.start(0, offset);
        lastFrameTime = audioCtx.currentTime;
      }
      engine.value.trail = [];
      loop();
    };
    const validateMapInBackground = async () => {
      if (props.multiplayerMode) return;
      if (engine.value.autoplayLog.length > 0) {
        isMapValidated.value = true;
        return;
      }
      isMapValidated.value = false;
      isComputingPath.value = true;
      computingProgress.value = 0;
      let resumeTime = 0;
      let sectionRetries = 0;
      for (let attempt = 0; attempt < 100; attempt++) {
        try {
          if (attempt > 0) {
            const failure = engine.value.validationFailureInfo;
            if (failure && failure.x > 0) {
              const failPoint = engine.value.autoplayLog.find((p) => p.x >= failure.x - 500);
              const newResumeTime = failPoint ? failPoint.time : 0;
              if (Math.abs(newResumeTime - resumeTime) < 0.1) {
                sectionRetries++;
              } else {
                resumeTime = newResumeTime;
                sectionRetries = 0;
              }
              console.log(`[Validation] Fixing impossible part at X=${failure.x.toFixed(0)} (T=${resumeTime.toFixed(2)}s). Section retry: ${sectionRetries}`);
              const resumeOptions = {
                time: resumeTime,
                stateEvents: engine.value.lastStateEvents,
                beatActions: engine.value.lastBeatActions,
                obstacles: engine.value.obstacles,
                portals: engine.value.portals
              };
              engine.value.generateMap(props.obstacles, props.sections, props.audioBuffer.duration, void 0, false, sectionRetries, 120, 2, void 0, resumeOptions);
            } else {
              console.log(`[Validation] No failure info. Restarting full generation. Attempt ${attempt}`);
              engine.value.generateMap(props.obstacles, props.sections, props.audioBuffer.duration, void 0, false, attempt);
              resumeTime = 0;
              sectionRetries = 0;
            }
          }
          const success = await engine.value.computeAutoplayLogAsync(engine.value.playerX, engine.value.playerY, (p) => {
            const resumeProgress = resumeTime / props.audioBuffer.duration * 100;
            const currentSearchProgress = p * (100 - resumeProgress);
            computingProgress.value = resumeProgress + currentSearchProgress;
          });
          if (success) {
            console.log(`[Validation] Path found after ${attempt} total fixes!`);
            isMapValidated.value = true;
            break;
          }
        } catch (e) {
          console.error("Background validation error:", e);
          break;
        }
      }
      isComputingPath.value = false;
    };
    const startCountdown = () => {
      countdown.value = "GO!";
      setTimeout(() => {
        countdown.value = null;
        runGame();
      }, 400);
    };
    const runGame = () => {
      if (!audioCtx || !props.audioBuffer) return;
      audioSource = audioCtx.createBufferSource();
      audioSource.buffer = props.audioBuffer;
      audioSource.connect(audioCtx.destination);
      audioSource.onended = () => {
        if (!gameOver.value && isRunning.value) {
          handleVictory();
        }
      };
      const startTime = audioCtx.currentTime + 0.05;
      audioSource.start(startTime);
      engine.value.isPlaying = true;
      engine.value.startTime = startTime;
      isRunning.value = true;
      lastFrameTime = audioCtx.currentTime;
      startRecording();
      loop();
    };
    const stopGame = () => {
      isRunning.value = false;
      if (autoRetryTimer) clearTimeout(autoRetryTimer);
      if (audioSource) {
        try {
          audioSource.stop();
        } catch (e) {
        }
        audioSource.disconnect();
        audioSource = null;
      }
      if (audioCtx) {
        try {
          audioCtx.close();
        } catch (e) {
        }
        audioCtx = null;
      }
      cancelAnimationFrame(animationId);
    };
    const handleGameOver = () => {
      gameOver.value = true;
      failReason.value = engine.value.failReason || "CRASHED";
      progressPct.value = engine.value.getProgress();
      isRunning.value = false;
      if (progressPct.value > bestProgress.value) {
        bestProgress.value = progressPct.value;
        isNewBest.value = true;
      } else {
        isNewBest.value = false;
      }
      if (audioSource) {
        try {
          audioSource.stop();
        } catch (e) {
        }
      }
      setTimeout(() => {
        stopRecording();
        emit("record-update", { score: score.value, progress: progress.value });
      }, 3e3);
      const hitboxLoop = () => {
        if (gameOver.value) {
          draw();
          requestAnimationFrame(hitboxLoop);
        }
      };
      hitboxLoop();
      autoRetryTimer = setTimeout(() => {
        if (gameOver.value) {
          if (props.practiceMode && checkpoints.value.length > 0) {
            restoreCheckpoint();
          } else {
            startGame();
          }
        }
      }, props.practiceMode ? 1e3 : 3e3);
    };
    const handleVictory = () => {
      victory.value = true;
      isRunning.value = false;
      score.value = Math.floor(score.value + 1e3);
      progressPct.value = 100;
      if (audioSource) {
        try {
          audioSource.stop();
        } catch (e) {
        }
      }
      setTimeout(() => {
        stopRecording();
        emit("record-update", { score: score.value, progress: 100 });
      }, 3e3);
      emit("complete", { score: score.value });
      const victoryLoop = () => {
        if (victory.value) {
          draw();
          requestAnimationFrame(victoryLoop);
        }
      };
      victoryLoop();
    };
    const loop = () => {
      if (!isRunning.value && !gameOver.value && !victory.value) return;
      update();
      draw();
      if (isRunning.value) {
        animationId = requestAnimationFrame(loop);
      }
    };
    const update = () => {
      if (!audioCtx) return;
      const t = audioCtx.currentTime;
      const trackTime = t - engine.value.startTime;
      let dt = t - lastFrameTime;
      lastFrameTime = t;
      if (dt > 0.1) dt = 0.1;
      if (dt < 0) dt = 0;
      engine.value.update(dt, trackTime);
      currentTrackTime.value = trackTime;
      if (engine.value.isAutoplay && props.tutorialMode) {
        if (engine.value.isHolding && !lastAiHolding) {
          playSfx(clickDownBuffer, 1.5);
        } else if (!engine.value.isHolding && lastAiHolding) {
          playSfx(clickUpBuffer, 1);
        }
        lastAiHolding = engine.value.isHolding;
      }
      score.value = engine.value.score;
      progress.value = engine.value.progress;
      isGravityInverted.value = engine.value.isGravityInverted;
      isMini.value = engine.value.isMini;
      if (engine.value.isDead) {
        if (props.invincible) {
          engine.value.isDead = false;
          engine.value.isPlaying = true;
        } else if (!gameOver.value) {
          handleGameOver();
        }
      } else if (!engine.value.isPlaying && isRunning.value && !gameOver.value && !victory.value) {
        handleVictory();
      }
      if ((props.multiplayerMode || props.tutorialMode) && engine.value.totalLength > 0) {
        const currentProgress = engine.value.playerX / engine.value.totalLength * 100;
        emit("progress-update", {
          progress: Math.min(100, currentProgress),
          y: engine.value.playerY,
          ghostProgress: props.opponentProgress || 0
        });
        const targetY = props.opponentY !== void 0 ? props.opponentY : 360;
        const targetProg = props.opponentProgress || 0;
        interpOpponentY.value += (targetY - interpOpponentY.value) * interpolationFactor;
        interpOpponentProgress.value += (targetProg - interpOpponentProgress.value) * interpolationFactor;
      }
    };
    const draw = () => {
      const ctx = canvas.value?.getContext("2d");
      if (!ctx || !canvas.value) return;
      const w = canvas.value.width;
      const h = canvas.value.height;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, "#0a0a1a");
      bgGrad.addColorStop(0.5, "#151530");
      bgGrad.addColorStop(1, "#0a0a1a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.strokeStyle = "rgba(80, 80, 180, 0.08)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      const offsetX = -engine.value.cameraX % gridSize;
      for (let x = offsetX; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.restore();
      ctx.save();
      ctx.translate(-engine.value.cameraX, 0);
      const topColor = engine.value.isGravityInverted ? "#ffff00" : "#ff00ff";
      const bottomColor = engine.value.isGravityInverted ? "#ffff00" : "#00ffff";
      ctx.fillStyle = topColor;
      ctx.globalAlpha = 0.15;
      ctx.fillRect(engine.value.cameraX, 0, w, engine.value.minY);
      ctx.globalAlpha = 1;
      ctx.fillStyle = bottomColor;
      ctx.globalAlpha = 0.15;
      ctx.fillRect(engine.value.cameraX, engine.value.maxY, w, h - engine.value.maxY);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = topColor;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = topColor;
      ctx.beginPath();
      ctx.moveTo(engine.value.cameraX, engine.value.minY);
      ctx.lineTo(engine.value.cameraX + w, engine.value.minY);
      ctx.stroke();
      ctx.strokeStyle = bottomColor;
      ctx.shadowColor = bottomColor;
      ctx.beginPath();
      ctx.moveTo(engine.value.cameraX, engine.value.maxY);
      ctx.lineTo(engine.value.cameraX + w, engine.value.maxY);
      ctx.stroke();
      ctx.shadowBlur = 0;
      engine.value.portals.forEach((portal) => {
        if (portal.x + portal.width < engine.value.cameraX - 50) return;
        if (portal.x > engine.value.cameraX + w + 50) return;
        ctx.save();
        if (portal.angle) {
          ctx.translate(portal.x + portal.width / 2, portal.y + portal.height / 2);
          ctx.rotate(portal.angle * Math.PI / 180);
          ctx.translate(-(portal.x + portal.width / 2), -(portal.y + portal.height / 2));
        }
        const color = engine.value.getPortalColor(portal.type);
        const symbol = engine.value.getPortalSymbol(portal.type);
        const isMiniPortal = portal.type === "mini_pink" || portal.type === "mini_green";
        ctx.globalAlpha = portal.activated ? 0.3 : 1;
        ctx.fillStyle = color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        if (isMiniPortal) {
          const cx = portal.x + portal.width / 2;
          const cy = portal.y + portal.height / 2;
          const rx = portal.width / 2;
          const ry = portal.height / 2;
          const spikes = 8;
          ctx.beginPath();
          for (let i = 0; i <= spikes * 2; i++) {
            const angle2 = Math.PI * 2 * i / (spikes * 2) - Math.PI / 2;
            const isOuter = i % 2 === 0;
            const radius = isOuter ? 1 : 0.6;
            const px2 = cx + Math.cos(angle2) * rx * radius;
            const py2 = cy + Math.sin(angle2) * ry * radius;
            if (i === 0) ctx.moveTo(px2, py2);
            else ctx.lineTo(px2, py2);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.roundRect(portal.x, portal.y, portal.width, portal.height, 12);
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.beginPath();
          ctx.roundRect(portal.x + 6, portal.y + 6, portal.width - 12, portal.height - 12, 8);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#000";
        ctx.font = "bold 18px Outfit";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(symbol, portal.x + portal.width / 2, portal.y + portal.height / 2);
        ctx.restore();
      });
      engine.value.obstacles.forEach((obs) => {
        if (obs.x + obs.width < engine.value.cameraX - 50) return;
        if (obs.x > engine.value.cameraX + w + 50) return;
        ctx.save();
        drawObstacle(ctx, obs, obs.x, obs.y, currentTrackTime.value);
        ctx.restore();
      });
      if (engine.value.isAutoplay && engine.value.aiPredictedPath.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(engine.value.aiPredictedPath[0].x, engine.value.aiPredictedPath[0].y);
        for (let i = 1; i < engine.value.aiPredictedPath.length; i++) {
          ctx.lineTo(engine.value.aiPredictedPath[i].x, engine.value.aiPredictedPath[i].y);
        }
        ctx.strokeStyle = "rgba(0, 255, 255, 0.15)";
        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.strokeStyle = "rgba(0, 255, 255, 0.6)";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }
      if (engine.value.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(engine.value.trail[0].x, engine.value.trail[0].y);
        for (let i = 1; i < engine.value.trail.length; i++) {
          const point = engine.value.trail[i];
          if (point) ctx.lineTo(point.x, point.y);
        }
        const trailColor = engine.value.isGravityInverted ? "rgba(255, 255, 0, 0.6)" : "rgba(0, 255, 255, 0.6)";
        ctx.strokeStyle = trailColor;
        ctx.lineWidth = 14;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      if (props.multiplayerMode) {
        const oppProg = interpOpponentProgress.value;
        const ghostX = oppProg / 100 * engine.value.totalLength;
        const ghostY = interpOpponentY.value;
        ctx.save();
        ctx.fillStyle = "rgba(255, 0, 255, 0.8)";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff00ff";
        const size2 = 35;
        ctx.translate(ghostX, ghostY);
        ctx.beginPath();
        ctx.moveTo(size2 / 2, 0);
        ctx.lineTo(-size2 / 3, -size2 / 3);
        ctx.lineTo(-size2 / 6, 0);
        ctx.lineTo(-size2 / 3, size2 / 3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.font = "bold 16px Outfit";
        ctx.textAlign = "center";
        ctx.fillText("OPPONENT", 0, -30);
        ctx.restore();
      }
      engine.value.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.globalAlpha = 1;
      if (engine.value.boss.active) {
        const boss = engine.value.boss;
        ctx.save();
        ctx.translate(boss.x, boss.y);
        ctx.shadowBlur = 40;
        ctx.shadowColor = "#ff0000";
        ctx.fillStyle = "#440000";
        ctx.beginPath();
        const size2 = 60;
        for (let i = 0; i < 8; i++) {
          const theta = Math.PI * 2 * i / 8;
          ctx.lineTo(Math.cos(theta) * size2, Math.sin(theta) * size2);
        }
        ctx.fill();
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        boss.projectiles.forEach((p) => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.fillStyle = "#ffff00";
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#ffaa00";
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }
      if (props.practiceMode) {
        checkpoints.value.forEach((cp, idx) => {
          ctx.save();
          const cpSize = 15;
          const isLast = idx === checkpoints.value.length - 1;
          ctx.translate(cp.x, cp.y);
          ctx.beginPath();
          ctx.moveTo(0, -cpSize);
          ctx.lineTo(cpSize, 0);
          ctx.lineTo(0, cpSize);
          ctx.lineTo(-cpSize, 0);
          ctx.closePath();
          if (isLast) {
            ctx.fillStyle = "#00ff00";
            ctx.shadowBlur = 15;
            ctx.shadowColor = "#00ff00";
          } else {
            ctx.fillStyle = "rgba(0, 255, 0, 0.4)";
          }
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        });
      }
      const px = engine.value.playerX;
      const py = engine.value.playerY;
      const size = engine.value.playerSize;
      const direction = engine.value.isHolding ? -1 : 1;
      const gravityDir = engine.value.isGravityInverted ? -direction : direction;
      const angle = Math.atan2(gravityDir, 1);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);
      const playerColor = engine.value.isGravityInverted ? "#ffff00" : engine.value.isHolding ? "#00ffff" : "#ff00ff";
      ctx.shadowBlur = 25;
      ctx.shadowColor = playerColor;
      const waveSize = size * 1.2;
      ctx.beginPath();
      ctx.moveTo(waveSize, 0);
      ctx.lineTo(-waveSize * 0.5, -waveSize * 0.6);
      ctx.lineTo(-waveSize * 0.15, 0);
      ctx.lineTo(-waveSize * 0.5, waveSize * 0.6);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(-waveSize, 0, waveSize, 0);
      gradient.addColorStop(0, playerColor);
      gradient.addColorStop(0.5, "#ffffff");
      gradient.addColorStop(1, playerColor);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      ctx.shadowBlur = 0;
      if (engine.value.showHitboxes) {
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 2;
        ctx.strokeRect(px - size, py - size, size * 2, size * 2);
        ctx.strokeStyle = "#ff0000";
        engine.value.obstacles.forEach((obs) => {
          if (obs.x + obs.width < engine.value.cameraX - 50) return;
          if (obs.x > engine.value.cameraX + w + 100) return;
          const state = engine.value.getObstacleStateAt(obs, currentTrackTime.value);
          const obsY = state.y;
          const obsAngle = state.angle || 0;
          ctx.save();
          ctx.translate(obs.x + obs.width / 2, obsY + obs.height / 2);
          if (obsAngle !== 0) ctx.rotate(obsAngle * Math.PI / 180);
          const hw = obs.width / 2;
          const hh = obs.height / 2;
          if (obs.type === "slope") {
            ctx.beginPath();
            if (obsAngle > 0) {
              ctx.moveTo(-hw, hh);
              ctx.lineTo(hw, -hh);
              ctx.lineTo(-hw, -hh);
            } else {
              ctx.moveTo(hw, hh);
              ctx.lineTo(-hw, -hh);
              ctx.lineTo(hw, -hh);
            }
            ctx.closePath();
            ctx.stroke();
          } else if (obs.type === "triangle" || obs.type === "steep_triangle") {
            ctx.beginPath();
            ctx.moveTo(-hw, hh);
            ctx.lineTo(hw, hh);
            ctx.lineTo(hw, -hh);
            ctx.closePath();
            ctx.stroke();
          } else if (obs.type === "spike" || obs.type === "mini_spike") {
            const isBottom = obs.y > 360;
            ctx.beginPath();
            if (isBottom) {
              ctx.moveTo(-hw, hh);
              ctx.lineTo(0, -hh);
              ctx.lineTo(hw, hh);
            } else {
              ctx.moveTo(-hw, -hh);
              ctx.lineTo(0, hh);
              ctx.lineTo(hw, -hh);
            }
            ctx.closePath();
            ctx.stroke();
          } else if (obs.type === "planet" || obs.type === "star") {
            ctx.beginPath();
            ctx.arc(0, 0, hw, 0, Math.PI * 2);
            ctx.stroke();
            const time = currentTrackTime.value;
            const hasChildren = obs.children && obs.children.length > 0;
            if (hasChildren) {
              const children = obs.children;
              const speed = obs.customData?.orbitSpeed ?? 1;
              children.forEach((child, i) => {
                const theta = time * speed + i * (Math.PI * 2 / children.length);
                const dist = obs.customData?.orbitDistance ?? obs.width * 0.85;
                const cx = Math.cos(theta) * dist;
                const cy = Math.sin(theta) * dist;
                const childSize = child.width ? child.width / 2 : 14;
                ctx.beginPath();
                ctx.arc(cx, cy, childSize, 0, Math.PI * 2);
                ctx.stroke();
                if (child.type === "planet") {
                  const moonCount = child.customData?.orbitCount ?? 2;
                  const moonSpeed = child.customData?.orbitSpeed ?? 2;
                  const moonDist = child.customData?.orbitDistance ?? child.width * 0.8;
                  for (let j = 0; j < moonCount; j++) {
                    const mTheta = time * moonSpeed + j * (Math.PI * 2 / moonCount);
                    const mx = cx + Math.cos(mTheta) * moonDist;
                    const my = cy + Math.sin(mTheta) * moonDist;
                    const mSize = 8;
                    ctx.beginPath();
                    ctx.arc(mx, my, mSize, 0, Math.PI * 2);
                    ctx.stroke();
                  }
                }
              });
            } else {
              const count = obs.customData?.orbitCount ?? (obs.type === "star" ? 0 : 2);
              if (count > 0) {
                const speed = obs.customData?.orbitSpeed ?? 1;
                const dist = obs.customData?.orbitDistance ?? obs.width * 0.8;
                for (let i = 0; i < count; i++) {
                  const theta = time * speed + i * (Math.PI * 2 / count);
                  const cx = Math.cos(theta) * dist;
                  const cy = Math.sin(theta) * dist;
                  const moonRadius = obs.type === "star" ? 20 : 10;
                  ctx.beginPath();
                  ctx.arc(cx, cy, moonRadius, 0, Math.PI * 2);
                  ctx.stroke();
                }
              }
            }
          } else if (obs.type === "saw" || obs.type === "spike_ball" || obs.type === "mine" || obs.type === "orb") {
            ctx.beginPath();
            ctx.arc(0, 0, hw, 0, Math.PI * 2);
            ctx.stroke();
          } else if (obs.type === "laser" || obs.type === "v_laser") {
            ctx.strokeRect(-hw, -hh, obs.width, obs.height);
          } else {
            ctx.strokeRect(-hw, -hh, obs.width, obs.height);
          }
          ctx.restore();
        });
      }
      ctx.restore();
      if (victory.value) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      } else if (gameOver.value) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
      if (engine.value.isMeasureHighlight) {
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.globalCompositeOperation = "screen";
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
    };
    watch(() => props.audioBuffer, () => {
      stopGame();
      startGame();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "game-wrapper" }, _attrs))} data-v-419ad202><div class="game-container" data-v-419ad202><canvas width="1280" height="720" data-v-419ad202></canvas><div class="hud" data-v-419ad202><div class="hud-top-left" data-v-419ad202><div class="game-actions" data-v-419ad202>`);
      if (!__props.multiplayerMode && !__props.loadMap && isMapValidated.value && !hasSaved.value) {
        _push(`<button class="hud-action-btn save" data-v-419ad202> SAVE MAP </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="hud-action-btn exit" data-v-419ad202>나가기</button><button class="hud-action-btn mode-change" data-v-419ad202>MODE</button>`);
      if (__props.practiceMode && !gameOver.value) {
        _push(`<button class="hud-action-btn checkpoint" data-v-419ad202>SET CP (C)</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="title-container" data-v-419ad202><div class="${ssrRenderClass([{ inverted: isGravityInverted.value }, "wave-icon"])}" data-v-419ad202>▶</div>`);
      if (!__props.tutorialMode) {
        _push(`<h1 class="game-title" data-v-419ad202>ULTRA MUSIC MANIA</h1>`);
      } else {
        _push(`<h1 class="game-title tutorial" data-v-419ad202>TUTORIAL</h1>`);
      }
      _push(`</div><div class="progress-bar-container" data-v-419ad202><div class="progress-bar" style="${ssrRenderStyle({ width: progress.value + "%" })}" data-v-419ad202></div>`);
      if (bestProgress.value > 0) {
        _push(`<div class="best-record-marker" style="${ssrRenderStyle({ left: bestProgress.value + "%" })}" data-v-419ad202><div class="marker-line" data-v-419ad202></div><span class="marker-text" data-v-419ad202>BEST</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="progress-text" data-v-419ad202>${ssrInterpolate(Math.floor(progress.value))}%</span></div></div><div class="score-container" data-v-419ad202><div class="score-label" data-v-419ad202>SCORE</div><div class="score-val" data-v-419ad202>${ssrInterpolate(Math.floor(score.value))}</div></div><div class="speed-indicator" data-v-419ad202><span style="${ssrRenderStyle({ color: speedColor.value })}" data-v-419ad202>${ssrInterpolate(speedLabel.value)}</span>`);
      if (isMini.value) {
        _push(`<span class="mini-badge" data-v-419ad202>MINI</span>`);
      } else {
        _push(`<!---->`);
      }
      if (isMini.value) {
        _push(`<span class="mini-badge" data-v-419ad202>MINI</span>`);
      } else {
        _push(`<!---->`);
      }
      if (isAutoplayUI.value && !__props.tutorialMode) {
        _push(`<span class="autoplay-badge" data-v-419ad202>AUTO MODE</span>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.tutorialMode) {
        _push(`<span class="autoplay-badge tutorial" data-v-419ad202>TUTORIAL</span>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.practiceMode) {
        _push(`<span class="autoplay-badge practice" data-v-419ad202>PRACTICE</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (gameOver.value) {
        _push(`<div class="status-overlay fail" data-v-419ad202><div class="status-content" data-v-419ad202><h1 class="status-text fail" data-v-419ad202>CRASHED</h1>`);
        if (isNewBest.value) {
          _push(`<p class="new-best-text" data-v-419ad202>🎉 NEW BEST! ${ssrInterpolate(progressPct.value)}%</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<p class="status-sub" data-v-419ad202>${ssrInterpolate(failReason.value)}</p><div class="status-stats" data-v-419ad202><span data-v-419ad202>${ssrInterpolate(progressPct.value)}% PROGRESS</span><span class="stat-divider" data-v-419ad202>|</span><span data-v-419ad202>ATTEMPT ${ssrInterpolate(attempts.value)}</span></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (victory.value) {
        _push(`<div class="status-overlay win" data-v-419ad202><div class="status-content" data-v-419ad202><h1 class="status-text win" data-v-419ad202>COMPLETE!</h1><p class="status-sub" data-v-419ad202>모든 장애물을 돌파했습니다</p><div class="status-stats" data-v-419ad202><span data-v-419ad202>SCORE ${ssrInterpolate(Math.floor(score.value))}</span></div><div class="video-save-section" data-v-419ad202>`);
        if (!isRecordingSaved.value) {
          _push(`<button class="save-video-btn"${ssrIncludeBooleanAttr(isSavingVideo.value) ? " disabled" : ""} data-v-419ad202>`);
          if (isSavingVideo.value) {
            _push(`<span data-v-419ad202>💾 저장 중...</span>`);
          } else {
            _push(`<span data-v-419ad202>🎬 영상 저장</span>`);
          }
          _push(`</button>`);
        } else {
          _push(`<!---->`);
        }
        if (isRecordingSaved.value) {
          _push(`<p class="save-success" data-v-419ad202>✅ 영상이 저장되었습니다!</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<p class="save-hint" data-v-419ad202>클리어 장면을 동영상으로 저장합니다</p></div>`);
        if (__props.loadMap && __props.loadMap._id && !hasVoted.value) {
          _push(`<div class="rating-vote pointer-events-auto" data-v-419ad202><p class="rating-label" data-v-419ad202>RATE THIS MAP (1-30)</p><div class="rating-controls" data-v-419ad202><input type="range" min="1" max="30"${ssrRenderAttr("value", userRating.value)} class="rating-slider" data-v-419ad202><span class="rating-value" data-v-419ad202>${ssrInterpolate(userRating.value)}</span></div><button class="submit-rating-btn" data-v-419ad202>SUBMIT VOTE</button></div>`);
        } else if (hasVoted.value) {
          _push(`<div class="rating-done" data-v-419ad202> THANK YOU FOR VOTING! </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (countdown.value) {
        _push(`<div class="overlay countdown-overlay" data-v-419ad202><div class="countdown-text" data-v-419ad202>${ssrInterpolate(countdown.value)}</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (isComputingPath.value && !gameOver.value && !victory.value) {
        _push(`<div class="validation-status" data-v-419ad202><div class="status-msg" data-v-419ad202>OPTIMIZING MAP...</div><div class="mini-progress" data-v-419ad202><div class="fill" style="${ssrRenderStyle({ width: computingProgress.value + "%" })}" data-v-419ad202></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.practiceMode && checkpoints.value.length > 0) {
        _push(`<div class="checkpoint-indicator" data-v-419ad202> CPs: ${ssrInterpolate(checkpoints.value.length)} (Last: ${ssrInterpolate(Math.floor(checkpoints.value[checkpoints.value.length - 1].progress))}%) </div>`);
      } else {
        _push(`<!---->`);
      }
      if (!countdown.value && !gameOver.value && !victory.value && !isComputingPath.value) {
        _push(`<div class="controls-hint" data-v-419ad202>`);
        if (__props.tutorialMode && activeTutorialMessage.value) {
          _push(`<div class="tutorial-message-bubble" data-v-419ad202>${ssrInterpolate(activeTutorialMessage.value)}</div>`);
        } else {
          _push(`<div data-v-419ad202><span data-v-419ad202>클릭/스페이스 유지 = 위로 | 해제 = 아래로</span>`);
          if (__props.practiceMode) {
            _push(`<span data-v-419ad202> | [C] 체크포인트 | [X] 최근 삭제</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/GameCanvas.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-419ad202"]]), { __name: "GameCanvas" });

export { __nuxt_component_1 as _ };
//# sourceMappingURL=GameCanvas-CvvWQa28.mjs.map
