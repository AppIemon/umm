<template>
  <div class="play-page">
    <div class="background-anim"></div>
    
    <!-- Step 1: Song Selection -->
    <div v-if="step === 'upload'" class="setup-container">
      <div v-if="isAnalyzing" class="processing-overlay">
         <div class="loader-content">
            <div class="wave-loader">◆</div>
            <h2>{{ analysisProgress.step || '맵 생성 중...' }}</h2>
            <div class="progress-bar">
              <div class="fill" :style="{ width: analysisProgress.percent + '%', animation: 'none' }"></div>
            </div>
            <p v-if="timeLeft > 0" class="time-left">예상 남은 시간: 약 {{ Math.ceil(timeLeft) }}초</p>
            <p v-else-if="analysisProgress.percent > 0">거의 다 되었습니다...</p>

            <!-- 실패 분석 정보 표시 (시각화 추가) -->
            <div v-if="validationFailure" class="failure-log">
              <span class="fail-tag">CRITICAL BLOCKAGE AT {{ validationFailure.x }}</span>
              <canvas ref="failCanvas" width="300" height="150" class="fail-preview"></canvas>
              <div class="fail-details">
                AI failed to find a path through this section.
              </div>
            </div>
         </div>
      </div>
      
      <div class="header-icon">◆</div>
      <h1 class="title">ULTRA MUSIC MANIA</h1>
      <p class="desc" v-if="!loadedMapData">음악 파일을 선택하면 자동으로 맵이 생성됩니다</p>
      <p class="desc map-notice" v-else>
        로드된 맵: <strong>{{ loadedMapData.title }}</strong><br>
        게임을 시작하려면 이 맵에 사용된 노래 파일을 선택해주세요.
      </p>
      <SongSelector @select="handleSongSelect" />
      
      <div class="difficulty-select">
        <div class="diff-header">
          <label>난이도 설정:</label>
          <span class="diff-value" :style="{ color: getDifficultyColor(difficulty) }">
            {{ difficultyName }} ({{ difficulty }})
          </span>
        </div>
        <div class="slider-container">
          <input 
            type="range" 
            min="1" 
            max="30" 
            v-model.number="difficulty" 
            class="diff-slider"
          >
          <div class="slider-marks">
            <span>EASY</span>
            <span>NORMAL</span>
            <span>HARD</span>
            <span>INSANE</span>
          </div>
        </div>
      </div>
        </div>
      </div>
      
      <button class="help-btn" @click="showGuide = true">?</button>
    </div>

    <!-- Step 2: Game -->
    <GameCanvas 
      v-if="step === 'play'"
      :audioBuffer="audioBuffer"
      :obstacles="obstacles"
      :sections="sections"
      :loadMap="loadedMapData"
      :difficulty="difficulty"
      @retry="startGame"
      @exit="handleExit"
      @map-ready="handleMapReady"
      @record-update="handleRecordUpdate"
    />
    <GameGuide v-model="showGuide" @close="handleGuideClose" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAudioAnalyzer, type SongSection } from '@/composables/useAudioAnalyzer';
import { useAuth } from '@/composables/useAuth';
import { useRoute } from 'vue-router';
import { GameEngine } from '@/utils/game-engine';
import GameGuide from '@/components/GameGuide.vue'; // Guide Component

// 플레이 중에는 navbar 숨기기
definePageMeta({
  layout: 'game'
});

const step = ref<'upload' | 'play'>('upload');
const selectedSong = ref<File | null>(null);
const showGuide = ref(false); // Guide visibility
const { analyzeAudio } = useAudioAnalyzer();

// Game Data
const audioBuffer = ref<AudioBuffer | null>(null);
const obstacles = ref<number[]>([]);
const sections = ref<SongSection[]>([]);
const isAnalyzing = ref(false);
const analysisProgress = ref({ step: '', percent: 0 });
const startTime = ref(0);
const timeLeft = ref(0);
const loadedMapData = ref<any>(null);
const validationFailure = ref<any>(null);
const failCanvas = ref<HTMLCanvasElement | null>(null);
const { user } = useAuth();
const route = useRoute();
const router = useRouter();

// Difficulty
const difficulty = ref(10);

const difficultyName = computed(() => {
  if (difficulty.value < 8) return 'EASY';
  if (difficulty.value < 16) return 'NORMAL';
  if (difficulty.value < 24) return 'HARD';
  return 'IMPOSSIBLE';
});

const getDifficultyColor = (d: number) => {
  if (d < 8) return '#00ff88';
  if (d < 16) return '#ffff00';
  if (d < 24) return '#ff8800';
  return '#ff0000';
};

// 난이도별 최대 노래 길이 (초)
// EASY는 짧게, 높은 난이도로 갈수록 더 긴 곡
const getMaxDuration = (d: number): number => {
  if (d < 8) return 30;      // EASY: 30초
  if (d < 16) return 60;     // NORMAL: 60초  
  if (d < 24) return 90;     // HARD: 90초
  return Infinity;            // IMPOSSIBLE: 전체 노래
};


const handleSongSelect = async (input: File | { type: string, data: any }) => {
  if ('type' in input && input.type === 'storage') {
     const item = input.data;
     loadedMapData.value = item.mapData;
     obstacles.value = item.mapData.beatTimes;
     sections.value = item.mapData.sections;
     difficulty.value = item.mapData.difficulty;
     
     if (item.mapData.audioData) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const res = await fetch(item.mapData.audioData);
        const arrayBuffer = await res.arrayBuffer();
        audioBuffer.value = await audioCtx.decodeAudioData(arrayBuffer);
     }
     
     step.value = 'play';
     return;
  }

  const file = input as File;
  selectedSong.value = file;
  isAnalyzing.value = true;
  startTime.value = Date.now();
  hasSavedCurrentMap.value = false;

  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 1. Audio Analysis
    const result = await analyzeAudio(file, difficulty.value, (p) => {
      analysisProgress.value = p;
      if (p.percent > 5) {
        const elapsed = (Date.now() - startTime.value) / 1000;
        const totalEstimated = elapsed / (p.percent / 100);
        timeLeft.value = Math.max(0, totalEstimated - elapsed);
      }
    });
    
    audioBuffer.value = result.buffer;
    obstacles.value = result.obstacles;
    sections.value = result.sections;

    // 난이도별 노래 길이 제한 적용
    const maxDuration = getMaxDuration(difficulty.value);
    const effectiveDuration = Math.min(result.duration, maxDuration);
    
    // 제한된 시간 내의 비트/섹션만 사용
    const filteredBeatTimes = result.obstacles.filter(t => t <= effectiveDuration);
    const filteredSections = result.sections.filter(s => s.start <= effectiveDuration);

    // 2. Map Generation & Validation
    const tempEngine = new GameEngine({ difficulty: difficulty.value, density: 1.0, portalFrequency: 0.15 });
    
    // Seed를 고유하게 생성 (시간 + 랜덤)
    const uniqueSeed = Date.now() + Math.floor(Math.random() * 1000000);
    
    let success = false;
    for (let i = 0; ; i++) {
      const stepMsg = i === 0 ? 'AI가 맵을 분석하고 있습니다...' : `맵 보정 중... (${i + 1}회차)`;
      analysisProgress.value = { step: stepMsg, percent: 0 };
      
      // 맵 생성 (제한된 duration과 필터링된 beatTimes 사용)
      tempEngine.generateMap(filteredBeatTimes, filteredSections, effectiveDuration, uniqueSeed + i, false, i, result.bpm, result.measureLength);
      
      // 비동기 검증 (프로그레스 바 업데이트)
      success = await tempEngine.computeAutoplayLogAsync(200, 360, (p) => {
        analysisProgress.value.percent = Math.floor(p * 100);
      });
      
      if (success) {
        analysisProgress.value.step = '맵 저장 중...';
        validationFailure.value = null; // 성공 시 리셋
        break; 
      }
      
      // 실패 시 정보 저장 및 시각화
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
        duration: effectiveDuration,
        beatTimes: filteredBeatTimes,
        sections: filteredSections,
        bpm: result.bpm,
        measureLength: result.measureLength,
        audioData: null // We'll fill this if we save to storage
      };

      // Save to local recent storage
      saveToRecentStorage(loadedMapData.value);

      // --- AUTO-SAVE TO SERVER "MY MAPS" ---
      await handleMapReady(loadedMapData.value);
      analysisProgress.value.step = '준비 완료!';
      
    } else {
      throw new Error("지나갈 수 있는 맵을 생성하지 못했습니다. 다시 시도해 주세요.");
    }
    
    setTimeout(() => {
      isAnalyzing.value = false;
      step.value = 'play';
    }, 500); 
  } catch (e: any) {
    console.error(e);
    isAnalyzing.value = false;
    alert(e.message || "오디오 분석 또는 로드에 실패했습니다");
  }
};

const saveToRecentStorage = async (map: any) => {
  const recent = JSON.parse(localStorage.getItem('umm_recent_maps') || '[]');
  
  // LocalStorage is limited (approx 5MB). DO NOT store audio data here.
  const item = {
    id: Date.now(),
    name: map.title,
    timestamp: Date.now(),
    mapData: { 
      ...map, 
      audioData: null // Explicitly remove audio data for local history
    }
  };

  recent.unshift(item);
  localStorage.setItem('umm_recent_maps', JSON.stringify(recent.slice(0, 10))); // Keep last 10
};

const startGame = () => {
  step.value = 'play';
};

const handleExit = () => {
  const isTest = sessionStorage.getItem('umm_is_test');
  if (isTest) {
    sessionStorage.removeItem('umm_is_test');
    router.push('/editor');
  } else {
    step.value = 'upload';
  }
};

const hasSavedCurrentMap = ref(false);

const drawFailurePreview = () => {
  if (!failCanvas.value || !validationFailure.value) return;
  const ctx = failCanvas.value.getContext('2d');
  if (!ctx) return;

  const { x, y, rawObstacles } = validationFailure.value;
  const w = failCanvas.value.width;
  const h = failCanvas.value.height;
  
  // Clear & Setup
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, w, h);
  
  const zoom = 0.5; // 보기 편하게 줌 조절
  const offsetX = x - (w / 2) / zoom;
  const offsetY = 360 - (h / 2) / zoom; // 게임 중앙 Y 기준 오프셋

  // 배경 격자
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  for(let i=0; i<w; i+=20) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
  }

  // 장애물 그리기
  rawObstacles.forEach((obs: any) => {
    ctx.save();
    ctx.translate((obs.x - offsetX) * zoom, (obs.y - offsetY) * zoom);
    if(obs.angle) ctx.rotate(obs.angle * Math.PI / 180);
    
    ctx.fillStyle = obs.type === 'spike' ? '#ff4444' : '#555';
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 1;
    
    const ow = obs.width * zoom;
    const oh = obs.height * zoom;
    
    if (obs.type === 'spike') {
       ctx.beginPath();
       const isBottom = obs.y > 300;
       if(isBottom) {
         ctx.moveTo(0, oh); ctx.lineTo(ow/2, 0); ctx.lineTo(ow, oh);
       } else {
         ctx.moveTo(0, 0); ctx.lineTo(ow/2, oh); ctx.lineTo(ow, 0);
       }
       ctx.fill(); ctx.stroke();
    } else {
       ctx.fillRect(0, 0, ow, oh);
       ctx.strokeRect(0, 0, ow, oh);
    }
    ctx.restore();
  });

  // 실패 지점 표시 (기체 위치)
  ctx.fillStyle = '#fff';
  ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff';
  ctx.beginPath();
  ctx.arc((x - offsetX) * zoom, (y - offsetY) * zoom, 5, 0, Math.PI * 2);
  ctx.fill();
};

const handleMapReady = async (mapData: any) => {
  if (hasSavedCurrentMap.value) return;
  if (!selectedSong.value && !loadedMapData.value?.audioUrl) return;
  
  try {
    const body: any = {
      title: (selectedSong.value?.name || loadedMapData.value?.title || 'Unknown Map').substring(0, 100),
      difficulty: mapData.difficulty,
      seed: obstacles.value.length * 777 + Math.floor(mapData.duration * 100),
      beatTimes: obstacles.value,
      sections: sections.value,
      engineObstacles: mapData.engineObstacles,
      enginePortals: mapData.enginePortals,
      autoplayLog: mapData.autoplayLog,
      duration: mapData.duration,
      creatorName: user.value?.username || 'Guest',
      isShared: false // Default to false so it's "My Map", can be shared later
    };

    if (selectedSong.value) {
      body.audioUrl = `/audio/${selectedSong.value.name}`;
      
      // Convert file to Base64 (Server limit: ~4.5MB for Vercel/Serverless)
      if (selectedSong.value.size < 4.5 * 1024 * 1024) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedSong.value!);
        });
        body.audioData = await base64Promise;
      } else {
        console.warn("Audio file too large for server storage (>100MB). Skipping audio persistence.");
        // We do NOT send audioData. The user will have to upload it locally to play.
      }
    } else if (loadedMapData.value?.audioUrl) {
      body.audioUrl = loadedMapData.value.audioUrl;
      // If we loaded it from DB, we can try to save it back, check length first (100MB limit)
      if (loadedMapData.value.audioData && loadedMapData.value.audioData.length < 100 * 1024 * 1024) {
         body.audioData = loadedMapData.value.audioData;
      }
    }

    const saved = await $fetch('/api/maps', {
      method: 'POST',
      body
    });
    
    hasSavedCurrentMap.value = true;
    console.log(`[Database] Map successfully saved. ID: ${saved._id}`);
    
    // If audio was not saved, notify user (optional, or just logic handles it)
    if (!body.audioData) {
       console.log("Audio data was not saved (File too large).");
    }

  } catch (e: any) {
    console.error("Failed to save map auto-registration:", e);
  }
};

const handleRecordUpdate = async (data: { score: number, progress: number }) => {
  if (!loadedMapData.value?._id) return;
  
  // Update local bestScore for immediate UI feedback
  if (data.score > (loadedMapData.value.bestScore || 0)) {
     loadedMapData.value.bestScore = data.score;
  }

  try {
    const res: any = await $fetch(`/api/maps/${loadedMapData.value._id}/record`, {
      method: 'POST',
      body: {
        score: data.score,
        username: user.value?.username || 'Guest'
      }
    });
    
    if (res.updated) {
       console.log(`[Record] New best record: ${data.score}`);
    }
  } catch (e) {
    console.error("Failed to update record:", e);
  }
};

const handleMapOnlyStart = async (targetMap: any) => {
  loadedMapData.value = targetMap;
  obstacles.value = targetMap.beatTimes;
  sections.value = targetMap.sections;
  difficulty.value = targetMap.difficulty;
  
  // Create silent buffer
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const buffer = audioCtx.createBuffer(1, Math.max(1, audioCtx.sampleRate * (targetMap.duration || 10)), audioCtx.sampleRate);
  audioBuffer.value = buffer;
  
  step.value = 'play';
};

const initFromQuery = async () => {
  // Check if guide should be shown (first time user)
  const hasSeenGuide = localStorage.getItem('umm_guide_seen');
  if (!hasSeenGuide) {
    showGuide.value = true;
  }

  // 1. Check for map data passed from Maps tab (sessionStorage)
  const sessionMap = sessionStorage.getItem('umm_load_map');
  if (sessionMap) {
    try {
      const targetMap = JSON.parse(sessionMap);
      sessionStorage.removeItem('umm_load_map'); // Use once
      
      loadedMapData.value = targetMap;
      obstacles.value = targetMap.beatTimes;
      sections.value = targetMap.sections;
      difficulty.value = targetMap.difficulty;

      if (targetMap.audioData) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const res = await fetch(targetMap.audioData);
        const arrayBuffer = await res.arrayBuffer();
        audioBuffer.value = await audioCtx.decodeAudioData(arrayBuffer);
        step.value = 'play';
        return;
      } else if (targetMap.audioUrl) {
         // We still need the song file if audioData is missing
         console.log("Map session data found but missing audioData. Waiting for user file.");
      } else {
         // View-only mode with silent buffer
         await handleMapOnlyStart(targetMap);
         return;
      }
    } catch (e) {
      console.error("Failed to parse session map:", e);
    }
  }

  // 2. Fallback to existing URL query logic
  const mapId = route.query.map || route.query.mapId;
  if (!mapId) return;

  try {
    isAnalyzing.value = true;
    const targetMap: any = await $fetch(`/api/maps/${mapId}`);
    if (targetMap) {
      loadedMapData.value = targetMap;
      obstacles.value = targetMap.beatTimes;
      sections.value = targetMap.sections;
      difficulty.value = targetMap.difficulty;

      if (targetMap.audioData || targetMap.audioUrl) {
         try {
           let arrayBuffer: ArrayBuffer;
            
           if (targetMap.audioData) {
             const res = await fetch(targetMap.audioData);
             arrayBuffer = await res.arrayBuffer();
             
             const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
             audioBuffer.value = await audioCtx.decodeAudioData(arrayBuffer);
             step.value = 'play';
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

onMounted(initFromQuery);

// 쿼리 파라미터 변경 감지 (예: 다른 맵으로 이동 시)
watch(() => route.query.map, (newMap) => {
  if (newMap) initFromQuery();
});
watch(() => route.query.mapId, (newMapId) => {
  if (newMapId) initFromQuery();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;700;900&display=swap');

.play-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #050510;
  color: white;
  font-family: 'Outfit', sans-serif;
  overflow: hidden;
  position: relative;
}

.background-anim {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%);
  z-index: 0;
}

.setup-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
  z-index: 10;
  animation: fadeIn 0.5s ease-out;
  padding: 2rem;
}

.header-icon {
  font-size: 4rem;
  color: #00ffff;
  text-shadow: 0 0 30px #00ffff;
  transform: rotate(-45deg);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { 
    transform: rotate(-45deg) scale(1);
    filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.5));
  }
  50% { 
    transform: rotate(-45deg) scale(1.1);
    filter: drop-shadow(0 0 40px rgba(255, 0, 255, 0.7));
  }
}

.title {
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.desc {
  color: #888;
  font-size: 1rem;
  margin-bottom: 1rem;
  text-align: center;
}

.map-notice {
  color: #00ffff;
  background: rgba(0, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 12px;
  border: 1px dashed #00ffff;
}

.map-notice strong {
  color: #fff;
  font-size: 1.2rem;
}

.difficulty-select {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
  width: 100%;
}

.diff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.diff-header label {
  color: #666;
  font-size: 0.9rem;
  letter-spacing: 2px;
}

.diff-value {
  font-size: 1.2rem;
  font-weight: 900;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.slider-container {
  width: 100%;
}

.diff-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.diff-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  transition: transform 0.2s;
}

.diff-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.slider-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 0.8rem;
  color: #444;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
}

/* Loader */
.processing-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.loader-content { 
  text-align: center; 
}

.wave-loader {
  font-size: 5rem;
  color: #00ffff;
  transform: rotate(-45deg);
  animation: spin 2s linear infinite;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 30px #00ffff;
}

@keyframes spin {
  0% { transform: rotate(-45deg); }
  100% { transform: rotate(315deg); }
}

.loader-content h2 { 
  margin-bottom: 1.5rem; 
  background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.5rem;
}

.loader-content p {
  color: #888;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.time-left {
  color: #00ffff !important;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

.progress-bar {
  width: 300px; 
  height: 4px; 
  background: rgba(255,255,255,0.1); 
  margin: 0 auto 1rem; 
  position: relative; 
  overflow: hidden;
  border-radius: 2px;
}

.fill {
  position: absolute; 
  top: 0; 
  left: 0; 
  height: 100%; 
  width: 0%;
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  border-radius: 2px;
  transition: width 0.3s ease-out;
}

@keyframes fadeIn {
  to { opacity: 1; transform: translateY(0); }
}

.failure-log {
  margin-top: 1.5rem;
  padding: 0.8rem;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  font-family: monospace;
  animation: shake 0.5s ease-in-out;
}

.fail-tag {
  color: #ff4444;
  font-weight: 900;
  font-size: 0.8rem;
  display: block;
  margin-bottom: 0.8rem;
  letter-spacing: 1px;
}

.fail-preview {
  width: 100%;
  height: 120px;
  background: #000;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  border: 1px solid #333;
}

.help-btn {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-btn:hover {
  border-color: #00ffff;
  color: #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  transform: rotate(15deg);
}

.fail-details {
  color: #666;
  font-size: 0.7rem;
  font-style: italic;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
</style>
