import { defineComponent, ref, computed, watch, mergeProps, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderStyle, ssrRenderComponent, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { _ as __nuxt_component_0$1 } from './GameCanvas-BR3LeziT.mjs';
import { a as useAuth } from './server.mjs';
import { useRouter, useRoute } from 'vue-router';
import { G as GameEngine } from './game-engine-CV48549j.mjs';
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

const DB_NAME$1 = "ImpossibleTimingDB";
const STORE_NAME$1 = "recent_songs";
const DB_VERSION = 2;
const MAX_SONGS = 20;
const useRecentSongs = () => {
  const initDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME$1, DB_VERSION);
      request.onerror = () => reject("IndexedDB error");
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME$1)) {
          const store = db.createObjectStore(STORE_NAME$1, { keyPath: "id" });
          store.createIndex("name", "name", { unique: false });
          store.createIndex("addedAt", "addedAt", { unique: false });
        }
        if (!db.objectStoreNames.contains("songs")) {
          db.createObjectStore("songs", { keyPath: "id" });
        }
      };
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  };
  const addSong = async (file) => {
    const db = await initDB();
    return new Promise(async (resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME$1], "readwrite");
        const store = transaction.objectStore(STORE_NAME$1);
        const nameIndex = store.index("name");
        const existingRequest = nameIndex.getAll(file.name);
        existingRequest.onsuccess = async () => {
          const existing = existingRequest.result;
          for (const song of existing) {
            store.delete(song.id);
          }
          const newSong = {
            id: crypto.randomUUID(),
            name: file.name,
            blob: file,
            addedAt: Date.now()
          };
          store.add(newSong);
          const allRequest = store.index("addedAt").getAll();
          allRequest.onsuccess = () => {
            const all = allRequest.result;
            if (all.length > MAX_SONGS) {
              const sorted = all.sort((a, b) => a.addedAt - b.addedAt);
              const toDelete = sorted.slice(0, all.length - MAX_SONGS);
              for (const song of toDelete) {
                store.delete(song.id);
              }
            }
          };
          resolve(newSong);
        };
        existingRequest.onerror = () => reject("Error checking duplicates");
      } catch (e) {
        reject(e);
      }
    });
  };
  const getSongs = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME$1], "readonly");
      const store = transaction.objectStore(STORE_NAME$1);
      const request = store.getAll();
      request.onsuccess = () => {
        const songs = request.result.sort((a, b) => b.addedAt - a.addedAt);
        resolve(songs);
      };
      request.onerror = () => reject("Error fetching songs");
    });
  };
  const deleteSong = async (id) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME$1], "readwrite");
      const store = transaction.objectStore(STORE_NAME$1);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject("Error deleting song");
    });
  };
  const clearAll = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME$1], "readwrite");
      const store = transaction.objectStore(STORE_NAME$1);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject("Error clearing songs");
    });
  };
  return {
    addSong,
    getSongs,
    deleteSong,
    clearAll
  };
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SongSelector",
  __ssrInlineRender: true,
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const mode = ref("samples");
    const selectedFile = ref(null);
    ref(null);
    const currentSelection = ref(null);
    const { getSongs } = useRecentSongs();
    const recentSongs = ref([]);
    const selectedRecentSong = ref(null);
    const sampleTracks = ref([
      { id: "1", name: "Electronic Future Beats", genre: "Electronic", duration: "2:30", url: "/api/samples?id=1" },
      { id: "2", name: "Synthwave Retro", genre: "Synthwave", duration: "2:00", url: "/api/samples?id=2" },
      { id: "3", name: "Epic Cinematic", genre: "Cinematic", duration: "2:45", url: "/api/samples?id=3" }
    ]);
    const selectedSample = ref(null);
    const loadingSampleId = ref(null);
    const canConfirm = computed(() => {
      if (mode.value === "youtube") return false;
      if (loadingSampleId.value) return false;
      return currentSelection.value || selectedRecentSong.value || selectedSample.value;
    });
    async function loadRecentSongs() {
      try {
        recentSongs.value = await getSongs();
      } catch (e) {
        console.error("Failed to load recent songs:", e);
      }
    }
    function formatDate(timestamp) {
      const date = new Date(timestamp);
      const now = /* @__PURE__ */ new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 6e4);
      const diffHours = Math.floor(diffMs / 36e5);
      const diffDays = Math.floor(diffMs / 864e5);
      if (diffMins < 1) return "방금 전";
      if (diffMins < 60) return `${diffMins}분 전`;
      if (diffHours < 24) return `${diffHours}시간 전`;
      if (diffDays < 7) return `${diffDays}일 전`;
      return date.toLocaleDateString();
    }
    watch(mode, (newMode) => {
      if (newMode === "storage") loadRecentSongs();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "song-selector" }, _attrs))} data-v-161105ae><div class="tabs" data-v-161105ae><button class="${ssrRenderClass({ active: mode.value === "samples" })}" data-v-161105ae>SAMPLES</button><button class="${ssrRenderClass({ active: mode.value === "upload" })}" data-v-161105ae>UPLOAD</button><button class="${ssrRenderClass({ active: mode.value === "youtube" })}" data-v-161105ae>GUIDE</button><button class="${ssrRenderClass({ active: mode.value === "storage" })}" data-v-161105ae>RECENT</button></div>`);
      if (mode.value === "samples") {
        _push(`<div class="tab-content" data-v-161105ae><p class="section-desc" data-v-161105ae>CC0 무료 음악 - 저작권 걱정 없이 바로 플레이!</p><div class="sample-list" data-v-161105ae><!--[-->`);
        ssrRenderList(sampleTracks.value, (sample) => {
          _push(`<div class="${ssrRenderClass([{ selected: selectedSample.value?.id === sample.id, loading: loadingSampleId.value === sample.id }, "sample-item"])}" data-v-161105ae><div class="sample-info" data-v-161105ae><span class="sample-name" data-v-161105ae>${ssrInterpolate(sample.name)}</span><span class="sample-meta" data-v-161105ae>${ssrInterpolate(sample.genre)} • ${ssrInterpolate(sample.duration)}</span></div>`);
          if (loadingSampleId.value === sample.id) {
            _push(`<span class="loading-indicator" data-v-161105ae>◆</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div></div>`);
      } else if (mode.value === "upload") {
        _push(`<div class="tab-content" data-v-161105ae><div class="drop-zone" data-v-161105ae>`);
        if (!selectedFile.value) {
          _push(`<p data-v-161105ae>DROP FILE HERE</p>`);
        } else {
          _push(`<p class="highlight" data-v-161105ae>${ssrInterpolate(selectedFile.value.name)}</p>`);
        }
        _push(`</div><input type="file" accept="audio/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-161105ae></div>`);
      } else if (mode.value === "youtube") {
        _push(`<div class="tab-content" data-v-161105ae><div class="youtube-guide" data-v-161105ae><h3 class="guide-title" data-v-161105ae>🎵 YouTube MP3 변환 가이드</h3><p class="guide-desc" data-v-161105ae>저작권 보호를 위해 직접 다운로드 기능이 제거되었습니다.<br data-v-161105ae>아래 방법으로 MP3 파일을 준비해주세요.</p><div class="guide-steps" data-v-161105ae><div class="step" data-v-161105ae><span class="step-num" data-v-161105ae>1</span><div class="step-content" data-v-161105ae><strong data-v-161105ae>YouTube 영상 URL 복사</strong><p data-v-161105ae>원하는 음악 영상의 주소를 복사하세요</p></div></div><div class="step" data-v-161105ae><span class="step-num" data-v-161105ae>2</span><div class="step-content" data-v-161105ae><strong data-v-161105ae>MP3 변환 사이트 이용</strong><p data-v-161105ae>아래 사이트에서 MP3로 변환하세요</p><div class="converter-links" data-v-161105ae><a href="https://y2mate.com" target="_blank" rel="noopener" class="converter-link" data-v-161105ae><span class="link-icon" data-v-161105ae>🔗</span> Y2Mate </a><a href="https://ytmp3.cc" target="_blank" rel="noopener" class="converter-link" data-v-161105ae><span class="link-icon" data-v-161105ae>🔗</span> YTMP3 </a><a href="https://loader.to" target="_blank" rel="noopener" class="converter-link" data-v-161105ae><span class="link-icon" data-v-161105ae>🔗</span> Loader.to </a></div></div></div><div class="step" data-v-161105ae><span class="step-num" data-v-161105ae>3</span><div class="step-content" data-v-161105ae><strong data-v-161105ae>MP3 파일 업로드</strong><p data-v-161105ae>다운로드한 MP3 파일을 UPLOAD 탭에서 업로드하세요</p><button class="go-upload-btn" data-v-161105ae>UPLOAD 탭으로 이동 →</button></div></div></div><div class="warning-box" data-v-161105ae><span class="warning-icon" data-v-161105ae>⚠️</span><p data-v-161105ae>이상한 스팸 사이트가 나올 수도 있으니 자동으로 열리는 사이트는 바로 닫아주세요.<br data-v-161105ae>2번정도 닫으면 다운로드가 됩니다.</p></div></div></div>`);
      } else if (mode.value === "storage") {
        _push(`<div class="tab-content" data-v-161105ae><p class="section-desc" data-v-161105ae>최근 사용한 노래 (최대 20곡)</p>`);
        if (recentSongs.value.length > 0) {
          _push(`<div class="storage-list" data-v-161105ae><!--[-->`);
          ssrRenderList(recentSongs.value, (song) => {
            _push(`<div class="${ssrRenderClass([{ selected: selectedRecentSong.value?.id === song.id }, "storage-item"])}" data-v-161105ae><div class="song-info" data-v-161105ae><span class="name" data-v-161105ae>${ssrInterpolate(song.name)}</span><span class="date" data-v-161105ae>${ssrInterpolate(formatDate(song.addedAt))}</span></div><button class="delete-btn" data-v-161105ae>✕</button></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="empty-state" data-v-161105ae><p class="empty-icon" data-v-161105ae>📁</p><p class="empty-msg" data-v-161105ae>최근 사용한 노래가 없습니다</p><p class="empty-hint" data-v-161105ae>UPLOAD 탭에서 노래를 추가하면 여기에 기록됩니다</p></div>`);
        }
        if (recentSongs.value.length > 0) {
          _push(`<button class="clear-all-btn" data-v-161105ae> 전체 삭제 </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="confirm-btn"${ssrIncludeBooleanAttr(!canConfirm.value) ? " disabled" : ""} data-v-161105ae> SELECT </button></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SongSelector.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-161105ae"]]), { __name: "SongSelector" });
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
function trimAudioBuffer(buffer, durationSeconds) {
  if (buffer.duration <= durationSeconds) {
    return buffer;
  }
  const audioCtx = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
  const targetSamples = Math.floor(durationSeconds * buffer.sampleRate);
  const trimmedBuffer = audioCtx.createBuffer(
    buffer.numberOfChannels,
    targetSamples,
    buffer.sampleRate
  );
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const sourceData = buffer.getChannelData(channel);
    const targetData = trimmedBuffer.getChannelData(channel);
    targetData.set(sourceData.subarray(0, targetSamples));
  }
  return trimmedBuffer;
}
function audioBufferToWavBlob(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  let interleaved;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    interleaved = new Float32Array(left.length * 2);
    for (let i = 0; i < left.length; i++) {
      interleaved[i * 2] = left[i];
      interleaved[i * 2 + 1] = right[i];
    }
  } else {
    interleaved = buffer.getChannelData(0);
  }
  const dataLength = interleaved.length * (bitDepth / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;
  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);
  writeString(view, 0, "RIFF");
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataLength, true);
  let offset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    let sample = Math.max(-1, Math.min(1, interleaved[i]));
    sample = sample < 0 ? sample * 32768 : sample * 32767;
    view.setInt16(offset, sample, true);
    offset += 2;
  }
  return new Blob([arrayBuffer], { type: "audio/wav" });
}
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
function splitBase64ToChunks(base64, chunkSize) {
  const chunks = [];
  for (let i = 0; i < base64.length; i += chunkSize) {
    chunks.push(base64.substring(i, i + chunkSize));
  }
  return chunks;
}
async function trimAndEncodeAudio(buffer, durationSeconds) {
  const trimmedBuffer = trimAudioBuffer(buffer, durationSeconds);
  const wavBlob = audioBufferToWavBlob(trimmedBuffer);
  return blobToBase64(wavBlob);
}
const CHUNK_SIZE = 4 * 1024 * 1024;
const MAX_SINGLE_UPLOAD_SIZE = 4.5 * 1024 * 1024;
const DB_NAME = "umm_audio_db";
const STORE_NAME = "audio_files";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "play",
  __ssrInlineRender: true,
  setup(__props) {
    const router = useRouter();
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
    const showModeSelect = ref(false);
    const isPractice = ref(false);
    const isTutorial = ref(false);
    const isFirstTime = ref(false);
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
      return "#ff0000";
    };
    const getMaxDuration = (d) => {
      if (d < 8) return 30;
      if (d < 16) return 60;
      if (d < 24) return 90;
      return Infinity;
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
          showModeSelect.value = true;
        } else if (item.mapData._id) {
          console.log("Loading recent map audio from IndexedDB...", item.mapData._id);
          try {
            const localFile = await getAudioFromDB(item.mapData._id);
            if (localFile) {
              const audioCtx = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
              const ab = await localFile.arrayBuffer();
              audioBuffer.value = await audioCtx.decodeAudioData(ab);
              showModeSelect.value = true;
            } else {
              alert("오디오 파일을 찾을 수 없습니다. (IDB Miss)");
            }
          } catch (e) {
            console.error(e);
          }
        } else {
          alert("오디오 데이터가 만료되었습니다.");
        }
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
        const maxDuration = getMaxDuration(difficulty.value);
        const effectiveDuration = Math.min(result.duration, maxDuration);
        const filteredBeatTimes = result.obstacles.filter((t) => t <= effectiveDuration);
        const filteredSections = result.sections.filter((s) => s.start <= effectiveDuration);
        const tempEngine = new GameEngine({ difficulty: difficulty.value, density: 1, portalFrequency: 0.15 });
        const uniqueSeed = Date.now() + Math.floor(Math.random() * 1e6);
        let success = false;
        for (let i = 0; ; i++) {
          const stepMsg = i === 0 ? "AI가 맵을 분석하고 있습니다..." : `맵 보정 중... (${i + 1}회차)`;
          analysisProgress.value = { step: stepMsg, percent: 0 };
          tempEngine.generateMap(filteredBeatTimes, filteredSections, effectiveDuration, uniqueSeed + i, false, i, result.bpm, result.measureLength);
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
          if (i > 5e3) break;
        }
        if (success) {
          loadedMapData.value = {
            title: file.name.substring(0, 100),
            difficulty: difficulty.value,
            seed: uniqueSeed,
            engineObstacles: tempEngine.obstacles,
            enginePortals: tempEngine.portals,
            autoplayLog: tempEngine.autoplayLog,
            duration: effectiveDuration,
            beatTimes: filteredBeatTimes,
            sections: filteredSections,
            bpm: result.bpm,
            measureLength: result.measureLength,
            audioData: null
            // We'll fill this if we save to storage
          };
          await handleMapReady(loadedMapData.value);
          saveToRecentStorage(loadedMapData.value);
          analysisProgress.value.step = "준비 완료!";
        } else {
          throw new Error("지나갈 수 있는 맵을 생성하지 못했습니다. 다시 시도해 주세요.");
        }
        setTimeout(() => {
          isAnalyzing.value = false;
          showModeSelect.value = true;
        }, 500);
      } catch (e) {
        console.error(e);
        isAnalyzing.value = false;
        alert(e.message || "오디오 분석 또는 로드에 실패했습니다");
      }
    };
    const saveToRecentStorage = async (map) => {
      const recent = JSON.parse(localStorage.getItem("umm_recent_maps") || "[]");
      const item = {
        id: Date.now(),
        name: map.title,
        timestamp: Date.now(),
        mapData: {
          ...map,
          audioData: null
          // Explicitly remove audio data for local history
        }
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
        showModeSelect.value = false;
        isPractice.value = false;
        isTutorial.value = false;
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
      if (!user.value) return;
      if (isPractice.value || isTutorial.value) return;
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
        let audioBase64 = null;
        let needsChunkedUpload = false;
        if (selectedSong.value && audioBuffer.value) {
          body.audioUrl = `/audio/${selectedSong.value.name}`;
          console.log(`[Audio] Trimming audio from ${audioBuffer.value.duration}s to ${mapData.duration}s`);
          audioBase64 = await trimAndEncodeAudio(audioBuffer.value, mapData.duration);
          if (audioBase64.length > MAX_SINGLE_UPLOAD_SIZE) {
            console.log(`[Audio] Trimmed audio (${(audioBase64.length / 1024 / 1024).toFixed(2)}MB) exceeds limit, will use chunked upload`);
            needsChunkedUpload = true;
          } else {
            body.audioData = audioBase64;
          }
        } else if (loadedMapData.value?.audioUrl) {
          body.audioUrl = loadedMapData.value.audioUrl;
          if (loadedMapData.value.audioData && loadedMapData.value.audioData.length < 100 * 1024 * 1024) {
            body.audioData = loadedMapData.value.audioData;
          }
        }
        if (needsChunkedUpload) {
          body.audioData = null;
          body.audioChunks = [];
        }
        const saved = await $fetch("/api/maps", {
          method: "POST",
          body
        });
        hasSavedCurrentMap.value = true;
        console.log(`[Database] Map successfully saved. ID: ${saved._id}`);
        if (loadedMapData.value) {
          loadedMapData.value._id = saved._id;
        }
        if (needsChunkedUpload && audioBase64) {
          console.log(`[Audio] Starting chunked upload...`);
          const chunks = splitBase64ToChunks(audioBase64, CHUNK_SIZE);
          for (let i = 0; i < chunks.length; i++) {
            console.log(`[Audio] Uploading chunk ${i + 1}/${chunks.length}...`);
            await $fetch(`/api/maps/${saved._id}/audio-chunk`, {
              method: "POST",
              body: { chunkIndex: i, chunkData: chunks[i], totalChunks: chunks.length }
            });
          }
          console.log(`[Audio] All ${chunks.length} chunks uploaded successfully!`);
        }
        if (!body.audioData && !needsChunkedUpload && selectedSong.value) {
          console.log("Saving original audio to local IndexedDB for fast auto-load...");
          try {
            await saveAudioToDB(saved._id, selectedSong.value);
            console.log("Audio successfully saved to local IndexedDB!");
          } catch (dbErr) {
            console.error("Failed to save to IndexedDB", dbErr);
          }
        }
      } catch (e) {
        console.error("Failed to save map auto-registration:", e);
      }
    };
    const handleRecordUpdate = async (data) => {
      if (!loadedMapData.value?._id) return;
      if (!isPractice.value && !isTutorial.value && data.score > (loadedMapData.value.bestScore || 0)) {
        loadedMapData.value.bestScore = data.score;
      }
      if (isPractice.value) return;
      if (!user.value) return;
      const targetId = isTutorial.value ? "tutorial_mode" : loadedMapData.value?._id;
      if (!targetId) return;
      try {
        const res = await $fetch(`/api/maps/${targetId}/record`, {
          method: "POST",
          body: {
            score: data.score,
            progress: data.progress,
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
      obstacles.value = targetMap.beatTimes || [];
      sections.value = targetMap.sections || [];
      difficulty.value = targetMap.difficulty || 10;
      const audioCtx = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
      const buffer = audioCtx.createBuffer(1, Math.max(1, audioCtx.sampleRate * (targetMap.duration || 10)), audioCtx.sampleRate);
      audioBuffer.value = buffer;
      showModeSelect.value = true;
    };
    const initFromQuery = async () => {
      const hasSeenGuide = localStorage.getItem("umm_guide_seen");
      if (!hasSeenGuide) {
        isFirstTime.value = true;
        showModeSelect.value = true;
      }
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
            showModeSelect.value = true;
            return;
          } else if (targetMap.audioUrl) {
            console.log("Map session data found with audioUrl. Trying to load...");
            try {
              const audioCtx = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
              const res = await fetch(targetMap.audioUrl);
              if (res.ok) {
                const arrayBuffer = await res.arrayBuffer();
                audioBuffer.value = await audioCtx.decodeAudioData(arrayBuffer);
                showModeSelect.value = true;
                return;
              }
            } catch (e) {
              console.warn("Failed to load audioUrl, falling back to silent", e);
            }
            await handleMapOnlyStart(targetMap);
            return;
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
              let loadedAudio = null;
              if (targetMap.audioData) {
                console.log("Loading audio from Base64 Data...");
                const res = await fetch(targetMap.audioData);
                loadedAudio = await res.arrayBuffer();
              }
              if (!loadedAudio) {
                console.log("Checking local IndexedDB for audio...");
                try {
                  const localFile = await getAudioFromDB(targetMap._id);
                  if (localFile) {
                    console.log("Found audio in local DB!");
                    loadedAudio = await localFile.arrayBuffer();
                  }
                } catch (e) {
                  console.warn("IndexedDB check failed", e);
                }
              }
              if (!loadedAudio && targetMap.audioUrl) {
                console.log("Loading audio from URL:", targetMap.audioUrl);
                try {
                  const res = await fetch(targetMap.audioUrl);
                  if (res.ok) {
                    loadedAudio = await res.arrayBuffer();
                  } else {
                    console.warn("Audio URL fetch failed:", res.status);
                  }
                } catch (e) {
                  console.warn("Audio URL fetch error", e);
                }
              }
              if (loadedAudio) {
                const audioCtx = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
                audioBuffer.value = await audioCtx.decodeAudioData(loadedAudio);
                showModeSelect.value = true;
              } else {
                console.log("Could not find audio source. Prompting user.");
                alert("오디오 파일을 자동으로 불러오지 못했습니다. (서버/로컬 저장소 없음)\n원본 음악 파일을 다시 선택해주세요.");
              }
            } catch (e) {
              console.warn("Auto-load failed, waiting for user file", e);
              alert("오디오 로딩 실패. 파일을 수동으로 선택해주세요.");
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
    const openDB = () => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e);
      });
    };
    const saveAudioToDB = async (mapId, file) => {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(file, mapId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    };
    const getAudioFromDB = async (mapId) => {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(mapId);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SongSelector = __nuxt_component_0;
      const _component_GameCanvas = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "play-page" }, _attrs))} data-v-cf2a24b9><div class="background-anim" data-v-cf2a24b9></div>`);
      if (step.value === "upload") {
        _push(`<div class="setup-container" data-v-cf2a24b9>`);
        if (isAnalyzing.value) {
          _push(`<div class="processing-overlay" data-v-cf2a24b9><div class="loader-content" data-v-cf2a24b9><div class="wave-loader" data-v-cf2a24b9>◆</div><h2 data-v-cf2a24b9>${ssrInterpolate(analysisProgress.value.step || "맵 생성 중...")}</h2><div class="progress-bar" data-v-cf2a24b9><div class="fill" style="${ssrRenderStyle({ width: analysisProgress.value.percent + "%", animation: "none" })}" data-v-cf2a24b9></div></div>`);
          if (timeLeft.value > 0) {
            _push(`<p class="time-left" data-v-cf2a24b9>예상 남은 시간: 약 ${ssrInterpolate(Math.ceil(timeLeft.value))}초</p>`);
          } else if (analysisProgress.value.percent > 0) {
            _push(`<p data-v-cf2a24b9>거의 다 되었습니다...</p>`);
          } else {
            _push(`<!---->`);
          }
          if (validationFailure.value) {
            _push(`<div class="failure-log" data-v-cf2a24b9><span class="fail-tag" data-v-cf2a24b9>CRITICAL BLOCKAGE AT ${ssrInterpolate(validationFailure.value.x)}</span><canvas width="300" height="150" class="fail-preview" data-v-cf2a24b9></canvas><div class="fail-details" data-v-cf2a24b9> AI failed to find a path through this section. </div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="header-icon" data-v-cf2a24b9>◆</div><h1 class="title" data-v-cf2a24b9>ULTRA MUSIC MANIA</h1>`);
        if (!loadedMapData.value) {
          _push(`<p class="desc" data-v-cf2a24b9>음악 파일을 선택하면 자동으로 맵이 생성됩니다</p>`);
        } else {
          _push(`<p class="desc map-notice" data-v-cf2a24b9> 로드된 맵: <strong data-v-cf2a24b9>${ssrInterpolate(loadedMapData.value.title)}</strong><br data-v-cf2a24b9> 게임을 시작하려면 이 맵에 사용된 노래 파일을 선택해주세요. </p>`);
        }
        _push(ssrRenderComponent(_component_SongSelector, { onSelect: handleSongSelect }, null, _parent));
        _push(`<div class="difficulty-select" data-v-cf2a24b9><div class="diff-header" data-v-cf2a24b9><label data-v-cf2a24b9>난이도 설정:</label><span class="diff-value" style="${ssrRenderStyle({ color: getDifficultyColor(difficulty.value) })}" data-v-cf2a24b9>${ssrInterpolate(difficultyName.value)} (${ssrInterpolate(difficulty.value)}) </span></div><div class="slider-container" data-v-cf2a24b9><input type="range" min="1" max="30"${ssrRenderAttr("value", difficulty.value)} class="diff-slider" data-v-cf2a24b9><div class="slider-marks" data-v-cf2a24b9><span data-v-cf2a24b9>EASY</span><span data-v-cf2a24b9>NORMAL</span><span data-v-cf2a24b9>HARD</span><span data-v-cf2a24b9>INSANE</span></div></div></div><button class="help-btn" data-v-cf2a24b9>?</button></div>`);
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
          practiceMode: isPractice.value,
          tutorialMode: isTutorial.value,
          onRetry: startGame,
          onExit: handleExit,
          onMapReady: handleMapReady,
          onRecordUpdate: handleRecordUpdate
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (showModeSelect.value) {
        _push(`<div class="mode-modal-overlay" data-v-cf2a24b9><div class="mode-modal glass-panel" data-v-cf2a24b9><h2 data-v-cf2a24b9>SELECT GAME MODE</h2><div class="mode-options" data-v-cf2a24b9><button class="mode-btn practice" data-v-cf2a24b9><div class="mode-icon" data-v-cf2a24b9>🛠️</div><h3 data-v-cf2a24b9>PRACTICE MODE</h3><p data-v-cf2a24b9>체크포인트 사용 가능<br data-v-cf2a24b9>기록 미저장</p></button><button class="mode-btn normal" data-v-cf2a24b9><div class="mode-icon" data-v-cf2a24b9>🎵</div><h3 data-v-cf2a24b9>NORMAL MODE</h3><p data-v-cf2a24b9>표준 플레이<br data-v-cf2a24b9>랭킹 기록 저장</p></button><button class="${ssrRenderClass([{ recommended: isFirstTime.value }, "mode-btn tutorial"])}" data-v-cf2a24b9><div class="mode-icon" data-v-cf2a24b9>🎓</div>`);
        if (isFirstTime.value) {
          _push(`<div class="rec-badge" data-v-cf2a24b9>RECOMMENDED</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<h3 data-v-cf2a24b9>TUTORIAL MODE</h3><p data-v-cf2a24b9>게임 가이드<br data-v-cf2a24b9>기초 배우기</p></button></div></div></div>`);
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
const play = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-cf2a24b9"]]);

export { play as default };
//# sourceMappingURL=play-CGejbZz0.mjs.map
