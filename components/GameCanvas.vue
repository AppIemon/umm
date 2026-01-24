<template>
  <div class="game-wrapper">
    <!-- 16:9 고정 비율을 유지하면서 화면에 꽉 차는 컨테이너 -->
    <div class="game-container">
      <canvas ref="canvas" width="1280" height="720"></canvas>
      
      <div class="hud">
        <div class="hud-top-left">
          <div class="game-actions">
            <button 
              v-if="!multiplayerMode" 
              @click="startAutoplay" 
              class="hud-action-btn tutorial"
              :disabled="!isMapValidated"
              :class="{ disabled: !isMapValidated }"
            >
              {{ isMapValidated ? 'TUTORIAL' : 'VALIDATING...' }}
            </button>
            <button 
              v-if="!multiplayerMode && !loadMap && isMapValidated && !hasSaved" 
              @click="manualSave" 
              class="hud-action-btn save"
            >
              SAVE MAP
            </button>
            <button @click="emit('exit', { progress: progressPct, score: score, outcome: gameOver ? 'fail' : 'win' })" class="hud-action-btn exit">나가기</button>
          </div>
          <div class="title-container">
            <div class="wave-icon" :class="{ inverted: isGravityInverted }">▶</div>
            <h1 class="game-title">ULTRA MUSIC MANIA</h1>
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
          <span v-if="isAutoplayUI" class="autoplay-badge">TUTORIAL MODE</span>
        </div>

        
        <div v-if="gameOver" class="status-overlay fail">
          <div class="status-content">
            <h1 class="status-text fail">CRASHED</h1>
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
        
        <div class="controls-hint" v-if="!countdown && !gameOver && !victory && !isComputingPath">
          <span>클릭/스페이스 유지 = 위로 | 해제 = 아래로</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { GameEngine, type Obstacle, type Portal } from '@/utils/game-engine';

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

const bestProgress = computed(() => {
  if (props.loadMap?.bestScore) {
    // Score is progress * 10, so progress = score / 10
    return Math.min(100, props.loadMap.bestScore / 10);
  }
  return 0;
});

const startGame = () => {
  if (!props.audioBuffer || !canvas.value) return;
  
  stopGame();

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
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
  } else {
    engine.value.generateMap(props.obstacles, props.sections, props.audioBuffer.duration, undefined, false);
    validateMapInBackground();
  }
  
  gameOver.value = false;
  victory.value = false;
  failReason.value = '';
  progressPct.value = 0;
  progress.value = 0;
  score.value = 0;
  isGravityInverted.value = false;
  
  // UI 즉시 리셋 (재시작 시 잔상 제거)
  emit('progress-update', { progress: 0, ghostProgress: 0 });
  
  draw();
  startCountdown();
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

const validateMapInBackground = async () => {
  if (props.multiplayerMode) return;
  
  // 이미 검증된 경로가 있으면 건너뜜
  if (engine.value.autoplayLog.length > 0) {
    isMapValidated.value = true;
    return;
  }

  isMapValidated.value = false;
  // 불필요한 UI 노출 방지: 이미 로그가 있으면 리턴(상단에서 체크됨), 없으면 연산 시작
  isComputingPath.value = true;
  computingProgress.value = 0;

  for (let retry = 0; ; retry++) {
    try {
      if (retry > 0) {
        console.log(`[Validation] Retry ${retry + 1}: Regenerating map with updated offsets...`);
        // 더 넓은 간격으로 맵 다시 생성
        engine.value.generateMap(props.obstacles, props.sections, props.audioBuffer.duration, undefined, false, retry);
      }

      const success = await engine.value.computeAutoplayLogAsync(engine.value.playerX, engine.value.playerY, (p) => {
        computingProgress.value = p * 100;
      });
      
      if (success) {
        console.log(`[Validation] Path found on Attempt ${retry + 1}!`);
        isMapValidated.value = true;
        // emitMapData(); // 이제 자동으로 저장하지 않음
        break;
      } else if (retry > 100) {
        console.error("[Validation] Safeguard triggered: Stopped after 100 failed retries.");
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
  let count = 3;
  countdown.value = '3';
  
  const timer = setInterval(() => {
    count--;
    if (count > 0) {
      countdown.value = count.toString();
    } else if (count === 0) {
      countdown.value = 'GO!';
    } else {
      clearInterval(timer);
      countdown.value = null;
      runGame();
    }
  }, 500);
};

const runGame = () => {
  if (!audioCtx || !props.audioBuffer) return;
  
  audioSource = audioCtx.createBufferSource();
  audioSource.buffer = props.audioBuffer;
  audioSource.connect(audioCtx.destination);
  
  audioSource.onended = () => {
    if (!gameOver.value && isRunning.value) {
      victory.value = true;
      isRunning.value = false;
      emit('record-update', { score: score.value, progress: 100 });
    }
  };

  const startTime = audioCtx.currentTime + 0.05; 
  audioSource.start(startTime);
  
  engine.value.isPlaying = true;
  engine.value.startTime = startTime;
  
  isRunning.value = true;
  lastFrameTime = audioCtx.currentTime;
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
  if (e) e.preventDefault();
  if (!isRunning.value || engine.value.isAutoplay) return;
  engine.value.setHolding(true);
};

const handleInputUp = (e?: Event) => {
  if (e) e.preventDefault();
  if (engine.value.isAutoplay) return;
  engine.value.setHolding(false);
};

const handleGameOver = () => {
  gameOver.value = true;
  failReason.value = engine.value.failReason || 'CRASHED';
  progressPct.value = engine.value.getProgress();
  isRunning.value = false;
  if (audioSource) {
    try { audioSource.stop(); } catch(e){}
  }
  
  emit('record-update', { score: score.value, progress: progress.value });
  
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
      startGame();
    }
  }, 3000);
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
  
  score.value = engine.value.score;
  progress.value = engine.value.progress;
  isGravityInverted.value = engine.value.isGravityInverted;
  isMini.value = engine.value.isMini;
  
  if (engine.value.isDead && !gameOver.value) {
    handleGameOver();
  }

  // progress emission for multiplayer
  if (props.multiplayerMode && engine.value.totalLength > 0) {
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
    const color = engine.value.getPortalColor(portal.type);
    const symbol = engine.value.getPortalSymbol(portal.type);
    const isMiniPortal = portal.type === 'mini_pink' || portal.type === 'mini_green';
    
    ctx.globalAlpha = portal.activated ? 0.3 : 1.0;
    ctx.fillStyle = color;
    ctx.shadowBlur = 25;
    ctx.shadowColor = color;
    
    if (isMiniPortal) {
      // 뾰족뾰족한 다이아몬드 모양으로 그리기
      const cx = portal.x + portal.width / 2;
      const cy = portal.y + portal.height / 2;
      const rx = portal.width / 2;
      const ry = portal.height / 2;
      const spikes = 8;  // 뾰족한 점 개수
      
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
      
      // 내부 하이라이트
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      for (let i = 0; i <= spikes * 2; i++) {
        const angle = (Math.PI * 2 * i) / (spikes * 2) - Math.PI / 2;
        const isOuter = i % 2 === 0;
        const radius = isOuter ? 0.6 : 0.35;
        const px = cx + Math.cos(angle) * rx * radius;
        const py = cy + Math.sin(angle) * ry * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      // 일반 포탈 - 둥근 사각형
      ctx.beginPath();
      ctx.roundRect(portal.x, portal.y, portal.width, portal.height, 12);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.roundRect(portal.x + 6, portal.y + 6, portal.width - 12, portal.height - 12, 8);
      ctx.fill();
    }
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.font = 'bold 18px Arial';
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
    
    if (obs.type === 'spike' || obs.type === 'mini_spike') {
      const isMini = obs.type === 'mini_spike';
      ctx.fillStyle = isMini ? '#ff6666' : '#ff4444';
      ctx.shadowBlur = isMini ? 8 : 12;
      ctx.shadowColor = '#ff4444';
      
      ctx.beginPath();
      if (obs.y > 300) {
        // 바닥 가시 (위를 가리킴)
        ctx.moveTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
      } else {
        // 천장 가시 (아래를 가리킴)
        ctx.moveTo(obs.x, obs.y);
        ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width, obs.y);
      }
      ctx.closePath();
      ctx.fill();
      
    } else if (obs.type === 'block') {
      ctx.save();
      const hasAngle = obs.angle !== undefined && obs.angle !== 0;
      if (hasAngle) {
        ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
        ctx.rotate(obs.angle! * Math.PI / 180);
        ctx.translate(-(obs.x + obs.width / 2), -(obs.y + obs.height / 2));
      }

      ctx.fillStyle = '#444';
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#666';
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      
      ctx.fillStyle = '#555';
      ctx.fillRect(obs.x + 2, obs.y + 2, obs.width - 4, obs.height - 4);
      ctx.restore();
      
    } else if (obs.type === 'saw') {
      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      const radius = obs.width / 2;
      
      ctx.fillStyle = '#ffaa00';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffaa00';
      
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Teeth
      ctx.fillStyle = '#ff6600';
      const teeth = 10;
      const time = currentTrackTime.value * 8;
      for (let i = 0; i < teeth; i++) {
        const angle = (Math.PI * 2 * i / teeth) + time;
        const tx = cx + Math.cos(angle) * radius * 0.75;
        const ty = cy + Math.sin(angle) * radius * 0.75;
        ctx.beginPath();
        ctx.arc(tx, ty, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.fillStyle = '#cc8800';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
    } else if (obs.type === 'spike_ball') {
      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      const radius = obs.width / 2;
      
      ctx.fillStyle = '#666';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#444';
      
      // Spikes
      const spikes = 8;
      const rotation = currentTrackTime.value * 3;
      ctx.fillStyle = '#444';
      for (let i = 0; i < spikes; i++) {
        const angle = (Math.PI * 2 * i / spikes) + rotation;
        ctx.beginPath();
        const tx = cx + Math.cos(angle) * radius * 1.2;
        const ty = cy + Math.sin(angle) * radius * 1.2;
        ctx.moveTo(cx + Math.cos(angle - 0.2) * radius * 0.8, cy + Math.sin(angle - 0.2) * radius * 0.8);
        ctx.lineTo(tx, ty);
        ctx.lineTo(cx + Math.cos(angle + 0.2) * radius * 0.8, cy + Math.sin(angle + 0.2) * radius * 0.8);
        ctx.fill();
      }
      
      // Main ball
      const grad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      grad.addColorStop(0, '#888');
      grad.addColorStop(1, '#222');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
      ctx.fill();
      
    } else if (obs.type === 'laser') {
      const centerY = obs.y + obs.height / 2;
      const glow = Math.sin(currentTrackTime.value * 15) * 5 + 10;
      
      ctx.strokeStyle = '#ff3333';
      ctx.lineWidth = 2;
      ctx.shadowBlur = Math.max(0, glow);
      ctx.shadowColor = '#ff0000';
      
      ctx.beginPath();
      ctx.moveTo(obs.x, centerY);
      ctx.lineTo(obs.x + obs.width, centerY);
      ctx.stroke();
      
      // Laser core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(obs.x, centerY);
      ctx.lineTo(obs.x + obs.width, centerY);
      ctx.stroke();

      // Side brackets
      ctx.fillStyle = '#777';
      ctx.fillRect(obs.x, obs.y, 8, obs.height);
      ctx.fillRect(obs.x + obs.width - 8, obs.y, 8, obs.height);
    } else if (obs.type === 'v_laser') {
      const centerX = obs.x + obs.width / 2;
      const glow = Math.sin(currentTrackTime.value * 15) * 5 + 10;
      
      ctx.strokeStyle = '#ff3333';
      ctx.lineWidth = 2;
      ctx.shadowBlur = Math.max(0, glow);
      ctx.shadowColor = '#ff0000';
      
      ctx.beginPath();
      ctx.moveTo(centerX, obs.y);
      ctx.lineTo(centerX, obs.y + obs.height);
      ctx.stroke();
      
      // Laser core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(centerX, obs.y);
      ctx.lineTo(centerX, obs.y + obs.height);
      ctx.stroke();

      // Top/Bottom brackets
      ctx.fillStyle = '#777';
      ctx.fillRect(obs.x, obs.y, obs.width, 8);
      ctx.fillRect(obs.x, obs.y + obs.height - 8, obs.width, 8);

    } else if (obs.type === 'mine') {
      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      const radius = obs.width / 2;
      
      const pulse = Math.sin(currentTrackTime.value * 10) * 0.1 + 0.9;
      
      ctx.fillStyle = '#ff3333';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff0000';
      
      ctx.beginPath();
      // Hexagon shape for mine
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + currentTrackTime.value * 2;
        const x = cx + Math.cos(angle) * radius * pulse;
        const y = cy + Math.sin(angle) * radius * pulse;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      
      // Inner detail
      ctx.fillStyle = '#550000';
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();

    } else if (obs.type === 'orb') {
      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      const radius = obs.width / 2;
      
      const pulse = Math.sin(currentTrackTime.value * 5) * 0.1 + 1.0;

      const grad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * pulse);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.4, '#aa44ff'); // Purple
      grad.addColorStop(0.8, '#4400cc');
      grad.addColorStop(1, 'rgba(68, 0, 204, 0)');
      
      ctx.fillStyle = grad;
      ctx.globalCompositeOperation = 'lighter'; // Additive blending for glow
      ctx.beginPath();
      ctx.arc(cx, cy, radius * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; // Reset
    }

    
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
    ctx.shadowBlur = 20;
    ctx.shadowColor = engine.value.isGravityInverted ? '#ffff00' : '#00ffff';
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
    
    // 장애물 히트박스
    ctx.strokeStyle = '#ff0000';
    engine.value.obstacles.forEach((obs: Obstacle) => {
      if (obs.x + obs.width < engine.value.cameraX - 50) return;
      if (obs.x > engine.value.cameraX + w + 100) return;
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    });
  }
  
  ctx.restore(); // Camera transform restore
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
</style>
