import { defineComponent, ref, computed, watch, mergeProps, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderStyle, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import { _ as __nuxt_component_0$1 } from './GameCanvas-DYNPGhAt.mjs';
import { a as useAuth } from './server.mjs';
import { useRouter, useRoute } from 'vue-router';
import { G as GameEngine } from './game-engine--bomXVDE.mjs';
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
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
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
      { id: "1", name: "God Chang-seop (신창섭) '바로 리부트 정상화' MV", genre: "K-Pop", duration: "3:36", url: "/audio/samples/God Chang-seop (신창섭) '바로 리부트 정상화' MV.mp3" },
      { id: "2", name: "I Love You", genre: "Pop", duration: "3:41", url: "/audio/samples/I Love You.mp3" },
      { id: "3", name: "Nyan Cat! [Official]", genre: "Electronic", duration: "3:37", url: "/audio/samples/Nyan Cat! [Official].mp3" }
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "song-selector" }, _attrs))} data-v-3347f0dd><div class="tabs" data-v-3347f0dd><button class="${ssrRenderClass({ active: mode.value === "samples" })}" data-v-3347f0dd>SAMPLES</button><button class="${ssrRenderClass({ active: mode.value === "upload" })}" data-v-3347f0dd>UPLOAD</button><button class="${ssrRenderClass({ active: mode.value === "youtube" })}" data-v-3347f0dd>GUIDE</button><button class="${ssrRenderClass({ active: mode.value === "storage" })}" data-v-3347f0dd>RECENT</button></div>`);
      if (mode.value === "samples") {
        _push(`<div class="tab-content" data-v-3347f0dd><p class="section-desc" data-v-3347f0dd>CC0 무료 음악 - 저작권 걱정 없이 바로 플레이!</p><div class="sample-list" data-v-3347f0dd><!--[-->`);
        ssrRenderList(sampleTracks.value, (sample) => {
          _push(`<div class="${ssrRenderClass([{ selected: selectedSample.value?.id === sample.id, loading: loadingSampleId.value === sample.id }, "sample-item"])}" data-v-3347f0dd><div class="sample-info" data-v-3347f0dd><span class="sample-name" data-v-3347f0dd>${ssrInterpolate(sample.name)}</span><span class="sample-meta" data-v-3347f0dd>${ssrInterpolate(sample.genre)} • ${ssrInterpolate(sample.duration)}</span></div>`);
          if (loadingSampleId.value === sample.id) {
            _push(`<span class="loading-indicator" data-v-3347f0dd>◆</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div></div>`);
      } else if (mode.value === "upload") {
        _push(`<div class="tab-content" data-v-3347f0dd><div class="drop-zone" data-v-3347f0dd>`);
        if (!selectedFile.value) {
          _push(`<p data-v-3347f0dd>DROP FILE HERE</p>`);
        } else {
          _push(`<p class="highlight" data-v-3347f0dd>${ssrInterpolate(selectedFile.value.name)}</p>`);
        }
        _push(`</div><input type="file" accept="audio/*" style="${ssrRenderStyle({ "display": "none" })}" data-v-3347f0dd></div>`);
      } else if (mode.value === "youtube") {
        _push(`<div class="tab-content" data-v-3347f0dd><div class="youtube-guide" data-v-3347f0dd><h3 class="guide-title" data-v-3347f0dd>🎵 YouTube MP3 변환 가이드</h3><p class="guide-desc" data-v-3347f0dd>저작권 보호를 위해 직접 다운로드 기능이 제거되었습니다.<br data-v-3347f0dd>아래 방법으로 MP3 파일을 준비해주세요.</p><div class="guide-steps" data-v-3347f0dd><div class="step" data-v-3347f0dd><span class="step-num" data-v-3347f0dd>1</span><div class="step-content" data-v-3347f0dd><strong data-v-3347f0dd>YouTube 영상 URL 복사</strong><p data-v-3347f0dd>원하는 음악 영상의 주소를 복사하세요</p></div></div><div class="step" data-v-3347f0dd><span class="step-num" data-v-3347f0dd>2</span><div class="step-content" data-v-3347f0dd><strong data-v-3347f0dd>MP3 변환 사이트 이용</strong><p data-v-3347f0dd>아래 사이트에서 MP3로 변환하세요</p><div class="converter-links" data-v-3347f0dd><a href="https://y2mate.com" target="_blank" rel="noopener" class="converter-link" data-v-3347f0dd><span class="link-icon" data-v-3347f0dd>🔗</span> Y2Mate </a><a href="https://ytmp3.cc" target="_blank" rel="noopener" class="converter-link" data-v-3347f0dd><span class="link-icon" data-v-3347f0dd>🔗</span> YTMP3 </a><a href="https://loader.to" target="_blank" rel="noopener" class="converter-link" data-v-3347f0dd><span class="link-icon" data-v-3347f0dd>🔗</span> Loader.to </a></div></div></div><div class="step" data-v-3347f0dd><span class="step-num" data-v-3347f0dd>3</span><div class="step-content" data-v-3347f0dd><strong data-v-3347f0dd>MP3 파일 업로드</strong><p data-v-3347f0dd>다운로드한 MP3 파일을 UPLOAD 탭에서 업로드하세요</p><button class="go-upload-btn" data-v-3347f0dd>UPLOAD 탭으로 이동 →</button></div></div></div><div class="warning-box" data-v-3347f0dd><span class="warning-icon" data-v-3347f0dd>⚠️</span><p data-v-3347f0dd>이상한 스팸 사이트가 나올 수도 있으니 자동으로 열리는 사이트는 바로 닫아주세요.<br data-v-3347f0dd>2번정도 닫으면 다운로드가 됩니다.</p></div></div></div>`);
      } else if (mode.value === "storage") {
        _push(`<div class="tab-content" data-v-3347f0dd><p class="section-desc" data-v-3347f0dd>최근 사용한 노래 (최대 20곡)</p>`);
        if (recentSongs.value.length > 0) {
          _push(`<div class="storage-list" data-v-3347f0dd><!--[-->`);
          ssrRenderList(recentSongs.value, (song) => {
            _push(`<div class="${ssrRenderClass([{ selected: selectedRecentSong.value?.id === song.id }, "storage-item"])}" data-v-3347f0dd><div class="song-info" data-v-3347f0dd><span class="name" data-v-3347f0dd>${ssrInterpolate(song.name)}</span><span class="date" data-v-3347f0dd>${ssrInterpolate(formatDate(song.addedAt))}</span></div><button class="delete-btn" data-v-3347f0dd>✕</button></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="empty-state" data-v-3347f0dd><p class="empty-icon" data-v-3347f0dd>📁</p><p class="empty-msg" data-v-3347f0dd>최근 사용한 노래가 없습니다</p><p class="empty-hint" data-v-3347f0dd>UPLOAD 탭에서 노래를 추가하면 여기에 기록됩니다</p></div>`);
        }
        if (recentSongs.value.length > 0) {
          _push(`<button class="clear-all-btn" data-v-3347f0dd> 전체 삭제 </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="confirm-btn"${ssrIncludeBooleanAttr(!canConfirm.value) ? " disabled" : ""} data-v-3347f0dd> SELECT </button></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SongSelector.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-3347f0dd"]]), { __name: "SongSelector" });
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
    for (let i = 0; i < rawData.length; i += step) {
      Math.abs(rawData[i] || 0);
    }
    const minDistance = 0.45 - (difficulty - 1) / 29 * 0.4;
    if (onProgress) onProgress({ step: "비트 패턴을 분석 중입니다...", percent: 35 });
    if (onProgress) onProgress({ step: "비트 패턴을 분석 중입니다... (Energy Flux)", percent: 35 });
    const obstacles = [];
    let lastObstacleTime = 0;
    const rmsWindow = Math.floor(sampleRate * 0.05);
    const hopSize = Math.floor(sampleRate / 100);
    const energyProfile = [];
    let currentSqSum = 0;
    for (let i = 0; i < Math.min(rmsWindow, rawData.length); i++) {
      currentSqSum += rawData[i] * rawData[i];
    }
    for (let i = 0; i < rawData.length - rmsWindow; i += hopSize) {
      const rms = Math.sqrt(currentSqSum / rmsWindow);
      energyProfile.push({ t: i / sampleRate, e: rms });
      for (let j = 0; j < hopSize; j++) {
        const leave = rawData[i + j] || 0;
        const enter = rawData[i + rmsWindow + j] || 0;
        currentSqSum = currentSqSum - leave * leave + enter * enter;
      }
      if (currentSqSum < 0) currentSqSum = 0;
    }
    const fluxes = [];
    for (let i = 1; i < energyProfile.length; i++) {
      const flux = Math.max(0, energyProfile[i].e - energyProfile[i - 1].e);
      fluxes.push(flux);
    }
    const thresholds = [];
    for (let i = 0; i < fluxes.length; i++) {
      const start = Math.max(0, i - 100);
      const end = Math.min(fluxes.length, i + 100);
      let localSum = 0;
      for (let k = start; k < end; k++) localSum += fluxes[k];
      const localAvg = localSum / (end - start);
      thresholds.push(localAvg);
    }
    const MULTIPLIER = 1.8 - (difficulty - 1) / 29 * 0.4;
    for (let i = 1; i < fluxes.length - 1; i++) {
      const flux = fluxes[i];
      const threshold2 = thresholds[i];
      const t = energyProfile[i].t;
      const energy = energyProfile[i].e;
      if (flux > threshold2 * MULTIPLIER && energy > 0.02) {
        if (flux > fluxes[i - 1] && flux > fluxes[i + 1]) {
          if (t - lastObstacleTime > minDistance) {
            obstacles.push(t);
            lastObstacleTime = t;
          }
        }
      }
      if (onProgress && i % 1e3 === 0) {
        const prog = 35 + i / fluxes.length * 40;
        onProgress({ step: "정밀 비트 분석 중... (Adaptive)", percent: Math.floor(prog) });
      }
    }
    console.log(`[AudioAnalyzer] Adaptive Logic Detected ${obstacles.length} beats`);
    if (onProgress) onProgress({ step: "장애물을 최적 배치하고 있습니다...", percent: 75 });
    const interpolatedObstacles = [...obstacles];
    if (interpolatedObstacles.length < 10) {
      console.log("Too few beats detected, adding fallback beats...");
      const fallbackInterval = 0.5;
      for (let t = 0; t < audioBuffer.duration; t += fallbackInterval) {
        interpolatedObstacles.push(t);
      }
    }
    interpolatedObstacles.sort((a, b) => a - b);
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
    if (onProgress) onProgress({ step: "볼륨의 흐름을 분석 중...", percent: 90 });
    const volumeProfile = [];
    const profileStep = Math.floor(sampleRate / 10);
    let maxProfileEnergy = 0;
    for (let i = 0; i < rawData.length; i += profileStep) {
      const limit = Math.min(rawData.length, i + profileStep);
      let sum = 0;
      for (let j = i; j < limit; j++) {
        const val = rawData[j] || 0;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / (limit - i));
      volumeProfile.push(rms);
      if (rms > maxProfileEnergy) maxProfileEnergy = rms;
    }
    if (maxProfileEnergy > 0) {
      for (let i = 0; i < volumeProfile.length; i++) {
        volumeProfile[i] = volumeProfile[i] / maxProfileEnergy;
      }
    }
    if (onProgress) onProgress({ step: "맵 생성을 완료했습니다!", percent: 100 });
    return {
      buffer: audioBuffer,
      obstacles: interpolatedObstacles,
      sections,
      duration: audioBuffer.duration,
      bpm,
      measureLength,
      volumeProfile
      // Exported for Trend Logic
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
const scale = 0.5;
const baseSpeed = 350;
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "MapPreviewModal",
  __ssrInlineRender: true,
  props: {
    mapData: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const canvas = ref(null);
    ref(null);
    const duration = computed(() => props.mapData?.duration || 60);
    const canvasWidth = computed(() => Math.ceil(duration.value * baseSpeed * scale) + 500);
    const drawMap = () => {
      if (!canvas.value || !props.mapData) return;
      const ctx = canvas.value.getContext("2d");
      if (!ctx) return;
      const w = canvas.value.width;
      const h = canvas.value.height;
      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 100 * scale;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40 * scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255, 0, 255, 0.1)";
      ctx.fillRect(0, 0, w, 140 * scale);
      ctx.fillStyle = "rgba(0, 255, 255, 0.1)";
      const drawScaleX = scale;
      const drawScaleY = 1;
      if (props.mapData.beatTimes) {
        ctx.lineWidth = 2;
        props.mapData.beatTimes.forEach((time) => {
          const x = time * baseSpeed * drawScaleX;
          ctx.strokeStyle = "rgba(255, 255, 0, 0.3)";
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
          ctx.fillStyle = "#ffff00";
          ctx.fillRect(x - 2, h - 20, 4, 10);
        });
      }
      if (props.mapData.engineObstacles) {
        ctx.fillStyle = "#ff4444";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        props.mapData.engineObstacles.forEach((obs) => {
          const x = obs.x * drawScaleX;
          const y = obs.y * drawScaleY;
          const w2 = obs.width * drawScaleX;
          const h2 = obs.height * drawScaleY;
          if (obs.type === "spike" || obs.type === "mini_spike") {
            ctx.beginPath();
            if (obs.y > 300) {
              ctx.moveTo(x, y + h2);
              ctx.lineTo(x + w2 / 2, y);
              ctx.lineTo(x + w2, y + h2);
            } else {
              ctx.moveTo(x, y);
              ctx.lineTo(x + w2 / 2, y + h2);
              ctx.lineTo(x + w2, y);
            }
            ctx.fill();
          } else {
            ctx.fillRect(x, y, w2, h2);
          }
        });
      }
      if (props.mapData.autoplayLog && props.mapData.autoplayLog.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 4;
        let first = true;
        props.mapData.autoplayLog.forEach((p) => {
          const x = p.x * drawScaleX;
          const y = p.y * drawScaleY;
          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }
    };
    watch(() => props.mapData, drawMap);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "map-preview-modal-overlay" }, _attrs))} data-v-2bb7f56e><div class="map-preview-modal glass-panel" data-v-2bb7f56e><div class="modal-header" data-v-2bb7f56e><h2 data-v-2bb7f56e>MAP VISUALIZATION LOGIC</h2><div class="legend" data-v-2bb7f56e><span class="legend-item" data-v-2bb7f56e><span class="color-box note" data-v-2bb7f56e></span> Piano Notes (Beats)</span><span class="legend-item" data-v-2bb7f56e><span class="color-box path" data-v-2bb7f56e></span> Path (Trajectory)</span><span class="legend-item" data-v-2bb7f56e><span class="color-box obstacle" data-v-2bb7f56e></span> Obstacles</span></div><button class="close-btn" data-v-2bb7f56e>×</button></div><div class="preview-viewport" data-v-2bb7f56e><div class="scroll-container" data-v-2bb7f56e><canvas${ssrRenderAttr("width", canvasWidth.value)}${ssrRenderAttr("height", 720)} data-v-2bb7f56e></canvas></div></div><div class="info-footer" data-v-2bb7f56e><p data-v-2bb7f56e>Total Duration: ${ssrInterpolate(duration.value.toFixed(1))}s</p><p data-v-2bb7f56e>Total Length: ${ssrInterpolate(canvasWidth.value)}px</p></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MapPreviewModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const MapPreviewModal = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-2bb7f56e"]]), { __name: "MapPreviewModal" });
class AudioAnalyzerClient {
  audioContext;
  constructor() {
    this.audioContext = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
  }
  async decodeAudio(arrayBuffer) {
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }
  /**
   * Analyze audio to find "volume spikes" (onsets)
   * Corresponds to 'Adaptive Flux Logic' in analyze_beat.js
   */
  async findOnsets(buffer, difficulty = 10) {
    const rawData = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    const rmsWindow = Math.floor(sampleRate * 0.025);
    const hopSize = Math.floor(sampleRate * 5e-3);
    const energyProfile = [];
    let currentSqSum = 0;
    for (let i = 0; i < Math.min(rmsWindow, rawData.length); i++) {
      const val = rawData[i] || 0;
      currentSqSum += val * val;
    }
    for (let i = 0; i < rawData.length - rmsWindow; i += hopSize) {
      const rms = Math.sqrt(currentSqSum / rmsWindow);
      energyProfile.push({ t: i / sampleRate, e: rms });
      for (let j = 0; j < hopSize; j++) {
        const leave = rawData[i + j] || 0;
        const enter = rawData[i + rmsWindow + j] || 0;
        currentSqSum = currentSqSum - leave * leave + enter * enter;
      }
      if (currentSqSum < 0) currentSqSum = 0;
    }
    const fluxes = [];
    for (let i = 1; i < energyProfile.length; i++) {
      const eCurrent = energyProfile[i]?.e || 0;
      const ePrev = energyProfile[i - 1]?.e || 0;
      const flux = Math.max(0, eCurrent - ePrev);
      fluxes.push(flux);
    }
    const thresholds = [];
    for (let i = 0; i < fluxes.length; i++) {
      const start = Math.max(0, i - 100);
      const end = Math.min(fluxes.length, i + 100);
      let localSum = 0;
      for (let k = start; k < end; k++) localSum += fluxes[k] || 0;
      const localAvg = localSum / (end - start);
      thresholds.push(localAvg);
    }
    const beats = [];
    const peaks = [];
    const MULTIPLIER = 1.5;
    const MIN_DIST = 0.1;
    let lastBeat = 0;
    for (let i = 1; i < fluxes.length - 1; i++) {
      const flux = fluxes[i];
      const prevFlux = fluxes[i - 1];
      const nextFlux = fluxes[i + 1];
      const threshold = thresholds[i];
      const t = energyProfile[i]?.t;
      if (flux !== void 0 && prevFlux !== void 0 && nextFlux !== void 0 && threshold !== void 0 && t !== void 0) {
        if (flux > threshold * MULTIPLIER) {
          if (flux > prevFlux && flux > nextFlux) {
            if (t - lastBeat > MIN_DIST) {
              beats.push(t);
              peaks.push(flux);
              lastBeat = t;
            }
          }
        }
      }
    }
    return { times: beats, peaks };
  }
}
class SmartMapGenerator {
  engine;
  analyzer;
  status = "idle";
  progress = 0;
  // 0-100
  log = [];
  constructor(engine) {
    this.engine = engine;
    this.analyzer = new AudioAnalyzerClient();
  }
  setStatus(s, p, msg) {
    this.status = s;
    this.progress = p;
    if (msg) this.log.push(`[${s}] ${msg}`);
  }
  /**
   * Run the full Smart Generation Pipeline
   */
  async generate(audioBuffer, mapData) {
    try {
      this.setStatus("analyzing_song", 10, "Decoding audio...");
      const decoded = await this.analyzer.decodeAudio(audioBuffer);
      this.setStatus("analyzing_song", 20, "Detecting volume spikes...");
      const analysisResult = await this.analyzer.findOnsets(decoded, mapData.difficulty);
      const groundTruthBeats = analysisResult.times;
      this.setStatus("analyzing_song", 30, `Detected ${groundTruthBeats.length} notes (spikes).`);
      this.setStatus("generating_path", 30, "Initial path generation...");
      await new Promise((r) => setTimeout(r, 500));
      let bestMatchRate = 0;
      let attempt = 0;
      const MAX_ATTEMPTS = 50;
      while (bestMatchRate < 0.975 && attempt < MAX_ATTEMPTS) {
        this.setStatus("adjusting_path", 30 + attempt / MAX_ATTEMPTS * 30, `Attempt ${attempt + 1}: Simulating... Match: ${(bestMatchRate * 100).toFixed(1)}%`);
        this.engine.generateMap(
          groundTruthBeats,
          mapData.sections || [],
          decoded.duration,
          mapData.seed ? mapData.seed + attempt : attempt,
          // Variate seed
          true,
          // verify
          attempt,
          // offsetAttempt acts as seed modifier
          mapData.bpm || 120,
          mapData.measureLength || 2
        );
        const path = this.engine.autoplayLog;
        const matchRate = this.calculateMatchRate(path, groundTruthBeats);
        if (matchRate > bestMatchRate) {
          bestMatchRate = matchRate;
        }
        this.log.push(`Attempt ${attempt}: Match Rate ${(matchRate * 100).toFixed(2)}%`);
        if (bestMatchRate >= 0.975) {
          break;
        }
        attempt++;
        await new Promise((r) => setTimeout(r, 10));
      }
      if (bestMatchRate < 0.9) {
        this.log.push(`Warning: Could not reach 97.5%. Best: ${(bestMatchRate * 100).toFixed(2)}%`);
      } else {
        this.log.push(`Success: Reached ${(bestMatchRate * 100).toFixed(2)}% verify rate.`);
      }
      this.setStatus("generating_map", 70, "Finalizing map objects...");
      this.setStatus("adjusting_map", 80, "Optimizing obstacles...");
      await new Promise((r) => setTimeout(r, 200));
      this.setStatus("saving_map", 90, "Preparing map data...");
      await new Promise((r) => setTimeout(r, 200));
      this.setStatus("completed", 100, "Ready to save.");
      return true;
    } catch (e) {
      this.setStatus("failed", 0, `Error: ${e.message}`);
      console.error(e);
      return false;
    }
  }
  calculateMatchRate(path, beats) {
    if (!path || path.length === 0 || beats.length === 0) return 0;
    const actions = [];
    let wasHolding = false;
    for (const p of path) {
      if (p.holding !== void 0 && p.holding !== wasHolding) {
        actions.push(p.time);
        wasHolding = p.holding;
      }
    }
    let matched = 0;
    const window = 0.05;
    const availableActions = [...actions];
    for (const beat of beats) {
      let closestIdx = -1;
      let minDiff = window;
      for (let i = 0; i < availableActions.length; i++) {
        const diff = Math.abs(availableActions[i] - beat);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }
      if (closestIdx !== -1) {
        matched++;
        availableActions.splice(closestIdx, 1);
      }
    }
    return matched / beats.length;
  }
}
const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.";
const setInterval = () => {
  console.error(intervalError);
};
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
    const showSmartGenUI = ref(false);
    const smartGenLog = ref([]);
    const smartGenProgress = ref(0);
    const smartGenStatus = ref("");
    const smartGenEngine = ref(null);
    const smartGenLogsDisplay = computed(() => {
      return smartGenLog.value.slice(-6);
    });
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
    const hasSavedCurrentMap = ref(false);
    const showMapPreview = ref(false);
    const isPractice = ref(false);
    const isTutorial = ref(false);
    const isFirstTime = ref(false);
    const difficulty = ref(1);
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
    const getLengthDifficultyBonus = (duration) => {
      if (duration >= 60) return 0;
      return Math.max(0, (60 - duration) / 10);
    };
    const selectMode = async (mode) => {
      showModeSelect.value = false;
      isPractice.value = mode === "practice";
      isTutorial.value = mode === "tutorial";
      {
        localStorage.setItem("umm_guide_seen", "true");
        isFirstTime.value = false;
        if (loadedMapData.value && (!loadedMapData.value.autoplayLog || loadedMapData.value.autoplayLog.length === 0)) {
          console.log("[Tutorial] Generating AI path for existing map...");
          const tutorialEngine = new GameEngine({
            difficulty: loadedMapData.value.difficulty || 5,
            density: 1,
            portalFrequency: 0.15
          });
          if (loadedMapData.value.engineObstacles) {
            tutorialEngine.obstacles = loadedMapData.value.engineObstacles.map((o) => ({ ...o }));
          }
          if (loadedMapData.value.enginePortals) {
            tutorialEngine.portals = loadedMapData.value.enginePortals.map((p) => ({ ...p }));
          }
          tutorialEngine.totalLength = (loadedMapData.value.duration || 120) * tutorialEngine.baseSpeed + 1e3;
          const success = tutorialEngine.computeAutoplayLog(200, 360);
          if (success && tutorialEngine.autoplayLog.length > 0) {
            loadedMapData.value.autoplayLog = tutorialEngine.autoplayLog;
            console.log("[Tutorial] AI Path Generated with", tutorialEngine.autoplayLog.length, "points");
          }
        }
        step.value = "play";
      }
    };
    const handleSongSelect = async (input) => {
      if (!(input instanceof File) && input.type === "storage") {
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
        analysisProgress.value = { step: "SONG ANALYSIS", percent: 0 };
        const result = await analyzeAudio(file, difficulty.value, (p) => {
          analysisProgress.value = {
            step: "SONG ANALYSIS",
            percent: p.percent
          };
          if (p.percent > 5) {
            const elapsed = (Date.now() - startTime.value) / 1e3;
            const totalEstimated = elapsed / (p.percent / 100);
            timeLeft.value = Math.max(0, totalEstimated - elapsed);
          }
        });
        audioBuffer.value = result.buffer;
        obstacles.value = result.obstacles;
        sections.value = result.sections;
        if (result.duration < 10) {
          alert("10초 이상의 노래만 선택 가능합니다. (현재: " + result.duration.toFixed(1) + "초)");
          isAnalyzing.value = false;
          return;
        }
        const effectiveDuration = result.duration;
        const filteredBeatTimes = result.obstacles;
        const filteredSections = result.sections;
        const bonus = getLengthDifficultyBonus(effectiveDuration);
        const adjustedDifficulty = Math.min(30, difficulty.value + bonus);
        if (bonus > 0.5) {
          console.log(`[Difficulty] Short song detected. Adjusted difficulty: ${difficulty.value} -> ${adjustedDifficulty.toFixed(2)}`);
        }
        const tempEngine = new GameEngine({ difficulty: adjustedDifficulty, density: 1, portalFrequency: 0.15 });
        const uniqueSeed = Date.now() + Math.floor(Math.random() * 1e6);
        let success = false;
        let lastResumeData = null;
        for (let i = 0; ; i++) {
          const stepName = i === 0 ? "MOVEMENT PATH GENERATION" : "FIXING IMPOSSIBLE PARTS...";
          analysisProgress.value = { step: stepName, percent: i % 10 * 10 };
          if (i === 0) await new Promise((r) => setTimeout(r, 600));
          let resumeOptions = void 0;
          if (i > 0 && validationFailure.value && lastResumeData) {
            const failX = validationFailure.value.x;
            const log = lastResumeData.autoplayLog || [];
            const point = log.find((p) => p.x >= failX);
            const failTime = point ? point.time : failX / 350;
            const safeBuffer = adjustedDifficulty >= 16 ? 8 : 30;
            const resumeTime = Math.max(0, failTime - safeBuffer);
            console.log(`[SmartGen] Resuming from ${resumeTime.toFixed(2)}s (Fail at ${failTime.toFixed(2)}s)`);
            resumeOptions = {
              time: resumeTime,
              stateEvents: lastResumeData.stateEvents,
              beatActions: lastResumeData.beatActions,
              obstacles: lastResumeData.obstacles,
              portals: lastResumeData.portals
            };
          }
          const safeResume = resumeOptions ? {
            ...resumeOptions,
            obstacles: [...resumeOptions.obstacles],
            portals: [...resumeOptions.portals]
          } : void 0;
          tempEngine.generateMap(filteredBeatTimes, filteredSections, effectiveDuration, uniqueSeed + i, false, i, result.bpm, result.measureLength, result.volumeProfile, safeResume);
          success = await tempEngine.computeAutoplayLogAsync(200, 360, (p) => {
            analysisProgress.value.percent = Math.floor(p * 100);
          });
          if (success) {
            analysisProgress.value = { step: "MAP GENERATION", percent: 100 };
            await new Promise((r) => setTimeout(r, 500));
            analysisProgress.value = { step: "MAP ADJUSTMENT", percent: 100 };
            await new Promise((r) => setTimeout(r, 500));
            analysisProgress.value = { step: "MAP SAVING", percent: 100 };
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
            lastResumeData = {
              stateEvents: [...tempEngine.lastStateEvents],
              beatActions: [...tempEngine.lastBeatActions],
              obstacles: [...tempEngine.obstacles],
              portals: [...tempEngine.portals],
              autoplayLog: [...tempEngine.autoplayLog]
            };
          }
          await new Promise((r) => setTimeout(r, 10));
          if (i > 50) {
            console.warn("Max retries reached.");
            break;
          }
        }
        if (success) {
          await new Promise((r) => setTimeout(r, 500));
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
          };
          await handleMapReady(loadedMapData.value);
          saveToRecentStorage(loadedMapData.value);
          analysisProgress.value.step = "COMPLETED";
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
    const startSmartGenMode = async (arrayBuffer, mapData) => {
      step.value = "smart_gen";
      showSmartGenUI.value = true;
      smartGenLog.value = [];
      const genEngine = new GameEngine();
      smartGenEngine.value = genEngine;
      const generator = new SmartMapGenerator(genEngine);
      const interval = setInterval();
      const success = await generator.generate(arrayBuffer, mapData);
      clearInterval(interval);
      if (success) {
        loadedMapData.value = {
          ...mapData,
          engineObstacles: genEngine.obstacles,
          enginePortals: genEngine.portals,
          autoplayLog: genEngine.autoplayLog
        };
        setTimeout(() => {
          showSmartGenUI.value = false;
          step.value = "play";
          sessionStorage.setItem("umm_edit_map", JSON.stringify(loadedMapData.value));
        }, 1500);
      } else {
        alert("Generation failed to reach target accuracy.");
        showSmartGenUI.value = false;
        step.value = "upload";
      }
    };
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
      const isTutorialSession = sessionStorage.getItem("umm_is_tutorial") === "true";
      if (isTutorialSession) {
        sessionStorage.removeItem("umm_is_tutorial");
        selectMode("tutorial");
      } else {
        showModeSelect.value = true;
      }
    };
    async function initFromQuery() {
      const hasSeenGuide = localStorage.getItem("umm_guide_seen");
      if (!hasSeenGuide) {
        isFirstTime.value = true;
        showModeSelect.value = true;
      }
      const sessionMap = sessionStorage.getItem("umm_load_map");
      const isSmartGenSession = sessionStorage.getItem("umm_smart_gen") === "true";
      if (sessionMap) {
        try {
          const targetMap = JSON.parse(sessionMap);
          sessionStorage.removeItem("umm_load_map");
          if (isSmartGenSession) sessionStorage.removeItem("umm_smart_gen");
          loadedMapData.value = targetMap;
          obstacles.value = targetMap.beatTimes;
          sections.value = targetMap.sections;
          difficulty.value = targetMap.difficulty;
          if (targetMap.audioData || targetMap.audioUrl) {
            try {
              const AudioContext = (void 0).AudioContext || (void 0).webkitAudioContext;
              const audioCtx = new AudioContext();
              let ab = null;
              if (targetMap.audioData) {
                const res = await fetch(targetMap.audioData);
                ab = await res.arrayBuffer();
              } else if (targetMap.audioUrl) {
                const res = await fetch(targetMap.audioUrl);
                if (res.ok) ab = await res.arrayBuffer();
              }
              if (ab) {
                audioBuffer.value = await audioCtx.decodeAudioData(ab);
                if (isSmartGenSession) {
                  startSmartGenMode(ab, targetMap);
                  return;
                } else {
                  showModeSelect.value = true;
                  return;
                }
              }
            } catch (err) {
              console.error("Audio load error", err);
            }
          }
          if (isSmartGenSession) {
            alert("Smart Gen requires audio!");
            step.value = "upload";
          } else {
            await handleMapOnlyStart(targetMap);
          }
          return;
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
                const AudioContext = (void 0).AudioContext || (void 0).webkitAudioContext;
                const audioCtx = new AudioContext();
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
    }
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "play-page" }, _attrs))} data-v-25d39c9e><div class="background-anim" data-v-25d39c9e></div>`);
      if (step.value === "upload") {
        _push(`<div class="setup-container" data-v-25d39c9e>`);
        if (isAnalyzing.value) {
          _push(`<div class="processing-overlay" data-v-25d39c9e><div class="loader-content" data-v-25d39c9e><div class="wave-loader" data-v-25d39c9e>◆</div><h2 data-v-25d39c9e>${ssrInterpolate(analysisProgress.value.step || "맵 생성 중...")}</h2><div class="progress-bar" data-v-25d39c9e><div class="fill" style="${ssrRenderStyle({ width: analysisProgress.value.percent + "%", animation: "none" })}" data-v-25d39c9e></div></div>`);
          if (timeLeft.value > 0) {
            _push(`<p class="time-left" data-v-25d39c9e>예상 남은 시간: 약 ${ssrInterpolate(Math.ceil(timeLeft.value))}초</p>`);
          } else if (analysisProgress.value.percent > 0) {
            _push(`<p data-v-25d39c9e>거의 다 되었습니다...</p>`);
          } else {
            _push(`<!---->`);
          }
          if (validationFailure.value) {
            _push(`<div class="failure-log" data-v-25d39c9e><span class="fail-tag" data-v-25d39c9e>CRITICAL BLOCKAGE AT ${ssrInterpolate(validationFailure.value.x)}</span><canvas width="300" height="150" class="fail-preview" data-v-25d39c9e></canvas><div class="fail-details" data-v-25d39c9e> AI failed to find a path through this section. </div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="header-icon" data-v-25d39c9e>◆</div><h1 class="title" data-v-25d39c9e>ULTRA MUSIC MANIA</h1>`);
        if (!loadedMapData.value) {
          _push(`<p class="desc" data-v-25d39c9e>음악 파일을 선택하면 자동으로 맵이 생성됩니다</p>`);
        } else {
          _push(`<p class="desc map-notice" data-v-25d39c9e> 로드된 맵: <strong data-v-25d39c9e>${ssrInterpolate(loadedMapData.value.title)}</strong><br data-v-25d39c9e> 게임을 시작하려면 이 맵에 사용된 노래 파일을 선택해주세요. </p>`);
        }
        _push(ssrRenderComponent(_component_SongSelector, { onSelect: handleSongSelect }, null, _parent));
        _push(`<div class="difficulty-select" data-v-25d39c9e><div class="diff-header" data-v-25d39c9e><label data-v-25d39c9e>난이도 설정:</label><span class="diff-value" style="${ssrRenderStyle({ color: getDifficultyColor(difficulty.value) })}" data-v-25d39c9e>${ssrInterpolate(difficultyName.value)} (${ssrInterpolate(difficulty.value)}) </span></div><div class="slider-container" data-v-25d39c9e><input type="range" min="1" max="30"${ssrRenderAttr("value", difficulty.value)} class="diff-slider" data-v-25d39c9e><div class="slider-marks" data-v-25d39c9e><span data-v-25d39c9e>EASY</span><span data-v-25d39c9e>NORMAL</span><span data-v-25d39c9e>HARD</span><span data-v-25d39c9e>INSANE</span></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (step.value === "smart_gen") {
        _push(`<div class="setup-container" data-v-25d39c9e><div class="processing-overlay" data-v-25d39c9e><div class="loader-content" data-v-25d39c9e><div class="wave-loader" data-v-25d39c9e>✨</div><h2 data-v-25d39c9e>SMART GENERATION</h2><div class="progress-bar" data-v-25d39c9e><div class="fill" style="${ssrRenderStyle({ width: smartGenProgress.value + "%" })}" data-v-25d39c9e></div></div><p class="status-text" data-v-25d39c9e>${ssrInterpolate(smartGenStatus.value ? smartGenStatus.value.toUpperCase().replace("_", " ") : "PREPARING...")} (${ssrInterpolate(smartGenProgress.value)}%)</p><div class="smart-gen-logs" data-v-25d39c9e><!--[-->`);
        ssrRenderList(smartGenLogsDisplay.value, (log, i) => {
          _push(`<div class="log-entry" data-v-25d39c9e>${ssrInterpolate(log)}</div>`);
        });
        _push(`<!--]--></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (step.value === "play" && !showModeSelect.value) {
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
          onRecordUpdate: handleRecordUpdate,
          onChangeMode: ($event) => showModeSelect.value = true
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (showModeSelect.value) {
        _push(`<div class="mode-modal-overlay" data-v-25d39c9e><div class="mode-modal glass-panel" data-v-25d39c9e><div class="mode-header-row" data-v-25d39c9e><h2 data-v-25d39c9e>SELECT GAME MODE</h2><button class="debug-btn" title="View Map Logic" data-v-25d39c9e> 🔍 Map Logic </button></div><div class="mode-options" data-v-25d39c9e><button class="mode-btn practice" data-v-25d39c9e><div class="mode-icon" data-v-25d39c9e>🛠️</div><h3 data-v-25d39c9e>PRACTICE MODE</h3><p data-v-25d39c9e>체크포인트 사용 가능<br data-v-25d39c9e>기록 미저장</p></button><button class="mode-btn normal" data-v-25d39c9e><div class="mode-icon" data-v-25d39c9e>🎵</div><h3 data-v-25d39c9e>NORMAL MODE</h3><p data-v-25d39c9e>표준 플레이<br data-v-25d39c9e>랭킹 기록 저장</p></button><button class="${ssrRenderClass([{ recommended: isFirstTime.value }, "mode-btn tutorial"])}" data-v-25d39c9e><div class="mode-icon" data-v-25d39c9e>🎓</div>`);
        if (isFirstTime.value) {
          _push(`<div class="rec-badge" data-v-25d39c9e>RECOMMENDED</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<h3 data-v-25d39c9e>TUTORIAL MODE</h3><p data-v-25d39c9e>게임 가이드<br data-v-25d39c9e>기초 배우기</p></button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (showMapPreview.value) {
        _push(ssrRenderComponent(MapPreviewModal, {
          mapData: loadedMapData.value,
          onClose: ($event) => showMapPreview.value = false
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
const play = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-25d39c9e"]]);

export { play as default };
//# sourceMappingURL=play-DM148mtf.mjs.map
