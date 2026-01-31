<template>
  <div class="game-wrapper">
    <!-- 16:9 고정 비율을 유지하면서 화면에 꽉 차는 컨테이너 -->
    <div class="game-container">
      <canvas ref="canvas" width="1280" height="720"></canvas>
      
      <div class="hud">
        <div class="hud-top-left">
          <div class="game-actions">
            <button 
              v-if="!multiplayerMode && !loadMap && isMapValidated && !hasSaved" 
              @click="manualSave" 
              class="hud-action-btn save"
            >
              SAVE MAP
            </button>
            <button @click="emit('exit', { progress: progressPct, score: score, outcome: gameOver ? 'fail' : 'win' })" class="hud-action-btn exit">나가기</button>
            <button @click="emit('change-mode')" class="hud-action-btn mode-change">MODE</button>
            <button v-if="practiceMode && !gameOver && !isRecording" @click="manualCheckpoint" class="hud-action-btn checkpoint">SET CP (C)</button>
          </div>
          <div class="title-container">
            <div class="wave-icon" :class="{ inverted: isGravityInverted }">▶</div>
            <h1 class="game-title" v-if="!tutorialMode">ULTRA MUSIC MANIA</h1>
            <h1 class="game-title tutorial" v-else>TUTORIAL</h1>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: progress + '%' }"></div>
            <!-- Best Record Marker -->
            <div 
              v-if="bestProgress > 0" 
              class="best-record-marker" 
              :style="{ left: bestProgress + '%' }"
            >
              <div class="marker-line"></div>
              <span class="marker-text">BEST</span>
            </div>
            <span class="progress-text">{{ Math.floor(progress) }}%</span>
          </div>
        </div>

        <div class="score-container">
          <div class="score-label">SCORE</div>
          <div class="score-val">{{ Math.floor(score) }}</div>
        </div>
        
        <div class="speed-indicator">
          <span :style="{ color: speedColor }">{{ speedLabel }}</span>
          <span v-if="isMini" class="mini-badge">MINI</span>
          <span v-if="isMini" class="mini-badge">MINI</span>
          <span v-if="isAutoplayUI && !tutorialMode" class="autoplay-badge">AUTO MODE</span>
          <span v-if="tutorialMode" class="autoplay-badge tutorial">TUTORIAL</span>
          <span v-if="practiceMode && !isRecording" class="autoplay-badge practice">PRACTICE</span>
        </div>

        
        <div v-if="gameOver" class="status-overlay fail">
          <div class="status-content">
            <h1 class="status-text fail">CRASHED</h1>
            <p v-if="isNewBest" class="new-best-text">🎉 NEW BEST! {{ progressPct }}%</p>
            <p class="status-sub">{{ failReason }}</p>
            <div class="status-stats">
              <span>{{ progressPct }}% PROGRESS</span>
              <span class="stat-divider">|</span>
              <span>ATTEMPT {{ attempts }}</span>
            </div>
          </div>
        </div>

        <div v-if="victory" class="status-overlay win">
          <div class="status-content">
            <h1 class="status-text win">COMPLETE!</h1>
            <p class="status-sub">모든 장애물을 돌파했습니다</p>
            <div class="status-stats">
              <span>SCORE {{ Math.floor(score) }}</span>
            </div>

            <!-- Video Save Button -->
            <div class="video-save-section">
              <button 
                v-if="!isRecordingSaved" 
                @click="saveRecording" 
                class="save-video-btn"
                :disabled="isSavingVideo"
              >
                <span v-if="isSavingVideo">💾 저장 중...</span>
                <span v-else>🎬 영상 저장</span>
              </button>
              <p v-if="isRecordingSaved" class="save-success">✅ 영상이 저장되었습니다!</p>
              <p class="save-hint">클리어 장면을 동영상으로 저장합니다</p>
            </div>

            <!-- Map Rating Vote -->
            <div v-if="loadMap && loadMap._id && !hasVoted" class="rating-vote pointer-events-auto">
               <p class="rating-label">RATE THIS MAP (1-30)</p>
               <div class="rating-controls">
                 <input type="range" min="1" max="30" v-model.number="userRating" class="rating-slider" />
                 <span class="rating-value">{{ userRating }}</span>
               </div>
               <button @click="submitRating" class="submit-rating-btn">SUBMIT VOTE</button>
            </div>
            <div v-else-if="hasVoted" class="rating-done">
               THANK YOU FOR VOTING!
            </div>
          </div>
        </div>


        <div v-if="countdown" class="overlay countdown-overlay">
          <div class="countdown-text">{{ countdown }}</div>
        </div>

        <div v-if="isComputingPath && !gameOver && !victory" class="validation-status">
           <div class="status-msg">OPTIMIZING MAP...</div>
           <div class="mini-progress">
             <div class="fill" :style="{ width: computingProgress + '%' }"></div>
           </div>
        </div>
        
        <div v-if="practiceMode && checkpoints.length > 0 && !isRecording" class="checkpoint-indicator">
           CPs: {{ checkpoints.length }} (Last: {{ Math.floor(checkpoints[checkpoints.length - 1].progress) }}%)
        </div>

        <div class="controls-hint" v-if="!countdown && !gameOver && !victory && !isComputingPath">
          <div v-if="tutorialMode && activeTutorialMessage" class="tutorial-message-bubble">
            {{ activeTutorialMessage }}
          </div>
          <div v-else>
            <span>클릭/스페이스 유지 = 위로 | 해제 = 아래로</span>
            <span v-if="practiceMode && !isRecording"> | [C] 체크포인트 | [X] 최근 삭제</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { GameEngine, type MapData, Obstacle } from '../utils/game-engine';
import { drawObstacle } from '../utils/canvas-renderer';
const props = defineProps<{
  audioBuffer: AudioBuffer | null;
  obstacles: number[];
  sections: any[];
  autoRetry?: boolean;
  loadMap?: any; // 저장된 맵 데이터 로드용
  isViewOnly?: boolean; // 맵 탭에서 확인용
  multiplayerMode?: boolean; // 멀티플레이어 레이싱 모드
  difficulty?: number; // 외부에서 전달받은 난이도
  opponentY?: number;
  opponentProgress?: number;
  practiceMode?: boolean;
  tutorialMode?: boolean;
  invincible?: boolean;
}>();

const emit = defineEmits(['retry', 'exit', 'complete', 'map-ready', 'progress-update', 'record-update']);

const canvas = ref<HTMLCanvasElement | null>(null);
const engine = ref(new GameEngine());
const gameOver = ref(false);
const victory = ref(false);
const score = ref(0);
const progress = ref(0);
const failReason = ref('');
const progressPct = ref(0);
const countdown = ref<string | null>(null);
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

// Video Recording
const isRecordingSaved = ref(false);
const isSavingVideo = ref(false);
const isRecording = ref(false); // Track when actively recording
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];


const submitRating = async () => {
  if (!props.loadMap?._id || hasVoted.value) return;
  try {
    await $fetch(`/api/maps/${props.loadMap._id}/rate`, {
      method: 'POST',
      body: { rating: userRating.value }
    });
    hasVoted.value = true;
  } catch (e) {
    alert("Failed to submit rating.");
  }
};

// 녹화 시작 함수
const startRecording = () => {
  if (!canvas.value) return;
  
  try {
    recordedChunks = [];
    isRecordingSaved.value = false;
    
    // Canvas를 스트림으로 캡처
    const stream = canvas.value.captureStream(30); // 30fps
    
    // 오디오도 캡처 시도
    if (audioCtx && audioSource) {
      try {
        const audioDestination = audioCtx.createMediaStreamDestination();
        audioSource.connect(audioDestination);
        const audioTracks = audioDestination.stream.getAudioTracks();
        audioTracks.forEach(track => stream.addTrack(track));
      } catch (e) {
        console.log('[Recording] Audio capture not available, video only');
      }
    }
    
    // MediaRecorder 설정
    const options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      // Fallback
      options.mimeType = 'video/webm';
    }
    
    mediaRecorder = new MediaRecorder(stream, options);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    
    mediaRecorder.start(100); // 100ms chunks
    isRecording.value = true;
    console.log('[Recording] Started');
  } catch (e) {
    console.error('[Recording] Failed to start:', e);
  }
};

// 녹화 중지 함수
const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    isRecording.value = false;
    console.log('[Recording] Stopped');
  }
};

// 녹화 저장 함수
const saveRecording = async () => {
  if (recordedChunks.length === 0) {
    alert('녹화된 영상이 없습니다. 다시 플레이해주세요.');
    return;
  }
  
  isSavingVideo.value = true;
  
  try {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    
    // 파일명 생성
    const mapName = props.loadMap?.title || 'gameplay';
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `UMM_${mapName}_${timestamp}.webm`;
    
    // 다운로드 링크 생성
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    isRecordingSaved.value = true;
    console.log('[Recording] Saved:', filename);
  } catch (e) {
    console.error('[Recording] Save failed:', e);
    alert('영상 저장에 실패했습니다.');
  } finally {
    isSavingVideo.value = false;
  }
};


const currentTrackTime = ref(0);
const isComputingPath = ref(false);
const computingProgress = ref(0);
const isMapValidated = ref(false);
let autoRetryTimer: any = null;

// Multiplayer Interpolation
const interpOpponentY = ref(360);
const interpOpponentProgress = ref(0);
const interpolationFactor = 0.1; // Smoothing speed

// Audio
let audioCtx: AudioContext | null = null;
let audioSource: AudioBufferSourceNode | null = null;
const checkpoints = ref<any[]>([]); // Snapshot stacks
let clickDownBuffer: AudioBuffer | null = null;
let clickUpBuffer: AudioBuffer | null = null;
let lastAiHolding = false;

const dynamicTutorialMessage = ref<string | null>(null);
let messageTimeout: any = null;

const activeTutorialMessage = computed(() => {
  // 1. Dynamic Override (Events)
  if (dynamicTutorialMessage.value) return dynamicTutorialMessage.value;

  // 2. Static Progress-based
  if (!props.loadMap?.messages) return null;
  const currentProgress = progress.value;
  // Find the last message that is less than or equal to current progress
  const msgs = props.loadMap.messages.filter((m: any) => m.progress <= currentProgress);
  if (msgs.length === 0) return null;
  return msgs[msgs.length - 1].text;
});

const showDynamicMessage = (text: string, duration: number = 3000) => {
  dynamicTutorialMessage.value = text;
  if (messageTimeout) clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => {
    dynamicTutorialMessage.value = null;
  }, duration);
};

let animationId: number;
let lastFrameTime = 0;

// State
const isRunning = ref(false);

const speedColor = computed(() => {
  const mult = engine.value.speedMultiplier;
  if (mult < 0.6) return '#aa5500'; // 0.25x (Speed 0.5)
  if (mult < 0.8) return '#ff8800'; // 0.5x (Speed 0.7)
  if (mult < 1.1) return '#4488ff'; // 1x
  if (mult < 1.5) return '#44ff44'; // 2x
  if (mult < 1.8) return '#ff44ff'; // 3x
  return '#ff4444'; // 4x
});

const speedLabel = computed(() => {
  const mult = engine.value.speedMultiplier;
  if (mult < 0.6) return '0.25x';
  if (mult < 0.8) return '0.5x';
  if (mult < 1.1) return '1x';
  if (mult < 1.5) return '2x';
  if (mult < 1.8) return '3x';
  return '4x';
});

const difficultyName = computed(() => {
  if (difficulty.value < 8) return 'EASY';
  if (difficulty.value < 16) return 'NORMAL';
  if (difficulty.value < 24) return 'HARD';
  return 'IMPOSSIBLE';
});

const loadSfx = async () => {
  if (!audioCtx) return;
  
  const fetchAudio = async (url: string) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await audioCtx!.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.error(`Failed to load sfx: ${url}`, e);
      return null;
    }
  };

  if (!clickDownBuffer) clickDownBuffer = await fetchAudio('/audio/click_down.mp3');
  if (!clickUpBuffer) clickUpBuffer = await fetchAudio('/audio/click_up.mp3');
};

const playSfx = (buffer: AudioBuffer | null, volume: number = 0.5) => {
  if (!audioCtx || !buffer) return;
  try {
    const source = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(audioCtx.destination);
    source.start();
  } catch(e) {}
};



const startGame = () => {
  if (!props.audioBuffer || !canvas.value) return;
  
  stopGame();

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  loadSfx(); // 배경 부하 없이 비동기로 로드
  const wasAutoplay = props.multiplayerMode ? false : engine.value.isAutoplay;
  engine.value.setMapConfig({
    density: 1.0,
    portalFrequency: 0.15,
    difficulty: difficulty.value
  });
  engine.value.reset();
  engine.value.isAutoplay = wasAutoplay;
  isAutoplayUI.value = wasAutoplay;

  if (props.loadMap) {
    // 저장된 맵 데이터 로드
    engine.value.loadMapData(props.loadMap);
    difficulty.value = props.loadMap.difficulty;
    isMapValidated.value = true;
    
    // 튜토리얼 모드: 저장된 동선(autoplayLog) 사용
    if (props.tutorialMode && props.loadMap.autoplayLog && props.loadMap.autoplayLog.length > 0) {
      engine.value.isAutoplay = true;
      isAutoplayUI.value = true;
      console.log('[Tutorial] Using saved autoplayLog, length:', props.loadMap.autoplayLog.length);
    }
    
    // 최고 기록 초기화 (점수 / 10 = 퍼센트)
    if (props.loadMap.bestScore) {
      bestProgress.value = Math.min(100, props.loadMap.bestScore / 10);
    } else {
      bestProgress.value = 0;
    }
  } else {
    engine.value.generateMap(props.obstacles, props.sections, props.audioBuffer.duration, undefined, false);
    
    // 튜토리얼 모드: 생성된 동선 사용
    if (props.tutorialMode) {
      engine.value.isAutoplay = true;
      isAutoplayUI.value = true;
    }
    
    validateMapInBackground();
  }
  
  gameOver.value = false;
  victory.value = false;
  failReason.value = '';
  progressPct.value = 0;
  progress.value = 0;
  score.value = 0;
  isGravityInverted.value = false;
  lastAiHolding = false;
  
  // UI 즉시 리셋 (재시작 시 잔상 제거)
  emit('progress-update', { progress: 0, ghostProgress: 0 });
  
  emit('progress-update', { progress: 0, ghostProgress: 0 });
  
  if (checkpoints.value.length === 0) {
    draw();
    startCountdown();
  } else {
    // If we have checkpoints, we might want to stay there, but startGame usually resets.
    // However, for consistency with the existing code's logic (which was a bit ambiguous here):
    checkpoints.value = [];
    draw();
    startCountdown();
  }
  
  attempts.value++;
};

const emitMapData = () => {
  if (hasSaved.value) return;
  emit('map-ready', {
    difficulty: difficulty.value,
    engineObstacles: engine.value.obstacles,
    enginePortals: engine.value.portals,
    autoplayLog: engine.value.autoplayLog,
    duration: props.audioBuffer.duration
  });
  hasSaved.value = true;
};

const manualSave = () => {
  emitMapData();
};

const manualCheckpoint = () => {
  if (!props.practiceMode || gameOver.value) return;
  
  // Snapshot all relevant engine state
  const cp = {
    // Player
    x: engine.value.playerX,
    y: engine.value.playerY,
    velocity: engine.value.velocity,
    isHolding: engine.value.isHolding,
    
    // World
    cameraX: engine.value.cameraX,
    isGravityInverted: engine.value.isGravityInverted,
    speedMultiplier: engine.value.speedMultiplier,
    isMini: engine.value.isMini,
    waveAngle: engine.value.waveAngle,
    
    // Progress
    score: engine.value.score,
    progress: engine.value.progress,
    startTimeOffset: (audioCtx?.currentTime || 0) - engine.value.startTime, // Track time
    
    // Collections (Copies)
    obstacles: JSON.parse(JSON.stringify(engine.value.obstacles)), // Deep copy might be heavy but safe
    portals: JSON.parse(JSON.stringify(engine.value.portals)),
    
    timestamp: Date.now()
  };
  checkpoints.value.push(cp);
  
  // Visual feedback
  const ctx = canvas.value?.getContext('2d');
  if (ctx) {
    ctx.save();
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 30px Arial';
    ctx.fillText("CHECKPOINT SET!", canvas.value!.width/2, 100);
    ctx.restore();
  }
  console.log("Checkpoint set at", checkpoint.progress + "%");
};

const restoreCheckpoint = () => {
  if (checkpoints.value.length === 0 || !props.practiceMode) return;
  
  const cp = checkpoints.value[checkpoints.value.length - 1];
  
  // Restore Engine
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
  
  // Restore Objects
  engine.value.obstacles = JSON.parse(JSON.stringify(cp.obstacles));
  engine.value.portals = JSON.parse(JSON.stringify(cp.portals));
  
  // Reset Game State
  gameOver.value = false;
  victory.value = false;
  failReason.value = '';
  isRunning.value = true;
  engine.value.isDead = false;
  engine.value.isPlaying = true;
  
  // Restore Audio
  if (audioSource) {
     try { audioSource.stop(); } catch(e){}
  }
  
  // New source from offset
  if (audioCtx && props.audioBuffer) {
    audioSource = audioCtx.createBufferSource();
    audioSource.buffer = props.audioBuffer;
    audioSource.connect(audioCtx.destination);
    
    const offset = cp.startTimeOffset;
    engine.value.startTime = audioCtx.currentTime - offset;
    
    audioSource.start(0, offset);
    lastFrameTime = audioCtx.currentTime;
  }
  
  // Clear trail to prevent visual artifacts connecting death point to checkpoint
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

  // Partial Fix Logic
  let resumeTime = 0;
  let sectionRetries = 0;
  let totalRetries = 0;

  for (let attempt = 0; attempt < 100; attempt++) {
    totalRetries = attempt;
    try {
      if (attempt > 0) {
        // Find where it failed
        const failure = engine.value.validationFailureInfo;
        if (failure && failure.x > 0) {
          // Find time from X
          const failPoint = engine.value.autoplayLog.find(p => p.x >= failure.x - 500);
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
          
          // Regenerate from resume point with increased safety for this section
          engine.value.generateMap(props.obstacles, props.sections, props.audioBuffer.duration, undefined, false, sectionRetries, 120, 2.0, undefined, resumeOptions);
        } else {
          // Total failure or no info, restart everything with new seed
          console.log(`[Validation] No failure info. Restarting full generation. Attempt ${attempt}`);
          engine.value.generateMap(props.obstacles, props.sections, props.audioBuffer.duration, undefined, false, attempt);
          resumeTime = 0;
          sectionRetries = 0;
        }
      }

      const success = await engine.value.computeAutoplayLogAsync(engine.value.playerX, engine.value.playerY, (p) => {
        // Overall progress calculation: (resumed part + current search) / total
        const resumeProgress = (resumeTime / props.audioBuffer!.duration) * 100;
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

const startAutoplay = async () => {
  if (props.multiplayerMode) return;
  if (!isMapValidated.value) return; // 검증 완료 전에는 시작 불가

  isAutoplayUI.value = true;
  engine.value.isAutoplay = true;

  // 이미 경로가 있으면 바로 시작
  if (engine.value.autoplayLog.length > 0) {
    startGame();
    return;
  }
  
  // 혹시라도 경로가 없으면 한 번 더 시도 (안전장치)
  await validateMapInBackground();
  if (isMapValidated.value) {
    startGame();
  }
};


const startCountdown = () => {
  // 빠른 재시작: GO!만 표시
  countdown.value = 'GO!';
  
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
  
  // 녹화 시작
  startRecording();
  
  loop();
};

const stopGame = () => {
  isRunning.value = false;
  if (autoRetryTimer) clearTimeout(autoRetryTimer);
  
  if (audioSource) {
    try { audioSource.stop(); } catch(e){}
    audioSource.disconnect();
    audioSource = null;
  }
  if (audioCtx) {
    try { audioCtx.close(); } catch(e){}
    audioCtx = null;
  }
  cancelAnimationFrame(animationId);
};

// Input handlers - 순수 웨이브 (누르면 위로, 떼면 아래로)
const handleInputDown = (e?: Event) => {
  if (e) {
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('.no-prevent-default'))) {
      return;
    }
    e.preventDefault();
  }
  if (!isRunning.value || engine.value.isAutoplay) return;
  
  if (!engine.value.isHolding) {
    // 튜토리얼 모드에서만 클릭 소리 재생
    if (props.tutorialMode) {
      playSfx(clickDownBuffer, 1.5);
    }
  }
  engine.value.setHolding(true);
};

const handleInputUp = (e?: Event) => {
  if (e) {
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('.no-prevent-default'))) {
      return;
    }
    e.preventDefault();
  }
  if (engine.value.isAutoplay) return;
  
  if (engine.value.isHolding) {
    // 튜토리얼 모드에서만 클릭 소리 재생
    if (props.tutorialMode) {
      playSfx(clickUpBuffer, 1.0);
    }
  }
  engine.value.setHolding(false);
};

// Keyboard listener for Checkpoint
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.code === 'KeyC' && props.practiceMode) {
    manualCheckpoint();
  } else if (e.code === 'KeyX' && props.practiceMode) {
    if (checkpoints.value.length > 0) {
      checkpoints.value.pop();
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  
  // Set up Portal Signal for Tutorial Mode
  engine.value.onPortalActivation = (type) => {
    if (!props.tutorialMode) return;
    
    switch (type) {
      case 'gravity_yellow':
      case 'gravity_blue':
        showDynamicMessage("GRAVITY SWITCHED! ↕");
        break;
      case 'speed_2':
      case 'speed_3':
      case 'speed_4':
        showDynamicMessage("SPEED UP! ⏩");
        break;
      case 'speed_0.5':
      case 'speed_0.25':
        showDynamicMessage("SLOW DOWN! ⏪");
        break;
      case 'mini_pink':
        showDynamicMessage("MINI MODE: TIGHT SPACES! ✨");
        break;
      case 'mini_green':
        showDynamicMessage("NORMAL SIZE RESTORED");
        break;
    }
  };
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  stopGame();
});

const handleGameOver = () => {
  gameOver.value = true;
  failReason.value = engine.value.failReason || 'CRASHED';
  progressPct.value = engine.value.getProgress();
  isRunning.value = false;
  
  // 최고 기록 체크
  if (progressPct.value > bestProgress.value) {
    bestProgress.value = progressPct.value;
    isNewBest.value = true;
  } else {
    isNewBest.value = false;
  }
  
  if (audioSource) {
    try { audioSource.stop(); } catch(e){}
  }
  
  // 녹화 중지 지연 (결과 화면 포함)
  setTimeout(() => {
    stopRecording();
    emit('record-update', { score: score.value, progress: progress.value });
  }, 3000);
  
  // 히트박스 모드로 3초간 보여준 후 재시작
  // 게임 오버 상태에서도 계속 그리기
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
  }, props.practiceMode ? 1000 : 3000); // Faster restart for practice

};

const handleVictory = () => {
  victory.value = true;
  isRunning.value = false;
  score.value = Math.floor(score.value + 1000); // Bonus for clear
  progressPct.value = 100;
  
  if (audioSource) {
    try { audioSource.stop(); } catch(e){}
  }
  
  // 녹화 중지 지연 (클리어 화면 포함)
  setTimeout(() => {
    stopRecording();
    emit('record-update', { score: score.value, progress: 100 });
  }, 3000);
  
  emit('complete', { score: score.value });

  // 클리어 화면 루프 (녹화에 포함되도록)
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
  
  // 오디오 시간 기준으로 실제 트랙 진행 시간 계산
  const trackTime = t - engine.value.startTime;
  
  let dt = t - lastFrameTime;
  lastFrameTime = t;

  // 델타 타임 제한 (스파이크 방지)
  if (dt > 0.1) dt = 0.1;
  if (dt < 0) dt = 0;

  engine.value.update(dt, trackTime);
  currentTrackTime.value = trackTime;

  // AI 클릭 소리 재생 (튜토리얼 모드에서만)
  if (engine.value.isAutoplay && props.tutorialMode) {
    if (engine.value.isHolding && !lastAiHolding) {
      playSfx(clickDownBuffer, 1.5);
    } else if (!engine.value.isHolding && lastAiHolding) {
      playSfx(clickUpBuffer, 1.0);
    }
    lastAiHolding = engine.value.isHolding;
  }
  
  score.value = engine.value.score;
  progress.value = engine.value.progress;
  isGravityInverted.value = engine.value.isGravityInverted;
  isMini.value = engine.value.isMini;
  
  if (engine.value.isDead) {
    if (props.invincible) {
      engine.value.isDead = false; // Revive
      engine.value.isPlaying = true; // Ensure keeps playing
      // Optional: Add visual feedback for hit even if invincible
    } else if (!gameOver.value) {
      handleGameOver();
    }
  } else if (!engine.value.isPlaying && isRunning.value && !gameOver.value && !victory.value) {

    // Game engine finished (reached end) and not dead -> Victory
    handleVictory();
  }

  // progress emission for multiplayer or tutorial
  if ((props.multiplayerMode || props.tutorialMode) && engine.value.totalLength > 0) {
    // Player progress
    const currentProgress = (engine.value.playerX / engine.value.totalLength) * 100;
    
    emit('progress-update', {
      progress: Math.min(100, currentProgress),
      y: engine.value.playerY,
      ghostProgress: props.opponentProgress || 0
    });

    // Interpolate opponent position
    const targetY = props.opponentY !== undefined ? props.opponentY : 360;
    const targetProg = props.opponentProgress || 0;
    
    // Smooth transition (Lerp)
    interpOpponentY.value += (targetY - interpOpponentY.value) * interpolationFactor;
    interpOpponentProgress.value += (targetProg - interpOpponentProgress.value) * interpolationFactor;
  }
};
const draw = () => {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx || !canvas.value) return;
  
  const w = canvas.value.width;
  const h = canvas.value.height;
  
  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#0a0a1a');
  bgGrad.addColorStop(0.5, '#151530');
  bgGrad.addColorStop(1, '#0a0a1a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);
  
  // Grid
  ctx.save();
  ctx.strokeStyle = 'rgba(80, 80, 180, 0.08)';
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
  
  // Camera transform
  ctx.save();
  ctx.translate(-engine.value.cameraX, 0);
  
  // Boundaries
  const topColor = engine.value.isGravityInverted ? '#ffff00' : '#ff00ff';
  const bottomColor = engine.value.isGravityInverted ? '#ffff00' : '#00ffff';
  
  ctx.fillStyle = topColor;
  ctx.globalAlpha = 0.15;
  ctx.fillRect(engine.value.cameraX, 0, w, engine.value.minY);
  ctx.globalAlpha = 1;
  
  ctx.fillStyle = bottomColor;
  ctx.globalAlpha = 0.15;
  ctx.fillRect(engine.value.cameraX, engine.value.maxY, w, h - engine.value.maxY);
  ctx.globalAlpha = 1;
  
  // Boundary lines
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
  
  // Draw portals
  engine.value.portals.forEach((portal: Portal) => {
    if (portal.x + portal.width < engine.value.cameraX - 50) return;
    if (portal.x > engine.value.cameraX + w + 50) return;
    
    ctx.save();
    
    // 전역 회전 지원
    if (portal.angle) {
      ctx.translate(portal.x + portal.width / 2, portal.y + portal.height / 2);
      ctx.rotate(portal.angle * Math.PI / 180);
      ctx.translate(-(portal.x + portal.width / 2), -(portal.y + portal.height / 2));
    }

    const color = engine.value.getPortalColor(portal.type);
    const symbol = engine.value.getPortalSymbol(portal.type);
    const isMiniPortal = portal.type === 'mini_pink' || portal.type === 'mini_green';
    
    ctx.globalAlpha = portal.activated ? 0.3 : 1.0;
    ctx.fillStyle = color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    
    if (isMiniPortal) {
      // 미니 포탈: 뾰족한 다이아몬드
      const cx = portal.x + portal.width / 2;
      const cy = portal.y + portal.height / 2;
      const rx = portal.width / 2;
      const ry = portal.height / 2;
      const spikes = 8;
      
      ctx.beginPath();
      for (let i = 0; i <= spikes * 2; i++) {
        const angle = (Math.PI * 2 * i) / (spikes * 2) - Math.PI / 2;
        const isOuter = i % 2 === 0;
        const radius = isOuter ? 1.0 : 0.6;
        const px = cx + Math.cos(angle) * rx * radius;
        const py = cy + Math.sin(angle) * ry * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      // 일반 포탈: 둥근 사각형
      ctx.beginPath();
      ctx.roundRect(portal.x, portal.y, portal.width, portal.height, 12);
      ctx.fill();
      
      // 내부 하이라이트
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.roundRect(portal.x + 6, portal.y + 6, portal.width - 12, portal.height - 12, 8);
      ctx.fill();
    }
    
    // 심볼 표시 (중앙에 하나)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.font = 'bold 18px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, portal.x + portal.width / 2, portal.y + portal.height / 2);
    
    ctx.restore();
  });
  
  // Draw obstacles
  engine.value.obstacles.forEach((obs: Obstacle) => {
    if (obs.x + obs.width < engine.value.cameraX - 50) return;
    if (obs.x > engine.value.cameraX + w + 50) return;
    
    ctx.save();
    drawObstacle(ctx, obs, obs.x, obs.y, currentTrackTime.value);
    ctx.restore();
  });


  
  // Draw AI Predicted Path (실선으로 이어지는 지그재그 경로)
  if (engine.value.isAutoplay && engine.value.aiPredictedPath.length > 1) {
    ctx.save();
    
    // 경로 그리기 (실선, 끊기지 않음)
    ctx.beginPath();
    ctx.moveTo(engine.value.aiPredictedPath[0].x, engine.value.aiPredictedPath[0].y);
    for (let i = 1; i < engine.value.aiPredictedPath.length; i++) {
      ctx.lineTo(engine.value.aiPredictedPath[i].x, engine.value.aiPredictedPath[i].y);
    }
    
    // 외곽 Glow (실선)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // 메인 선 (실선, 밝은 색)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.restore();
  }
  
  // Draw trail - 두꺼운 트레일
  if (engine.value.trail.length > 1) {
    ctx.beginPath();
    ctx.moveTo(engine.value.trail[0]!.x, engine.value.trail[0]!.y);
    
    for (let i = 1; i < engine.value.trail.length; i++) {
      const point = engine.value.trail[i];
      if (point) ctx.lineTo(point.x, point.y);
    }
    
    const trailColor = engine.value.isGravityInverted ? 
      'rgba(255, 255, 0, 0.6)' : 'rgba(0, 255, 255, 0.6)';
    ctx.strokeStyle = trailColor;
    ctx.lineWidth = 14;  // 훨씬 두껍게
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Optimization: Removed heavy shadow blur for trail
    // ctx.shadowBlur = 20;
    // ctx.shadowColor = engine.value.isGravityInverted ? '#ffff00' : '#00ffff';
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  
  // Draw Ghost (Opponent)
  if (props.multiplayerMode) {
    const oppProg = interpOpponentProgress.value;
    const ghostX = (oppProg / 100) * engine.value.totalLength;
    const ghostY = interpOpponentY.value;

    ctx.save();
    // 가상 플레이어 그리기 (멀티플레이어 상대방)
    ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff00ff';
    
    const size = 35;
    ctx.translate(ghostX, ghostY);
    
    // Draw a small wave shape for opponent
    ctx.beginPath();
    ctx.moveTo(size/2, 0);
    ctx.lineTo(-size/3, -size/3);
    ctx.lineTo(-size/6, 0);
    ctx.lineTo(-size/3, size/3);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('OPPONENT', 0, -30);
    ctx.restore();
  }
  
  // Draw particles
  engine.value.particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  
  ctx.globalAlpha = 1;

  // Draw Boss & Projectiles
  if (engine.value.boss.active) {
     const boss = engine.value.boss;
     // Boss Body
     ctx.save();
     ctx.translate(boss.x, boss.y);
     
     // Glow
     ctx.shadowBlur = 40;
     ctx.shadowColor = '#ff0000';
     
     // Main shape (Octagon-ish)
     ctx.fillStyle = '#440000';
     ctx.beginPath();
     const size = 60;
     for(let i=0; i<8; i++) {
        const theta = (Math.PI*2*i)/8;
        ctx.lineTo(Math.cos(theta)*size, Math.sin(theta)*size);
     }
     ctx.fill();
     
     // Eye
     ctx.fillStyle = '#ff0000';
     ctx.beginPath();
     ctx.arc(0, 0, 20, 0, Math.PI*2);
     ctx.fill();
     
     ctx.restore();
     
     // Projectiles
     boss.projectiles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffaa00';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
     });
  }

  // Draw checkpoints (hide during recording for clean output)
  if (props.practiceMode && !isRecording.value) {
    checkpoints.value.forEach((cp, idx) => {
      ctx.save();
      const cpSize = 15;
      const isLast = idx === checkpoints.value.length - 1;
      
      ctx.translate(cp.x, cp.y);
      
      // Diamond shape
      ctx.beginPath();
      ctx.moveTo(0, -cpSize);
      ctx.lineTo(cpSize, 0);
      ctx.lineTo(0, cpSize);
      ctx.lineTo(-cpSize, 0);
      ctx.closePath();
      
      if (isLast) {
        ctx.fillStyle = '#00ff00';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff00';
      } else {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
      }
      
      ctx.fill();
      
      // Outline
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.restore();
    });
  }
  
  // Draw player - 작은 웨이브
  const px = engine.value.playerX;
  const py = engine.value.playerY;
  const size = engine.value.playerSize;
  
  const direction = engine.value.isHolding ? -1 : 1;
  const gravityDir = engine.value.isGravityInverted ? -direction : direction;
  const angle = Math.atan2(gravityDir, 1);
  
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(angle);
  
  const playerColor = engine.value.isGravityInverted ? '#ffff00' : 
                      (engine.value.isHolding ? '#00ffff' : '#ff00ff');
  ctx.shadowBlur = 25;
  ctx.shadowColor = playerColor;
  
  const waveSize = size * 1.2;  // 더 작게
  
  // Wave shape
  ctx.beginPath();
  ctx.moveTo(waveSize, 0);
  ctx.lineTo(-waveSize * 0.5, -waveSize * 0.6);
  ctx.lineTo(-waveSize * 0.15, 0);
  ctx.lineTo(-waveSize * 0.5, waveSize * 0.6);
  ctx.closePath();
  
  const gradient = ctx.createLinearGradient(-waveSize, 0, waveSize, 0);
  gradient.addColorStop(0, playerColor);
  gradient.addColorStop(0.5, '#ffffff');
  gradient.addColorStop(1, playerColor);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  ctx.restore();
  ctx.shadowBlur = 0;
  
  // 히트박스 모드일 때 히트박스 표시
  if (engine.value.showHitboxes) {
    // 플레이어 히트박스
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(px - size, py - size, size * 2, size * 2);
    
    // 장애물 히트박스 (이동/회전 오브젝트는 실시간 위치 반영)
    ctx.strokeStyle = '#ff0000';
    engine.value.obstacles.forEach((obs: Obstacle) => {
      if (obs.x + obs.width < engine.value.cameraX - 50) return;
      if (obs.x > engine.value.cameraX + w + 100) return;
      
      // 이동/회전 오브젝트의 경우 실시간 상태 가져오기
      const state = engine.value.getObstacleStateAt(obs, currentTrackTime.value);
      const obsY = state.y;
      const obsAngle = state.angle || 0;
      
      ctx.save();
      
      // Apply transform to center
      ctx.translate(obs.x + obs.width / 2, obsY + obs.height / 2);
      if (obsAngle !== 0) ctx.rotate(obsAngle * Math.PI / 180);

      const hw = obs.width / 2;
      const hh = obs.height / 2;
      
      if (obs.type === 'slope') {
         ctx.beginPath();
         if (obsAngle > 0) {
            // TL triangle ◤
            ctx.moveTo(-hw, hh); // BL
            ctx.lineTo(hw, -hh); // TR
            ctx.lineTo(-hw, -hh); // TL
         } else {
            // TR triangle ◥
            ctx.moveTo(hw, hh); // BR
            ctx.lineTo(-hw, -hh); // TL
            ctx.lineTo(hw, -hh); // TR
         }
         ctx.closePath();
         ctx.stroke();
      } else if (obs.type === 'triangle' || obs.type === 'steep_triangle') {
         // ◢
         ctx.beginPath();
         ctx.moveTo(-hw, hh); // BL
         ctx.lineTo(hw, hh); // BR
         ctx.lineTo(hw, -hh); // TR
         ctx.closePath();
         ctx.stroke();
      } else if (obs.type === 'spike' || obs.type === 'mini_spike') {
         const isBottom = obs.y > 360; // Center is 360 usually
         ctx.beginPath();
         if (isBottom) {
            // Up pointing: BL -> TC -> BR
            ctx.moveTo(-hw, hh);
            ctx.lineTo(0, -hh);
            ctx.lineTo(hw, hh);
         } else {
            // Down pointing: TL -> BC -> TR
            ctx.moveTo(-hw, -hh);
            ctx.lineTo(0, hh);
            ctx.lineTo(hw, -hh);
         }
         ctx.closePath();
         ctx.stroke();
      } else if (obs.type === 'planet' || obs.type === 'star') {
         // Planet/Star Body (Circle)
         ctx.beginPath();
         ctx.arc(0, 0, hw, 0, Math.PI * 2);
         ctx.stroke();

         // Orbiting Moons (Logic synchronized with GameEngine collision check)
         const time = currentTrackTime.value;
         const hasChildren = obs.children && obs.children.length > 0;
         
         if (hasChildren) {
             const children = obs.children!;
             const speed = obs.customData?.orbitSpeed ?? 1.0;
             children.forEach((child, i) => {
                const theta = time * speed + (i * ((Math.PI * 2) / children.length));
                const dist = obs.customData?.orbitDistance ?? (obs.width * 0.85);
                const cx = Math.cos(theta) * dist;
                const cy = Math.sin(theta) * dist;
                const childSize = child.width ? child.width / 2 : 14;
                
                ctx.beginPath();
                ctx.arc(cx, cy, childSize, 0, Math.PI*2);
                ctx.stroke();

                // Moon's moons (Sub-orbit)
                if (child.type === 'planet') {
                    const moonCount = child.customData?.orbitCount ?? 2;
                    const moonSpeed = child.customData?.orbitSpeed ?? 2.0;
                    const moonDist = child.customData?.orbitDistance ?? (child.width * 0.8);
                    for(let j=0; j<moonCount; j++) {
                        const mTheta = time * moonSpeed + (j * ((Math.PI * 2) / moonCount));
                        const mx = cx + Math.cos(mTheta) * moonDist;
                        const my = cy + Math.sin(mTheta) * moonDist;
                        const mSize = 8;
                        ctx.beginPath();
                        ctx.arc(mx, my, mSize, 0, Math.PI*2);
                        ctx.stroke(); 
                    }
                }
             });
         } else {
             // Fallback for generated orbits
             const count = obs.customData?.orbitCount ?? (obs.type === 'star' ? 0 : 2);
             if (count > 0) {
                 const speed = obs.customData?.orbitSpeed ?? 1.0;
                 const dist = obs.customData?.orbitDistance ?? (obs.width * 0.8);
                 for(let i=0; i<count; i++) {
                     const theta = time * speed + (i * ((Math.PI * 2) / count));
                     const cx = Math.cos(theta) * dist;
                     const cy = Math.sin(theta) * dist;
                     const moonRadius = obs.type === 'star' ? 20 : 10;
                     ctx.beginPath();
                     ctx.arc(cx, cy, moonRadius, 0, Math.PI*2);
                     ctx.stroke();
                 }
             }
         }
      } else if (obs.type === 'saw' || obs.type === 'spike_ball' || obs.type === 'mine' || obs.type === 'orb') {
         ctx.beginPath();
         ctx.arc(0, 0, hw, 0, Math.PI * 2);
         ctx.stroke();
      } else if (obs.type === 'laser' || obs.type === 'v_laser') {
          // Keep as rect for lasers for now
          ctx.strokeRect(-hw, -hh, obs.width, obs.height);
      } else {
         // Default Rect
         ctx.strokeRect(-hw, -hh, obs.width, obs.height);
      }
      
      ctx.restore();
    });
  }
  
  ctx.restore(); // Camera transform restore

  // 결과 화면 Canvas에 직접 그리기 (녹화용) -> HTML Overlay와 중복되므로 텍스트 제거하고 배경만 어둡게 처리
  if (victory.value) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  } else if (gameOver.value) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  // Beat Highlight Overlay
  if (engine.value.isMeasureHighlight) {
     ctx.save();
     ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; // Subtle white flash
     ctx.globalCompositeOperation = 'screen';
     ctx.fillRect(0, 0, w, h);
     ctx.restore();
  }
};

const handleVisibilityChange = () => {
  if (document.hidden && isRunning.value) {
    // 탭이 숨겨지면 게임 오버 처리 (백그라운드에서 죽지 않는 꼼수 방지)
    // 또는 그냥 일시정지 기능을 넣을 수 있지만, 현재 시스템상 죽게 하거나 멈춤
    if (audioSource) {
      try { audioSource.stop(); } catch(e){}
    }
    isRunning.value = false;
    gameOver.value = true;
    failReason.value = '포커스 이탈로 중단됨';
  }
};

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      handleInputDown(e);
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      handleInputUp(e);
    }
  });
  
  window.addEventListener('mousedown', handleInputDown);
  window.addEventListener('mouseup', handleInputUp);
  window.addEventListener('touchstart', handleInputDown, { passive: false });
  window.addEventListener('touchend', handleInputUp, { passive: false });
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  startGame();
});

onUnmounted(() => {
  stopGame();
  window.removeEventListener('mousedown', handleInputDown);
  window.removeEventListener('mouseup', handleInputUp);
  window.removeEventListener('touchstart', handleInputDown);
  window.removeEventListener('touchend', handleInputUp);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

watch(() => props.audioBuffer, () => {
  stopGame();
  startGame();
});
</script>

<style scoped>
.game-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 177.78vh; /* 16:9 비율 유지 (100 * 16/9) */
  max-height: 56.25vw; /* 16:9 비율 유지 (100 * 9/16) */
  display: flex;
  justify-content: center;
  align-items: center;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
  background: #050510;
  box-shadow: 0 0 100px rgba(0, 0, 0, 0.8);
  image-rendering: high-quality;
}

.hud {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.hud-top-left {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wave-icon {
  font-size: 1.6rem;
  color: #00ffff;
  text-shadow: 0 0 15px #00ffff;
  transition: color 0.3s, text-shadow 0.3s;
}

.wave-icon.inverted {
  color: #ffff00;
  text-shadow: 0 0 15px #ffff00;
}

.game-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.4rem;
  font-weight: 900;
  color: #fff;
  margin: 0;
  letter-spacing: 2px;
}

.progress-bar-container {
  width: 100%;
  height: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  transition: width 0.1s linear;
}

.progress-text {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.6rem;
  font-weight: bold;
  color: white;
}

.best-record-marker {
  position: absolute;
  top: 0;
  height: 100%;
  width: 2px;
  pointer-events: none;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-line {
  width: 100%;
  height: 100%;
  background: #fff;
  box-shadow: 0 0 5px #fff;
}

.marker-text {
  position: absolute;
  top: -14px;
  font-size: 0.5rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 5px rgba(0,0,0,0.8);
  white-space: nowrap;
}

.score-container {
  position: absolute;
  top: 20px;
  right: 40px;
  text-align: right;
  font-family: 'Outfit', sans-serif;
  color: white;
}

.score-label {
  font-size: 0.7rem;
  color: #888;
  letter-spacing: 2px;
}

.score-val {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(to right, #00ffff, #ff00ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.speed-indicator {
  position: absolute;
  top: 70px;
  right: 40px;
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.mini-badge {
  background: linear-gradient(135deg, #ff66cc 0%, #ff99dd 100%);
  color: #000;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 1px;
  animation: miniPulse 0.5s ease-in-out infinite;
}

@keyframes miniPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.difficulty-settings {
  position: absolute;
  bottom: 60px;
  left: 20px;
  background: rgba(0, 0, 0, 0.6);
  padding: 15px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 200px;
  z-index: 20;
}

.diff-label {
  color: #fff;
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 1px;
}

.diff-slider {
  width: 100%;
  cursor: pointer;
}

.controls-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  font-family: 'Outfit', sans-serif;
  text-align: center;
}

.tutorial-message-bubble {
  background: rgba(255, 0, 255, 0.2);
  border: 2px solid #ff00ff;
  color: #fff;
  padding: 10px 30px;
  border-radius: 50px;
  font-size: 1.5rem;
  font-weight: 900;
  text-shadow: 0 0 10px #ff00ff;
  box-shadow: 0 0 30px rgba(255, 0, 255, 0.4);
  animation: messagePulse 1s infinite alternate;
  white-space: nowrap;
}

@keyframes messagePulse {
  from { transform: scale(1); box-shadow: 0 0 20px rgba(255, 0, 255, 0.4); }
  to { transform: scale(1.05); box-shadow: 0 0 40px rgba(255, 0, 255, 0.6); }
}

.overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10px;
  pointer-events: none;
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.game-over-box {
  background: rgba(10, 10, 26, 0.95);
  color: white;
  padding: 1rem 1.8rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 0 40px rgba(255, 0, 100, 0.3);
  border: 1px solid rgba(255, 0, 255, 0.2);
  pointer-events: auto;
  transform: scale(0.9);
}

.game-over-box.victory {
  box-shadow: 0 0 50px rgba(0, 255, 255, 0.5);
  border-color: rgba(0, 255, 255, 0.3);
}

.fail-text {
  font-size: 1.8rem;
  font-weight: 900;
  color: #ff0066;
  margin: 0;
  text-shadow: 0 0 20px #ff0066;
}

.win-text {
  font-size: 1.8rem;
  font-weight: 900;
  color: #00ffaa;
  margin: 0;
  text-shadow: 0 0 20px #00ffaa;
}

.fail-sub, .win-sub {
  color: #888;
  margin-bottom: 0.8rem;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 1px;
}

.stats-grid {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-val {
  font-size: 1.6rem;
  font-weight: 900;
  color: #fff;
}

.stat-label {
  font-size: 0.65rem;
  color: #666;
  letter-spacing: 2px;
}

.attempts-info {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

button {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  font-weight: 900;
  background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
  color: #000;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  border-radius: 8px;
}

button:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 30px rgba(255, 0, 255, 0.5);
}

button.secondary {
  background: transparent;
  border: 2px solid #666;
  color: #888;
}

button.secondary:hover {
  background: #333;
  color: #fff;
  border-color: #888;
  box-shadow: none;
}

/* New HUD Button Styles */
.game-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
  pointer-events: auto;
}

.hud-action-btn {
  padding: 6px 16px;
  font-size: 0.75rem;
  font-weight: 900;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.2s;
}

.hud-action-btn.tutorial {
  background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
  color: #000;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.hud-action-btn.save {
  background: #00ffaa;
  color: #000;
  box-shadow: 0 0 10px rgba(0, 255, 170, 0.3);
}

.hud-action-btn.save:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 255, 170, 0.5);
}

.hud-action-btn.exit {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.hud-action-btn.exit:hover {
  background: rgba(255, 0, 0, 0.2);
  color: #ff4444;
  border-color: #ff4444;
}

.hud-action-btn.mode-change {
  background: rgba(255, 255, 255, 0.1); 
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hud-action-btn.mode-change:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: #fff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.hud-action-btn.ghost-toggle {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 5px;
}

.hud-action-btn.ghost-toggle.active {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}

.hud-action-btn.ghost-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

/* Simplified Status Overlays */
.status-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
  pointer-events: none;
  z-index: 100;
  animation: statusFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes statusFadeIn {
  from { opacity: 0; transform: translate(-50%, -40%); filter: blur(10px); }
  to { opacity: 1; transform: translate(-50%, -50%); filter: blur(0); }
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto;
}

.status-text {
  font-size: 5rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: 15px;
  font-family: 'Outfit', sans-serif;
}

.status-text.fail {
  color: #ff0066;
  text-shadow: 0 0 30px rgba(255, 0, 106, 0.5), 0 0 60px rgba(255, 0, 106, 0.2);
}

.status-text.win {
  color: #00ffaa;
  text-shadow: 0 0 30px rgba(0, 255, 170, 0.5), 0 0 60px rgba(0, 255, 170, 0.2);
}

.status-sub {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 300;
  letter-spacing: 5px;
  text-transform: uppercase;
}

.status-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 2px;
}

.stat-divider {
  opacity: 0.3;
}

.new-best-text {
  font-size: 1.5rem;
  font-weight: 900;
  color: #ffaa00;
  text-shadow: 0 0 20px rgba(255, 170, 0, 0.8), 0 0 40px rgba(255, 170, 0, 0.4);
  letter-spacing: 3px;
  animation: newBestPulse 0.5s ease-out;
}

@keyframes newBestPulse {
  0% { transform: scale(1.5); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.rating-vote {
  margin-top: 30px;
  background: rgba(0, 0, 0, 0.4);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 170, 0.2);
  display: inline-block;
  align-self: center;
  backdrop-filter: blur(10px);
}

.rating-label {
  font-size: 0.8rem;
  color: #00ffaa;
  margin-bottom: 15px;
  letter-spacing: 2px;
  font-weight: 700;
}

.rating-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.rating-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
}

.rating-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #00ffaa;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 255, 170, 0.5);
}

.rating-value {
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  min-width: 40px;
}

.submit-rating-btn {
  background: #00ffaa;
  color: #000;
  border: none;
  padding: 8px 24px;
  border-radius: 4px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-rating-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 255, 170, 0.4);
}

.rating-done {
  margin-top: 20px;
  color: #00ffaa;
  font-weight: 900;
  letter-spacing: 2px;
}

.pointer-events-auto {
  pointer-events: auto !important;
}


.countdown-overlay {
  background: rgba(0,0,0,0.5);
  z-index: 999;
}

.countdown-text {
  font-size: 10rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 0 50px #00ffff, 0 0 100px #ff00ff;
  animation: countdownPulse 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes countdownPulse {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.computing-overlay {
  background: rgba(0,0,0,0.85);
  z-index: 1000;
}

.computing-box {
  text-align: center;
  color: white;
}

.computing-text {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #00ffff;
  text-shadow: 0 0 10px #00ffff;
}

.computing-progress-track {
  width: 300px;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.computing-progress-fill {
  height: 100%;
  background: #00ffff;
  width: 0%; /* Animate this */
  box-shadow: 0 0 10px #00ffff;
  transition: width 0.1s linear;
  animation: progressPulse 1s infinite alternate;
}

@keyframes progressPulse {
  from { opacity: 0.7; }
  to { opacity: 1; }
}

@keyframes pulseCount {
  from { transform: scale(1); opacity: 0.8; }
  to { transform: scale(1.1); opacity: 1; }
}

.autoplay-badge {
  background: linear-gradient(135deg, #00ffff 0%, #4488ff 100%);
  color: #000;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 1px;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
  animation: pulseCount 0.5s ease-in-out infinite alternate;
  margin-top: 5px;
}

.tutorial-btn {
  background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
  color: #000;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 5px;
}

.tutorial-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 25px rgba(255, 0, 255, 0.5);
}

.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.validation-status {
  position: absolute;
  top: 100px;
  left: 20px;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 100;
  animation: slideIn 0.3s ease-out;
}

.status-msg {
  font-size: 0.7rem;
  font-weight: 700;
  color: #00ffff;
  letter-spacing: 1px;
}

.mini-progress {
  width: 120px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.mini-progress .fill {
  height: 100%;
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  transition: width 0.3s ease-out;
}

.hud-action-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
}

@keyframes slideIn {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.hud-action-btn.checkpoint {
  background: rgba(255, 255, 0, 0.2);
  color: #ffff00;
  border: 1px solid rgba(255, 255, 0, 0.5);
}

.autoplay-badge.practice {
  background: rgba(255, 255, 0, 0.2);
  color: #ffff00;
  border: 1px solid #ffff00;
}

.autoplay-badge.tutorial {
  background: rgba(255, 0, 255, 0.2);
  color: #ff00ff;
  border: 1px solid #ff00ff;
}

.game-title.tutorial {
  background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.checkpoint-indicator {
  position: absolute;
  top: 80px;
  right: 20px;
  background: rgba(0, 0, 0, 0.5);
  color: #00ff00;
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
  border: 1px solid #00ff00;
  animation: pulse 2s infinite;
}

/* Video Save Section */
.video-save-section {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.save-video-btn {
  padding: 12px 30px;
  background: linear-gradient(135deg, #ff6b00, #ff0066);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  pointer-events: auto;
}

.save-video-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 100, 0, 0.5);
}

.save-video-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-success {
  color: #00ff88;
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
}

.save-hint {
  color: #888;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}
</style>

