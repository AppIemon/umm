import { defineComponent, ref, computed, watch, mergeProps, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderStyle, ssrRenderComponent, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderList } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { _ as __nuxt_component_0$1 } from './GameCanvas-Btz3R1ec.mjs';
import { a as useAuth, b as useRouter } from './server.mjs';
import { useRoute } from 'vue-router';
import { G as GameEngine } from './game-engine-B6GgZhSo.mjs';
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
  __name: "SongSelector",
  __ssrInlineRender: true,
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const mode = ref("upload");
    const selectedFile = ref(null);
    ref(null);
    const currentSelection = ref(null);
    const storageItems = ref([]);
    const selectedStorageItem = ref(null);
    function loadStorage() {
      const data = localStorage.getItem("umm_recent_maps");
      if (data) {
        try {
          storageItems.value = JSON.parse(data).sort((a, b) => b.timestamp - a.timestamp);
        } catch (e) {
          console.error(e);
        }
      }
    }
    watch(mode, (newMode) => {
      if (newMode === "storage") loadStorage();
    });
    const youtubeUrl = ref("");
    const isYoutubeLoading = ref(false);
    const youtubeError = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "song-selector" }, _attrs))} data-v-4e296932><div class="tabs" data-v-4e296932><button class="${ssrRenderClass({ active: mode.value === "upload" })}" data-v-4e296932>UPLOAD</button><button class="${ssrRenderClass({ active: mode.value === "youtube" })}" data-v-4e296932>YOUTUBE</button><button class="${ssrRenderClass({ active: mode.value === "storage" })}" data-v-4e296932>STORAGE</button></div>`);
      if (mode.value === "upload") {
        _push(`<div class="tab-content" data-v-4e296932><div class="drop-zone" data-v-4e296932>`);
        if (!selectedFile.value) {
          _push(`<p data-v-4e296932>DROP FILE HERE</p>`);
        } else {
          _push(`<p class="highlight" data-v-4e296932>${ssrInterpolate(selectedFile.value.name)}</p>`);
        }
        _push(`</div><input type="file" accept="audio/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-4e296932></div>`);
      } else if (mode.value === "youtube") {
        _push(`<div class="tab-content" data-v-4e296932><div class="youtube-input-container" data-v-4e296932><input${ssrRenderAttr("value", youtubeUrl.value)} type="text" placeholder="Paste YouTube URL here..."${ssrIncludeBooleanAttr(isYoutubeLoading.value) ? " disabled" : ""} data-v-4e296932><button class="fetch-btn"${ssrIncludeBooleanAttr(!youtubeUrl.value || isYoutubeLoading.value) ? " disabled" : ""} data-v-4e296932>${ssrInterpolate(isYoutubeLoading.value ? "LOADING..." : "LOAD")}</button></div>`);
        if (youtubeError.value) {
          _push(`<p class="error-msg" data-v-4e296932>${ssrInterpolate(youtubeError.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (selectedFile.value && mode.value === "youtube") {
          _push(`<div class="youtube-preview" data-v-4e296932><p class="highlight" data-v-4e296932>Loaded: ${ssrInterpolate(selectedFile.value.name)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else if (mode.value === "storage") {
        _push(`<div class="tab-content" data-v-4e296932>`);
        if (storageItems.value.length > 0) {
          _push(`<div class="storage-list" data-v-4e296932><!--[-->`);
          ssrRenderList(storageItems.value, (item) => {
            _push(`<div class="${ssrRenderClass([{ selected: selectedStorageItem.value?.id === item.id }, "storage-item"])}" data-v-4e296932><span class="name" data-v-4e296932>${ssrInterpolate(item.name)}</span><span class="date" data-v-4e296932>${ssrInterpolate(new Date(item.timestamp).toLocaleDateString())}</span></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<p class="empty-msg" data-v-4e296932>NO RECENT DATA FOUND</p>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="confirm-btn"${ssrIncludeBooleanAttr(!currentSelection.value && !selectedStorageItem.value || isYoutubeLoading.value) ? " disabled" : ""} data-v-4e296932> SELECT </button></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SongSelector.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-4e296932"]]), { __name: "SongSelector" });
const useAudioAnalyzer = () => {
  const audioContext = ref(null);
  const analyzeAudio = async (file, difficulty, onProgress) => {
    if (onProgress) onProgress({ step: "오디오 헤더를 읽는 중...", percent: 5 });
    if (!audioContext.value) {
      audioContext.value = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
    }
    const arrayBuffer = await file.arrayBuffer();
    if (onProgress) onProgress({ step: "오디오 데이터를 디코딩하는 중...", percent: 15 });
    const audioBuffer = await audioContext.value.decodeAudioData(arrayBuffer);
    const rawData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const step = Math.floor(sampleRate / 150);
    if (onProgress) onProgress({ step: "최고 음량을 파악하고 있습니다...", percent: 25 });
    let peak = 0;
    for (let i = 0; i < rawData.length; i += step) {
      const val = Math.abs(rawData[i] || 0);
      if (val > peak) peak = val;
    }
    if (peak < 0.01) peak = 0.1;
    const thresholdRate = 0.45 - (difficulty - 1) / 29 * 0.35;
    const threshold = peak * thresholdRate;
    const minDistance = 0.35 - (difficulty - 1) / 29 * 0.3;
    if (onProgress) onProgress({ step: "비트 패턴을 분석 중입니다...", percent: 35 });
    const obstacles = [];
    let lastObstacleTime = 0;
    const absData = new Float32Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      absData[i] = Math.abs(rawData[i] || 0);
    }
    const windowSize = Math.floor(sampleRate * 0.03);
    let currentSum = 0;
    for (let j = 0; j < Math.min(windowSize, absData.length); j++) {
      currentSum += absData[j];
    }
    const totalIterations = rawData.length / step;
    let iterations = 0;
    for (let i = 0; i < rawData.length; i += step) {
      iterations++;
      const time = i / sampleRate;
      const average = currentSum / windowSize;
      if (average > threshold) {
        if (time - lastObstacleTime > minDistance) {
          obstacles.push(time);
          lastObstacleTime = time;
        }
      }
      const limit = Math.min(i + step, rawData.length);
      for (let j = i; j < limit; j++) {
        currentSum -= absData[j];
        const enteringIdx = j + windowSize;
        if (enteringIdx < absData.length) {
          currentSum += absData[enteringIdx];
        }
      }
      if (onProgress && iterations % Math.floor(totalIterations / 10) === 0) {
        const loopPercent = iterations / totalIterations * 35;
        onProgress({
          step: "비트 패턴을 분석 중입니다...",
          percent: Math.floor(35 + loopPercent)
        });
      }
    }
    if (onProgress) onProgress({ step: "장애물을 최적 배치하고 있습니다...", percent: 75 });
    const interpolatedObstacles = [];
    for (let i = 0; i < obstacles.length; i++) {
      const current = obstacles[i];
      if (current === void 0) continue;
      interpolatedObstacles.push(current);
      if (i < obstacles.length - 1) {
        const next = obstacles[i + 1];
        if (next === void 0) continue;
        const gap = next - current;
        if (gap > minDistance * 2.5) {
          interpolatedObstacles.push(current + gap / 2);
        }
        if (gap > minDistance * 4) {
          interpolatedObstacles.push(current + gap / 3);
          interpolatedObstacles.push(current + gap * 2 / 3);
        }
      }
    }
    interpolatedObstacles.sort((a, b) => a - b);
    if (interpolatedObstacles.length < 30) {
      const interval = minDistance * 1.2;
      for (let t = 0; t < audioBuffer.duration; t += interval) {
        const tooClose = interpolatedObstacles.some((b) => Math.abs(b - t) < minDistance * 0.8);
        if (!tooClose) interpolatedObstacles.push(t);
      }
      interpolatedObstacles.sort((a, b) => a - b);
    }
    if (onProgress) onProgress({ step: "BPM을 분석하는 중...", percent: 80 });
    let bpm = 120;
    if (obstacles.length >= 4) {
      const intervals = [];
      for (let i = 1; i < Math.min(obstacles.length, 50); i++) {
        const interval = obstacles[i] - obstacles[i - 1];
        if (interval > 0.2 && interval < 2) {
          intervals.push(interval);
        }
      }
      if (intervals.length > 0) {
        intervals.sort((a, b) => a - b);
        const medianInterval = intervals[Math.floor(intervals.length / 2)];
        const rawBpm = 60 / medianInterval;
        bpm = Math.round(rawBpm / 5) * 5;
        bpm = Math.max(60, Math.min(200, bpm));
      }
    }
    const beatLength = 60 / bpm;
    const measureLength = beatLength * 4;
    console.log(`[AudioAnalyzer] Detected BPM: ${bpm}, Measure Length: ${measureLength.toFixed(3)}s`);
    if (onProgress) onProgress({ step: "곡의 분위기 변화를 감지하는 중...", percent: 85 });
    const sections = [];
    const macroStep = sampleRate;
    const energyPerSecond = [];
    for (let i = 0; i < rawData.length; i += macroStep) {
      let sum = 0;
      const limit = Math.min(rawData.length, i + macroStep);
      for (let j = i; j < limit; j++) {
        const val = rawData[j] ?? 0;
        sum += val * val;
      }
      energyPerSecond.push(Math.sqrt(sum / (limit - i || 1)));
    }
    const MIN_SECTION_DURATION = 6;
    let lastSplitIndex = 0;
    let lastAvgEnergy = energyPerSecond[0] || 1e-3;
    let currentSectionEnergySum = 0;
    let currentSectionCount = 0;
    for (let t = 0; t < energyPerSecond.length; t++) {
      const energy = energyPerSecond[t] ?? 0;
      currentSectionEnergySum += energy;
      currentSectionCount++;
      const duration = t - lastSplitIndex;
      const energyDiff = Math.abs(energy - lastAvgEnergy) / lastAvgEnergy;
      if (duration >= MIN_SECTION_DURATION && (energyDiff > 0.4 || duration >= 15)) {
        const avgEnergy = currentSectionEnergySum / currentSectionCount;
        sections.push({ startTime: lastSplitIndex, endTime: t, intensity: avgEnergy });
        lastSplitIndex = t;
        currentSectionEnergySum = 0;
        currentSectionCount = 0;
        lastAvgEnergy = avgEnergy || 1e-3;
      }
    }
    if (lastSplitIndex < energyPerSecond.length) {
      const avgEnergy = currentSectionCount > 0 ? currentSectionEnergySum / currentSectionCount : 0;
      sections.push({ startTime: lastSplitIndex, endTime: audioBuffer.duration, intensity: avgEnergy });
    }
    const maxIntensity = Math.max(...sections.map((s) => s.intensity), 1e-3);
    sections.forEach((section) => {
      section.intensity = section.intensity / maxIntensity;
    });
    if (onProgress) onProgress({ step: "맵 생성을 완료했습니다!", percent: 100 });
    return {
      buffer: audioBuffer,
      obstacles: interpolatedObstacles,
      sections,
      duration: audioBuffer.duration,
      bpm,
      measureLength
    };
  };
  return {
    analyzeAudio
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "play",
  __ssrInlineRender: true,
  setup(__props) {
    const step = ref("upload");
    const selectedSong = ref(null);
    const { analyzeAudio } = useAudioAnalyzer();
    const audioBuffer = ref(null);
    const obstacles = ref([]);
    const sections = ref([]);
    const isAnalyzing = ref(false);
    const analysisProgress = ref({ step: "", percent: 0 });
    const startTime = ref(0);
    const timeLeft = ref(0);
    const loadedMapData = ref(null);
    const validationFailure = ref(null);
    const failCanvas = ref(null);
    const { user } = useAuth();
    const route = useRoute();
    const router = useRouter();
    const difficulty = ref(10);
    const difficultyName = computed(() => {
      if (difficulty.value < 8) return "EASY";
      if (difficulty.value < 16) return "NORMAL";
      if (difficulty.value < 24) return "HARD";
      return "IMPOSSIBLE";
    });
    const getDifficultyColor = (d) => {
      if (d < 8) return "#00ff88";
      if (d < 16) return "#ffff00";
      if (d < 24) return "#ff8800";
    };
    const handleSongSelect = async (input) => {
      if ("type" in input && input.type === "storage") {
        const item = input.data;
        loadedMapData.value = item.mapData;
        obstacles.value = item.mapData.beatTimes;
        sections.value = item.mapData.sections;
        difficulty.value = item.mapData.difficulty;
        if (item.mapData.audioData) {
          const audioCtx = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
          const res = await fetch(item.mapData.audioData);
          const arrayBuffer = await res.arrayBuffer();
          audioBuffer.value = await audioCtx.decodeAudioData(arrayBuffer);
        }
        step.value = "play";
        return;
      }
      const file = input;
      selectedSong.value = file;
      isAnalyzing.value = true;
      startTime.value = Date.now();
      hasSavedCurrentMap.value = false;
      try {
        const audioCtx = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
        const result = await analyzeAudio(file, difficulty.value, (p) => {
          analysisProgress.value = p;
          if (p.percent > 5) {
            const elapsed = (Date.now() - startTime.value) / 1e3;
            const totalEstimated = elapsed / (p.percent / 100);
            timeLeft.value = Math.max(0, totalEstimated - elapsed);
          }
        });
        audioBuffer.value = result.buffer;
        obstacles.value = result.obstacles;
        sections.value = result.sections;
        const tempEngine = new GameEngine({ difficulty: difficulty.value, density: 1, portalFrequency: 0.15 });
        const uniqueSeed = Date.now() + Math.floor(Math.random() * 1e6);
        let success = false;
        for (let i = 0; ; i++) {
          const stepMsg = i === 0 ? "AI가 맵을 분석하고 있습니다..." : `맵 보정 중... (${i + 1}회차)`;
          analysisProgress.value = { step: stepMsg, percent: 0 };
          tempEngine.generateMap(result.obstacles, result.sections, result.duration, uniqueSeed + i, false, i, result.bpm, result.measureLength);
          success = await tempEngine.computeAutoplayLogAsync(200, 360, (p) => {
            analysisProgress.value.percent = Math.floor(p * 100);
          });
          if (success) {
            analysisProgress.value.step = "맵 저장 중...";
            validationFailure.value = null;
            break;
          }
          if (tempEngine.validationFailureInfo) {
            validationFailure.value = {
              x: Math.floor(tempEngine.validationFailureInfo.x),
              y: Math.floor(tempEngine.validationFailureInfo.y),
              rawObstacles: tempEngine.validationFailureInfo.nearObstacles
            };
            nextTick(() => drawFailurePreview());
          }
          if (i > 100) break;
        }
        if (success) {
          loadedMapData.value = {
            title: file.name.substring(0, 100),
            difficulty: difficulty.value,
            seed: uniqueSeed,
            engineObstacles: tempEngine.obstacles,
            enginePortals: tempEngine.portals,
            autoplayLog: tempEngine.autoplayLog,
            duration: result.duration,
            beatTimes: result.obstacles,
            sections: result.sections,
            bpm: result.bpm,
            measureLength: result.measureLength,
            audioData: null
            // We'll fill this if we save to storage
          };
          saveToRecentStorage(loadedMapData.value);
          await handleMapReady(loadedMapData.value);
          analysisProgress.value.step = "준비 완료!";
        } else {
          throw new Error("지나갈 수 있는 맵을 생성하지 못했습니다. 다시 시도해 주세요.");
        }
        setTimeout(() => {
          isAnalyzing.value = false;
          step.value = "play";
        }, 500);
      } catch (e) {
        console.error(e);
        isAnalyzing.value = false;
        alert(e.message || "오디오 분석 또는 로드에 실패했습니다");
      }
    };
    const saveToRecentStorage = async (map) => {
      const recent = JSON.parse(localStorage.getItem("umm_recent_maps") || "[]");
      let audioData = null;
      if (selectedSong.value && selectedSong.value.size < 50 * 1024 * 1024) {
        const reader = new FileReader();
        audioData = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(selectedSong.value);
        });
      }
      const item = {
        id: Date.now(),
        name: map.title,
        timestamp: Date.now(),
        mapData: { ...map, audioData }
      };
      recent.unshift(item);
      localStorage.setItem("umm_recent_maps", JSON.stringify(recent.slice(0, 10)));
    };
    const startGame = () => {
      step.value = "play";
    };
    const handleExit = () => {
      const isTest = sessionStorage.getItem("umm_is_test");
      if (isTest) {
        sessionStorage.removeItem("umm_is_test");
        router.push("/editor");
      } else {
        step.value = "upload";
      }
    };
    const hasSavedCurrentMap = ref(false);
    const drawFailurePreview = () => {
      if (!failCanvas.value || !validationFailure.value) return;
      const ctx = failCanvas.value.getContext("2d");
      if (!ctx) return;
      const { x, y, rawObstacles } = validationFailure.value;
      const w = failCanvas.value.width;
      const h = failCanvas.value.height;
      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, w, h);
      const zoom = 0.5;
      const offsetX = x - w / 2 / zoom;
      const offsetY = 360 - h / 2 / zoom;
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      for (let i = 0; i < w; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      rawObstacles.forEach((obs) => {
        ctx.save();
        ctx.translate((obs.x - offsetX) * zoom, (obs.y - offsetY) * zoom);
        if (obs.angle) ctx.rotate(obs.angle * Math.PI / 180);
        ctx.fillStyle = obs.type === "spike" ? "#ff4444" : "#555";
        ctx.strokeStyle = "#ff00ff";
        ctx.lineWidth = 1;
        const ow = obs.width * zoom;
        const oh = obs.height * zoom;
        if (obs.type === "spike") {
          ctx.beginPath();
          const isBottom = obs.y > 300;
          if (isBottom) {
            ctx.moveTo(0, oh);
            ctx.lineTo(ow / 2, 0);
            ctx.lineTo(ow, oh);
          } else {
            ctx.moveTo(0, 0);
            ctx.lineTo(ow / 2, oh);
            ctx.lineTo(ow, 0);
          }
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(0, 0, ow, oh);
          ctx.strokeRect(0, 0, ow, oh);
        }
        ctx.restore();
      });
      ctx.fillStyle = "#fff";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00ffff";
      ctx.beginPath();
      ctx.arc((x - offsetX) * zoom, (y - offsetY) * zoom, 5, 0, Math.PI * 2);
      ctx.fill();
    };
    const handleMapReady = async (mapData) => {
      if (hasSavedCurrentMap.value) return;
      if (!selectedSong.value && !loadedMapData.value?.audioUrl) return;
      try {
        const body = {
          title: (selectedSong.value?.name || loadedMapData.value?.title || "Unknown Map").substring(0, 100),
          difficulty: mapData.difficulty,
          seed: obstacles.value.length * 777 + Math.floor(mapData.duration * 100),
          beatTimes: obstacles.value,
          sections: sections.value,
          engineObstacles: mapData.engineObstacles,
          enginePortals: mapData.enginePortals,
          autoplayLog: mapData.autoplayLog,
          duration: mapData.duration,
          creatorName: user.value?.username || "Guest",
          isShared: false
          // Default to false so it's "My Map", can be shared later
        };
        if (selectedSong.value) {
          body.audioUrl = `/audio/${selectedSong.value.name}`;
          if (selectedSong.value.size < 100 * 1024 * 1024) {
            const reader = new FileReader();
            const base64Promise = new Promise((resolve) => {
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(selectedSong.value);
            });
            body.audioData = await base64Promise;
          } else {
            console.warn("Audio file too large for server storage (>100MB). Skipping audio persistence.");
          }
        } else if (loadedMapData.value?.audioUrl) {
          body.audioUrl = loadedMapData.value.audioUrl;
          if (loadedMapData.value.audioData && loadedMapData.value.audioData.length < 100 * 1024 * 1024) {
            body.audioData = loadedMapData.value.audioData;
          }
        }
        const saved = await $fetch("/api/maps", {
          method: "POST",
          body
        });
        hasSavedCurrentMap.value = true;
        console.log(`[Database] Map successfully saved. ID: ${saved._id}`);
        if (!body.audioData) {
          console.log("Audio data was not saved (File too large).");
        }
      } catch (e) {
        console.error("Failed to save map auto-registration:", e);
      }
    };
    const handleRecordUpdate = async (data) => {
      if (!loadedMapData.value?._id) return;
      if (data.score > (loadedMapData.value.bestScore || 0)) {
        loadedMapData.value.bestScore = data.score;
      }
      try {
        const res = await $fetch(`/api/maps/${loadedMapData.value._id}/record`, {
          method: "POST",
          body: {
            score: data.score,
            username: user.value?.username || "Guest"
          }
        });
        if (res.updated) {
          console.log(`[Record] New best record: ${data.score}`);
        }
      } catch (e) {
        console.error("Failed to update record:", e);
      }
    };
    const handleMapOnlyStart = async (targetMap) => {
      loadedMapData.value = targetMap;
      obstacles.value = targetMap.beatTimes;
      sections.value = targetMap.sections;
      difficulty.value = targetMap.difficulty;
      const audioCtx = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
      const buffer = audioCtx.createBuffer(1, Math.max(1, audioCtx.sampleRate * (targetMap.duration || 10)), audioCtx.sampleRate);
      audioBuffer.value = buffer;
      step.value = "play";
    };
    const initFromQuery = async () => {
      const sessionMap = sessionStorage.getItem("umm_load_map");
      if (sessionMap) {
        try {
          const targetMap = JSON.parse(sessionMap);
          sessionStorage.removeItem("umm_load_map");
          loadedMapData.value = targetMap;
          obstacles.value = targetMap.beatTimes;
          sections.value = targetMap.sections;
          difficulty.value = targetMap.difficulty;
          if (targetMap.audioData) {
            const audioCtx = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
            const res = await fetch(targetMap.audioData);
            const arrayBuffer = await res.arrayBuffer();
            audioBuffer.value = await audioCtx.decodeAudioData(arrayBuffer);
            step.value = "play";
            return;
          } else if (targetMap.audioUrl) {
            console.log("Map session data found but missing audioData. Waiting for user file.");
          } else {
            await handleMapOnlyStart(targetMap);
            return;
          }
        } catch (e) {
          console.error("Failed to parse session map:", e);
        }
      }
      const mapId = route.query.map || route.query.mapId;
      if (!mapId) return;
      try {
        isAnalyzing.value = true;
        const targetMap = await $fetch(`/api/maps/${mapId}`);
        if (targetMap) {
          loadedMapData.value = targetMap;
          obstacles.value = targetMap.beatTimes;
          sections.value = targetMap.sections;
          difficulty.value = targetMap.difficulty;
          if (targetMap.audioData || targetMap.audioUrl) {
            try {
              let arrayBuffer;
              if (targetMap.audioData) {
                const res = await fetch(targetMap.audioData);
                arrayBuffer = await res.arrayBuffer();
                const audioCtx = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
                audioBuffer.value = await audioCtx.decodeAudioData(arrayBuffer);
                step.value = "play";
              } else {
                console.log("Map loaded without audio. Waiting for user file.");
              }
            } catch (e) {
              console.warn("Auto-load failed, waiting for user file", e);
            }
          } else {
            await handleMapOnlyStart(targetMap);
          }
        }
      } catch (e) {
        console.error("Failed to load map:", e);
      } finally {
        isAnalyzing.value = false;
      }
    };
    watch(() => route.query.map, (newMap) => {
      if (newMap) initFromQuery();
    });
    watch(() => route.query.mapId, (newMapId) => {
      if (newMapId) initFromQuery();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SongSelector = __nuxt_component_0;
      const _component_GameCanvas = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "play-page" }, _attrs))} data-v-905900a4><div class="background-anim" data-v-905900a4></div>`);
      if (step.value === "upload") {
        _push(`<div class="setup-container" data-v-905900a4>`);
        if (isAnalyzing.value) {
          _push(`<div class="processing-overlay" data-v-905900a4><div class="loader-content" data-v-905900a4><div class="wave-loader" data-v-905900a4>◆</div><h2 data-v-905900a4>${ssrInterpolate(analysisProgress.value.step || "맵 생성 중...")}</h2><div class="progress-bar" data-v-905900a4><div class="fill" style="${ssrRenderStyle({ width: analysisProgress.value.percent + "%", animation: "none" })}" data-v-905900a4></div></div>`);
          if (timeLeft.value > 0) {
            _push(`<p class="time-left" data-v-905900a4>예상 남은 시간: 약 ${ssrInterpolate(Math.ceil(timeLeft.value))}초</p>`);
          } else if (analysisProgress.value.percent > 0) {
            _push(`<p data-v-905900a4>거의 다 되었습니다...</p>`);
          } else {
            _push(`<!---->`);
          }
          if (validationFailure.value) {
            _push(`<div class="failure-log" data-v-905900a4><span class="fail-tag" data-v-905900a4>CRITICAL BLOCKAGE AT ${ssrInterpolate(validationFailure.value.x)}</span><canvas width="300" height="150" class="fail-preview" data-v-905900a4></canvas><div class="fail-details" data-v-905900a4> AI failed to find a path through this section. </div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="header-icon" data-v-905900a4>◆</div><h1 class="title" data-v-905900a4>ULTRA MUSIC MANIA</h1>`);
        if (!loadedMapData.value) {
          _push(`<p class="desc" data-v-905900a4>음악 파일을 선택하면 자동으로 맵이 생성됩니다</p>`);
        } else {
          _push(`<p class="desc map-notice" data-v-905900a4> 로드된 맵: <strong data-v-905900a4>${ssrInterpolate(loadedMapData.value.title)}</strong><br data-v-905900a4> 게임을 시작하려면 이 맵에 사용된 노래 파일을 선택해주세요. </p>`);
        }
        _push(ssrRenderComponent(_component_SongSelector, { onSelect: handleSongSelect }, null, _parent));
        _push(`<div class="difficulty-select" data-v-905900a4><div class="diff-header" data-v-905900a4><label data-v-905900a4>난이도 설정:</label><span class="diff-value" style="${ssrRenderStyle({ color: getDifficultyColor(difficulty.value) })}" data-v-905900a4>${ssrInterpolate(difficultyName.value)} (${ssrInterpolate(difficulty.value)}) </span></div><div class="slider-container" data-v-905900a4><input type="range" min="1" max="30"${ssrRenderAttr("value", difficulty.value)} class="diff-slider" data-v-905900a4><div class="slider-marks" data-v-905900a4><span data-v-905900a4>EASY</span><span data-v-905900a4>NORMAL</span><span data-v-905900a4>HARD</span><span data-v-905900a4>INSANE</span></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (step.value === "play") {
        _push(ssrRenderComponent(_component_GameCanvas, {
          audioBuffer: audioBuffer.value,
          obstacles: obstacles.value,
          sections: sections.value,
          loadMap: loadedMapData.value,
          difficulty: difficulty.value,
          onRetry: startGame,
          onExit: handleExit,
          onMapReady: handleMapReady,
          onRecordUpdate: handleRecordUpdate
        }, null, _parent));
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/play.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const play = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-905900a4"]]);

export { play as default };
//# sourceMappingURL=play-BF1pKHkX.mjs.map
