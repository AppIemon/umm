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

    <!-- Smart Gen Mode UI -->
    <div v-if="step === 'smart_gen'" class="setup-container">
       <div class="processing-overlay">
         <div class="loader-content">
            <div class="wave-loader">✨</div>
            <h2>SMART GENERATION</h2>
            <div class="progress-bar">
               <div class="fill" :style="{ width: smartGenProgress + '%' }"></div>
            </div>
            <p class="status-text">{{ smartGenStatus ? smartGenStatus.toUpperCase().replace('_', ' ') : 'PREPARING...' }} ({{ smartGenProgress }}%)</p>
            
            <div class="smart-gen-logs">
               <div v-for="(log, i) in smartGenLogsDisplay" :key="i" class="log-entry">{{ log }}</div>
            </div>

            <!-- Visualization of the BOT playing? -->
            <!-- We could render the GameCanvas in background but it might be confusing if simulation is fast. -->
         </div>
       </div>
    </div>

    <!-- Step 2: Game -->
    <GameCanvas 
      v-if="step === 'play'"
      :audioBuffer="audioBuffer"
      :obstacles="obstacles"
      :sections="sections"
      :loadMap="loadedMapData"
      :difficulty="difficulty"
      :practiceMode="isPractice"
      :tutorialMode="isTutorial"
      @retry="startGame"
      @exit="handleExit"
      @map-ready="handleMapReady"
      @record-update="handleRecordUpdate"
    />
    
    <!-- Mode Selection Modal -->
    <div v-if="showModeSelect" class="mode-modal-overlay">
      <div class="mode-modal glass-panel">
        <div class="mode-header-row">
          <h2>SELECT GAME MODE</h2>
          <button class="debug-btn" @click="showMapPreview = true" title="View Map Logic">
            🔍 Map Logic
          </button>
        </div>
        
        <div class="mode-options">
          <button @click="selectMode('practice')" class="mode-btn practice">
            <div class="mode-icon">🛠️</div>
            <h3>PRACTICE MODE</h3>
            <p>체크포인트 사용 가능<br>기록 미저장</p>
          </button>
          
          <button @click="selectMode('normal')" class="mode-btn normal">
            <div class="mode-icon">🎵</div>
            <h3>NORMAL MODE</h3>
            <p>표준 플레이<br>랭킹 기록 저장</p>
          </button>
          
          <button @click="selectMode('tutorial')" class="mode-btn tutorial" :class="{ recommended: isFirstTime }">
            <div class="mode-icon">🎓</div>
            <div v-if="isFirstTime" class="rec-badge">RECOMMENDED</div>
            <h3>TUTORIAL MODE</h3>
            <p>게임 가이드<br>기초 배우기</p>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Map Preview/Debug Modal -->
    <MapPreviewModal 
      v-if="showMapPreview" 
      :mapData="loadedMapData" 
      @close="showMapPreview = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useAudioAnalyzer, type SongSection } from '@/composables/useAudioAnalyzer';
import { useAuth } from '@/composables/useAuth';
import { useRoute } from 'vue-router';
import { GameEngine } from '@/utils/game-engine';
import { trimAndEncodeAudio, splitBase64ToChunks, CHUNK_SIZE, MAX_SINGLE_UPLOAD_SIZE } from '@/utils/audioUtils';
import GameGuide from '@/components/GameGuide.vue'; // Guide Component
import MapPreviewModal from '@/components/MapPreviewModal.vue'; // Visual Debugger
import { useRouter } from 'vue-router'; // Added useRouter import implicitly used before

const router = useRouter();

// 플레이 중에는 navbar 숨기기
definePageMeta({
  layout: 'game'
});

const step = ref<'upload' | 'play' | 'smart_gen'>('upload');
const selectedSong = ref<File | null>(null);
const { analyzeAudio } = useAudioAnalyzer();

// Smart Gen
import { SmartMapGenerator } from '@/utils/smart-map-generator';
const showSmartGenUI = ref(false);
const smartGenLog = ref<string[]>([]);
const smartGenProgress = ref(0);
const smartGenStatus = ref('');
const smartGenEngine = ref<GameEngine | null>(null);

const smartGenLogsDisplay = computed(() => {
  return smartGenLog.value.slice(-6); // Show last 6 lines
});

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

// Modes
const showModeSelect = ref(false);
const hasSavedCurrentMap = ref(false);
const showMapPreview = ref(false); // Debug Modal State
const isPractice = ref(false);
const isTutorial = ref(false);
const isFirstTime = ref(false);

// Difficulty
const difficulty = ref(1);

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

// 노래 길이에 따른 난이도 보정 (짧은 노래는 더 빡빡하게)
const getLengthDifficultyBonus = (duration: number): number => {
  if (duration >= 60) return 0;
  // 60초 미만인 경우 최대 +5 난이도 보너스 (10초일 때 +5)
  return Math.max(0, (60 - duration) / 10);
};


// --- Tutorial Map Generator ---
const generateTutorialMap = () => {
  const tutorialDuration = 45; // seconds
  const tutorialBeats = Array.from({ length: 40 }, (_, i) => 2 + i * 1.5); // Slow beats
  
  // Custom simple obstacles
  const tutorialObstacles: any[] = [];
  const tutorialPortals: any[] = [];
  const tutorialMessages: { progress: number, text: string }[] = [
    { progress: 0, text: "HOLD to go UP ↗" },
    { progress: 5, text: "RELEASE to go DOWN ↘" },
    { progress: 12, text: "DODGE obstacles!" },
    { progress: 25, text: "PASS through portals to switch gravity!" },
    { progress: 45, text: "Use MINI mode for tight spaces" }
  ];
  
  // Section 1: Basic Input (0-15s) - More open space
  // Just enough space to get used to movement
  
  // Section 2: Simple Obstacles (15s+)
  tutorialObstacles.push({ x: 2500, y: 500, width: 80, height: 80, type: 'spike', initialY: 500 }); // Low
  tutorialObstacles.push({ x: 3500, y: 150, width: 80, height: 80, type: 'spike', initialY: 150 }); // High
  
  // Section 3: Gravity (30s)
  tutorialPortals.push({ x: 5000, y: 150, width: 80, height: 430, type: 'gravity_yellow', activated: false });
  tutorialObstacles.push({ x: 5800, y: 150, width: 80, height: 80, type: 'block', initialY: 150 }); 
  tutorialPortals.push({ x: 6800, y: 150, width: 80, height: 430, type: 'gravity_blue', activated: false });
  
  // Section 4: Mini Mode (45s)
  tutorialPortals.push({ x: 8500, y: 150, width: 80, height: 430, type: 'mini_pink', activated: false });
  tutorialObstacles.push({ x: 9500, y: 340, width: 60, height: 40, type: 'block', initialY: 340 });
  tutorialObstacles.push({ x: 9500, y: 420, width: 60, height: 40, type: 'block', initialY: 420 }); // Tight gap
  tutorialPortals.push({ x: 10500, y: 150, width: 80, height: 430, type: 'mini_green', activated: false });

  return {
    title: 'TUTORIAL_MODE',
    difficulty: 1,
    seed: 9999,
    engineObstacles: tutorialObstacles,
    enginePortals: tutorialPortals,
    autoplayLog: [], 
    duration: 60, // Long enough to learn
    beatTimes: tutorialBeats,
    sections: [],
    bpm: 80,
    measureLength: 3,
    audioData: null,
    isTutorial: true,
    messages: tutorialMessages
  };
};

const selectMode = async (mode: 'practice' | 'normal' | 'tutorial') => {
  showModeSelect.value = false;
  isPractice.value = mode === 'practice';
  isTutorial.value = mode === 'tutorial';

  if (mode === 'tutorial') {
    localStorage.setItem('umm_guide_seen', 'true');
    isFirstTime.value = false;
    
    // 튜토리얼 모드: 기존 맵과 오디오 유지, AI 가이드만 활성화
    // loadedMapData에 autoplayLog가 없으면 생성
    if (loadedMapData.value && (!loadedMapData.value.autoplayLog || loadedMapData.value.autoplayLog.length === 0)) {
      console.log('[Tutorial] Generating AI path for existing map...');
      const tutorialEngine = new GameEngine({ 
        difficulty: loadedMapData.value.difficulty || 5, 
        density: 1.0, 
        portalFrequency: 0.15 
      });
      
      // 기존 맵 데이터 로드
      if (loadedMapData.value.engineObstacles) {
        tutorialEngine.obstacles = loadedMapData.value.engineObstacles.map((o: any) => ({ ...o }));
      }
      if (loadedMapData.value.enginePortals) {
        tutorialEngine.portals = loadedMapData.value.enginePortals.map((p: any) => ({ ...p }));
      }
      tutorialEngine.totalLength = (loadedMapData.value.duration || 120) * tutorialEngine.baseSpeed + 1000;
      
      // AI 경로 계산
      const success = tutorialEngine.computeAutoplayLog(200, 360);
      if (success && tutorialEngine.autoplayLog.length > 0) {
        loadedMapData.value.autoplayLog = tutorialEngine.autoplayLog;
        console.log('[Tutorial] AI Path Generated with', tutorialEngine.autoplayLog.length, 'points');
      }
    }
    
    // 오디오 버퍼는 기존 것 유지 (이미 로드됨)
    step.value = 'play';
  } else {
    step.value = 'play';
  }
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
         showModeSelect.value = true; // Show modal instead of direct play
     } else if (item.mapData._id) {
        // Try loading from IndexedDB using server ID
        console.log("Loading recent map audio from IndexedDB...", item.mapData._id);
        try {
          const localFile = await getAudioFromDB(item.mapData._id);
          if (localFile) {
             const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
             const ab = await localFile.arrayBuffer();
             audioBuffer.value = await audioCtx.decodeAudioData(ab);
             showModeSelect.value = true;
          } else {
             alert("오디오 파일을 찾을 수 없습니다. (IDB Miss)");
          }
        } catch(e) { console.error(e); }
     } else {
        alert("오디오 데이터가 만료되었습니다.");
     }
     return;
  }

  /* handleSongSelect */
  const file = input as File;
  selectedSong.value = file;
  isAnalyzing.value = true;
  startTime.value = Date.now();
  hasSavedCurrentMap.value = false;

  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 1. SONG ANALYSIS
    analysisProgress.value = { step: 'SONG ANALYSIS', percent: 0 };
    const result = await analyzeAudio(file, difficulty.value, (p) => {
      analysisProgress.value = { 
        step: 'SONG ANALYSIS', 
        percent: p.percent 
      };
      if (p.percent > 5) {
        const elapsed = (Date.now() - startTime.value) / 1000;
        const totalEstimated = elapsed / (p.percent / 100);
        timeLeft.value = Math.max(0, totalEstimated - elapsed);
      }
    });
    
    audioBuffer.value = result.buffer;
    obstacles.value = result.obstacles;
    sections.value = result.sections;

    // 10초 미만 노래 제한
    if (result.duration < 10) {
      alert("10초 이상의 노래만 선택 가능합니다. (현재: " + result.duration.toFixed(1) + "초)");
      isAnalyzing.value = false;
      return;
    }

    // 노래 전체 재생 (Infinity나 다름없음)
    const effectiveDuration = result.duration;
    
    const filteredBeatTimes = result.obstacles;
    const filteredSections = result.sections;

    // 난이도 보정 (노래가 짧으면 기본 난이도에 보너스 추가)
    const bonus = getLengthDifficultyBonus(effectiveDuration);
    const adjustedDifficulty = Math.min(30, difficulty.value + bonus);
    
    if (bonus > 0.5) {
      console.log(`[Difficulty] Short song detected. Adjusted difficulty: ${difficulty.value} -> ${adjustedDifficulty.toFixed(2)}`);
    }

    // 2. MOVEMENT PATH GENERATION & ADJUSTMENT
    const tempEngine = new GameEngine({ difficulty: adjustedDifficulty, density: 1.0, portalFrequency: 0.15 });
    
    const uniqueSeed = Date.now() + Math.floor(Math.random() * 1000000);
    
    let success = false;
    for (let i = 0; ; i++) {
      // Step Update
      const stepName = i === 0 ? 'MOVEMENT PATH GENERATION' : 'MOVEMENT PATH ADJUSTMENT';
      analysisProgress.value = { step: stepName, percent: (i % 10) * 10 }; // Fake pulse for retry
      
      // Delay for visibility on first run
      if (i === 0) await new Promise(r => setTimeout(r, 600));

      tempEngine.generateMap(filteredBeatTimes, filteredSections, effectiveDuration, uniqueSeed + i, false, i, result.bpm, result.measureLength, result.volumeProfile);
      
      // Validation
      success = await tempEngine.computeAutoplayLogAsync(200, 360, (p) => {
        analysisProgress.value.percent = Math.floor(p * 100);
      });
      
      if (success) {
        // 3. MAP GENERATION (Visual Step)
        analysisProgress.value = { step: 'MAP GENERATION', percent: 100 };
        await new Promise(r => setTimeout(r, 500));

        // 4. MAP ADJUSTMENT (Visual Step)
        analysisProgress.value = { step: 'MAP ADJUSTMENT', percent: 100 };
        await new Promise(r => setTimeout(r, 500));

        // 5. MAP SAVING
        analysisProgress.value = { step: 'MAP SAVING', percent: 100 };
        validationFailure.value = null;
        break; 
      }
      
      // Failure Handling
      if (tempEngine.validationFailureInfo) {
        validationFailure.value = {
          x: Math.floor(tempEngine.validationFailureInfo.x),
          y: Math.floor(tempEngine.validationFailureInfo.y),
          rawObstacles: tempEngine.validationFailureInfo.nearObstacles
        };
        nextTick(() => drawFailurePreview());
      }
      
      // Explicit yield to event loop to prevent UI freeze during sync generateMap
      await new Promise(r => setTimeout(r, 10));

      if (i > 2500) { 
          console.warn("Max retries reached.");
          break; 
      }
    }

    if (success) {
      // 5. MAP SAVING (Continue)
      await new Promise(r => setTimeout(r, 500));
      
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

      analysisProgress.value.step = 'COMPLETED';
      
    } else {
      throw new Error("지나갈 수 있는 맵을 생성하지 못했습니다. 다시 시도해 주세요.");
    }
    
    setTimeout(() => {
      isAnalyzing.value = false;
      showModeSelect.value = true;
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
  // If explicitly retrying (e.g. from pause menu or win screen), maybe skip mode select?
  // But if it's 'retry' from GameCanvas (e.g. game over), we usually just restart.
  // We keep the current mode.
  step.value = 'play';
};

const handleExit = () => {
  const isTest = sessionStorage.getItem('umm_is_test');
  if (isTest) {
    sessionStorage.removeItem('umm_is_test');
    router.push('/editor');
  } else {
    step.value = 'upload';
    showModeSelect.value = false;
    isPractice.value = false;
    isTutorial.value = false;
  }
};

const startSmartGenMode = async (arrayBuffer: ArrayBuffer, mapData: any) => {
  step.value = 'smart_gen';
  showSmartGenUI.value = true;
  smartGenLog.value = [];
  
  // Prepare Engine
  const genEngine = new GameEngine();
  smartGenEngine.value = genEngine;
  
  const generator = new SmartMapGenerator(genEngine);
  
  // Log syncing
  const interval = setInterval(() => {
    smartGenLog.value = [...generator.log];
    smartGenProgress.value = generator.progress;
    smartGenStatus.value = generator.status;
  }, 100);

  const success = await generator.generate(arrayBuffer, mapData);
  clearInterval(interval);
  
  if (success) {
     // Save result to loadedMapData
     loadedMapData.value = {
        ...mapData,
        engineObstacles: genEngine.obstacles,
        enginePortals: genEngine.portals,
        autoplayLog: genEngine.autoplayLog
     };
     
     // Transition to Play Mode after a delay
     setTimeout(() => {
        showSmartGenUI.value = false;
        step.value = 'play';
        // Auto-save result back to editor session just in case they go back
        sessionStorage.setItem('umm_edit_map', JSON.stringify(loadedMapData.value));
     }, 1500);
  } else {
     alert("Generation failed to reach target accuracy.");
     showSmartGenUI.value = false;
     step.value = 'upload'; // Go back
  }
};




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
  if (!user.value) return; // Guest check: Do not save map
  if (isPractice.value || isTutorial.value) return; // Do not save practice/tutorial maps
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

    let audioBase64: string | null = null;
    let needsChunkedUpload = false;

    if (selectedSong.value && audioBuffer.value) {
      body.audioUrl = `/audio/${selectedSong.value.name}`;
      
      // 1. Trim audio to map duration (saves space for long songs)
      console.log(`[Audio] Trimming audio from ${audioBuffer.value.duration}s to ${mapData.duration}s`);
      audioBase64 = await trimAndEncodeAudio(audioBuffer.value, mapData.duration);
      
      // 2. Check if chunked upload is needed
      if (audioBase64.length > MAX_SINGLE_UPLOAD_SIZE) {
        console.log(`[Audio] Trimmed audio (${(audioBase64.length / 1024 / 1024).toFixed(2)}MB) exceeds limit, will use chunked upload`);
        needsChunkedUpload = true;
      } else {
        body.audioData = audioBase64;
      }
    } else if (loadedMapData.value?.audioUrl) {
      body.audioUrl = loadedMapData.value.audioUrl;
      // If we loaded it from DB, retain the audioData if reasonable size
      if (loadedMapData.value.audioData && loadedMapData.value.audioData.length < 100 * 1024 * 1024) {
         body.audioData = loadedMapData.value.audioData;
      }
    }

    // Save map first (without audio if chunked)
    if (needsChunkedUpload) {
      body.audioData = null;
      body.audioChunks = [];
    }

    const saved = await $fetch<any>('/api/maps', {
      method: 'POST',
      body
    });
    
    hasSavedCurrentMap.value = true;
    console.log(`[Database] Map successfully saved. ID: ${saved._id}`);
    
    // Assign ID to current loaded map so we can reference it
    if (loadedMapData.value) {
      loadedMapData.value._id = saved._id;
    }
    
    // 3. Upload audio chunks if needed
    if (needsChunkedUpload && audioBase64) {
      console.log(`[Audio] Starting chunked upload...`);
      const chunks = splitBase64ToChunks(audioBase64, CHUNK_SIZE);
      
      for (let i = 0; i < chunks.length; i++) {
        console.log(`[Audio] Uploading chunk ${i + 1}/${chunks.length}...`);
        await $fetch(`/api/maps/${saved._id}/audio-chunk`, {
          method: 'POST',
          body: { chunkIndex: i, chunkData: chunks[i], totalChunks: chunks.length }
        });
      }
      console.log(`[Audio] All ${chunks.length} chunks uploaded successfully!`);
    }
    
    // 4. Fallback: Save to IndexedDB for offline access (large original files)
    if (!body.audioData && !needsChunkedUpload && selectedSong.value) {
       console.log("Saving original audio to local IndexedDB for fast auto-load...");
       try {
         await saveAudioToDB(saved._id, selectedSong.value);
         console.log("Audio successfully saved to local IndexedDB!");
       } catch (dbErr) {
         console.error("Failed to save to IndexedDB", dbErr);
       }
    }
  } catch (e: any) {
    console.error("Failed to save map auto-registration:", e);
  }
};

const handleRecordUpdate = async (data: { score: number, progress: number }) => {
  if (!loadedMapData.value?._id) return;
  
  // Update local bestScore for immediate UI feedback (Only for Normal Mode)
  if (!isPractice.value && !isTutorial.value && data.score > (loadedMapData.value.bestScore || 0)) {
     loadedMapData.value.bestScore = data.score;
  }

  // Save Progress per mode?
  // User asked: "Save each progress on login"
  // For Normal Mode, we allow saving record.
  // For Tutorial, we will use a special dummy ID to track completion.
  if (isPractice.value) return; 
  if (!user.value) return; 

  const targetId = isTutorial.value ? 'tutorial_mode' : loadedMapData.value?._id;
  if (!targetId) return;

  try {
    const res: any = await $fetch(`/api/maps/${targetId}/record`, {
      method: 'POST',
      body: {
        score: data.score,
        progress: data.progress,
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
  obstacles.value = targetMap.beatTimes || [];
  sections.value = targetMap.sections || [];
  difficulty.value = targetMap.difficulty || 10;
  
  // Create silent buffer
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const buffer = audioCtx.createBuffer(1, Math.max(1, audioCtx.sampleRate * (targetMap.duration || 10)), audioCtx.sampleRate);
  audioBuffer.value = buffer;
  
  // Check for tutorial flag from editor
  const isTutorialSession = sessionStorage.getItem('umm_is_tutorial') === 'true';
  if (isTutorialSession) {
    sessionStorage.removeItem('umm_is_tutorial');
    selectMode('tutorial');
  } else {
    // 모드 선택 화면 표시
    showModeSelect.value = true;
  }
};

async function initFromQuery() {
  // Check if guide should be shown (first time user)
  const hasSeenGuide = localStorage.getItem('umm_guide_seen');
  if (!hasSeenGuide) {
    isFirstTime.value = true;
    showModeSelect.value = true; // Show mode select immediately to recommend tutorial
  }

  // 1. Check for map data passed from Maps tab (sessionStorage)
  const sessionMap = sessionStorage.getItem('umm_load_map');
  const isSmartGenSession = sessionStorage.getItem('umm_smart_gen') === 'true';
  
  if (sessionMap) {
    try {
      const targetMap = JSON.parse(sessionMap);
      
      sessionStorage.removeItem('umm_load_map'); 
      if (isSmartGenSession) sessionStorage.removeItem('umm_smart_gen'); // Consume flag

      loadedMapData.value = targetMap;
      obstacles.value = targetMap.beatTimes;
      sections.value = targetMap.sections;
      difficulty.value = targetMap.difficulty;

      if (targetMap.audioData || targetMap.audioUrl) {
         // Load Audio Logic (Shared)
         try {
             const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
             const audioCtx = new AudioContext();
             let ab: ArrayBuffer | null = null;
             
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
      
      // Fallback
      if (isSmartGenSession) {
          alert("Smart Gen requires audio!");
          step.value = 'upload';
      } else {
          await handleMapOnlyStart(targetMap);
      }
      return;
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
         let loadedAudio: ArrayBuffer | null = null;

         // 1. Try Base64 Data (Small files)
         if (targetMap.audioData) {
            console.log("Loading audio from Base64 Data...");
            const res = await fetch(targetMap.audioData);
            loadedAudio = await res.arrayBuffer();
         }

         // 2. Try IndexedDB (Large files local cache)
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

         // 3. Try URL (Samples or Hosted)
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
             const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
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
       // View-only mode for maps with no audio config
       await handleMapOnlyStart(targetMap);
    }
    }
  } catch (e) {
    console.error("Failed to load map:", e);
  } finally {
    isAnalyzing.value = false;
  }
}

onMounted(initFromQuery);

// 쿼리 파라미터 변경 감지 (예: 다른 맵으로 이동 시)
watch(() => route.query.map, (newMap) => {
  if (newMap) initFromQuery();
});
watch(() => route.query.mapId, (newMapId) => {
  if (newMapId) initFromQuery();
});

// --- IndexedDB Helper ---
const DB_NAME = 'umm_audio_db';
const STORE_NAME = 'audio_files';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e: any) => resolve(e.target.result);
    request.onerror = (e) => reject(e);
  });
};

const saveAudioToDB = async (mapId: string, file: File) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(file, mapId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

const getAudioFromDB = async (mapId: string): Promise<File | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(mapId);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};
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

.mode-modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(10px);
}

.mode-modal {
  background: #111;
  border: 1px solid #333;
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  max-width: 900px;
  width: 90%;
  box-shadow: 0 0 50px rgba(0,0,0,0.5);
}

.mode-modal h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #fff 0%, #888 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mode-options {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.mode-btn {
  flex: 1;
  min-width: 200px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.mode-btn:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.mode-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.mode-btn h3 {
  font-size: 1.2rem;
  font-weight: 900;
  margin: 0;
  color: #fff;
}

.mode-btn p {
  color: #888;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.5;
}

.mode-btn.practice:hover { border-color: #ffff00; }
.mode-btn.practice:hover .mode-icon { animation: bounce 0.5s; }
.mode-btn.normal:hover { border-color: #00ffff; }
.mode-btn.normal:hover .mode-icon { animation: pulse 0.5s; }
.mode-btn.tutorial:hover { border-color: #ff00ff; }
.mode-btn.tutorial:hover .mode-icon { animation: wiggle 0.5s; }

.mode-btn.tutorial.recommended {
  border-color: #ff00ff;
  background: rgba(255, 0, 255, 0.05);
  animation: pulse-border 2s infinite;
}

.rec-badge {
  position: absolute;
  top: -12px;
  background: #ff00ff;
  color: white;
  font-size: 0.7rem;
  font-weight: 900;
  padding: 4px 10px;
  border-radius: 20px;
  box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(255, 0, 255, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(255, 0, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 0, 255, 0); }
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

.mode-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
}

.debug-btn {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.debug-btn:hover {
  border-color: #00ffff;
  color: #00ffff;
  background: rgba(0, 255, 255, 0.1);
}

@import '@/assets/css/play_smart_gen.css';
</style>
