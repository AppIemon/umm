<template>
  <div class="multi-container">
    <div class="background-anim"></div>
    
    <!-- Mode Selection Screen -->
    <div v-if="step === 'MODESELECT'" class="setup-screen glass-panel">
      <h1 class="glow-text">BATTLE CATEGORY</h1>
      <div class="mode-grid">
        <div class="mode-card" @click="startMatchmaking('3m')">
          <div class="mode-icon">⚡</div>
          <h3>SPRINT</h3>
          <p>3 MINUTE MATCH</p>
        </div>
        <div class="mode-card" @click="startMatchmaking('10m')">
          <div class="mode-icon">⚔️</div>
          <h3>STANDARD</h3>
          <p>10 MINUTE MATCH</p>
        </div>
        <div class="mode-card" @click="startMatchmaking('1h')">
          <div class="mode-icon">🌌</div>
          <h3>ENDURANCE</h3>
          <p>1 HOUR MATCH</p>
        </div>
      </div>
      <button @click="exitGame" class="back-btn-simple">BACK TO MENU</button>
    </div>

    <!-- Matchmaking Screen -->
    <div v-else-if="step === 'MATCHMAKING'" class="setup-screen glass-panel">
      <div class="matchmaking-box">
        <h1 class="glow-text">SEARCHING_OPPONENT</h1>
        <div class="category-badge">{{ selectedCategory }} CLASS</div>
        <div class="radar">
          <div class="radar-line"></div>
          <div class="pings">
            <div class="ping" style="top:20%; left:30%"></div>
            <div class="ping" style="top:70%; left:80%"></div>
          </div>
        </div>
        <p class="status-msg">{{ matchStatus }}</p>
        <button @click="step = 'MODESELECT'" class="cancel-btn">CANCEL</button>
      </div>
    </div>

    <!-- Match Found / Map Selection -->
    <div v-else-if="step === 'READY'" class="setup-screen glass-panel">
      <div class="ready-box">
        <div class="vs-header">
          <div class="player-info">
            <div class="avatar">◆</div>
            <span>{{ user?.username || 'GUEST' }}</span>
          </div>
          <div class="vs-badge">VS</div>
          <div class="player-info">
            <div class="avatar opponent">◇</div>
            <span>{{ opponentName }}</span>
          </div>
        </div>
        
        <div class="selected-map" v-if="selectedMap">
          <h2 class="map-label">SELECTED_MAP</h2>
          <h1 class="map-name">{{ selectedMap.title }}</h1>
          <p class="map-meta">DIFF: {{ selectedMap.difficulty }} | BY: {{ selectedMap.creatorName }}</p>
        </div>

        <button @click="startGame" class="battle-btn">BATTLE START</button>
      </div>
    </div>

    <!-- Result Screen -->
    <div v-else-if="step === 'RESULT'" class="setup-screen glass-panel">
      <div class="result-box">
        <h1 class="victory-text" :class="{ loss: winner === 'opponent', draw: winner === 'draw' }">
          {{ winner === 'player' ? 'VICTORY' : (winner === 'opponent' ? 'DEFEAT' : 'DRAW') }}
        </h1>
        <div class="duel-res">
          <div class="res-item">
            <span>{{ user?.username || 'YOU' }}</span>
            <div class="prog-bar"><div class="fill" :style="{ width: results.p1 + '%' }"></div></div>
            <span>{{ results.p1.toFixed(1) }}%</span>
          </div>
          <div class="res-item">
            <span>{{ opponentName }}</span>
            <div class="prog-bar"><div class="fill enemy" :style="{ width: results.p2 + '%' }"></div></div>
            <span>{{ results.p2.toFixed(1) }}%</span>
          </div>
        </div>
        <div class="match-meta" v-if="timeRemaining <= 0">
          <span class="timeout-badge">TIME OUT RESULT</span>
        </div>
        <button @click="step = 'MODESELECT'" class="action-btn">REMATCH</button>
        <button @click="exitGame" class="action-btn secondary">EXIT</button>
      </div>
    </div>

    <!-- Game Screen -->
    <div v-else-if="step === 'PLAY'" class="ingame-container">
      <div class="match-hud">
        <div class="timer-display" :class="{ critical: timeRemaining < 30 }">
          {{ formatTime(timeRemaining) }}
        </div>
        <div class="concurrent-progress">
          <div class="p-bar"><div class="fill" :style="{ width: playerProgress + '%' }"></div></div>
          <div class="p-bar"><div class="fill enemy" :style="{ width: opponentProgress + '%' }"></div></div>
        </div>
      </div>
      <GameCanvas
        v-if="audioBuffer"
        :audioBuffer="audioBuffer"
        :obstacles="obstacles"
        :sections="sections"
        :loadMap="selectedMap"
        :multiplayerMode="true"
        @retry="startGame" 
        @exit="handleRoundFinish" 
        @progress-update="updateProgress"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { type SongSection } from '@/composables/useAudioAnalyzer';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { user, updateRating } = useAuth();

// States
type Step = 'MODESELECT' | 'MATCHMAKING' | 'READY' | 'PLAY' | 'RESULT';
const step = ref<Step>('MODESELECT');
const matchStatus = ref('Connecting to server...');
const opponentName = ref('');
const selectedMap = ref<any>(null);
const selectedCategory = ref('');

const playerProgress = ref(0);
const opponentProgress = ref(0);
const results = ref({ p1: 0, p2: 0 });
const winner = ref<'player' | 'opponent' | 'draw'>('draw');

const audioBuffer = ref<AudioBuffer | null>(null);
const obstacles = ref<number[]>([]);
const sections = ref<SongSection[]>([]);

// Match Timer
const timeRemaining = ref(180);
let matchTimer: any = null;

onMounted(() => {
  // Initial state is MODESELECT
});

onUnmounted(() => {
  clearInterval(matchTimer);
});

async function startMatchmaking(category: string) {
  selectedCategory.value = category;
  step.value = 'MATCHMAKING';
  matchStatus.value = 'SCANNING FOR COMPETITORS...';
  
  // REAL: Fetch maps and pick one
  try {
    const maps: any = await $fetch('/api/maps', { 
      query: { 
        shared: 'true'
      } 
    });

    if (!maps || !maps.length) {
      matchStatus.value = 'NO MAPS AVAILABLE FOR THIS CATEGORY. RETRYING...';
      setTimeout(() => step.value = 'MODESELECT', 2000);
      return;
    }

    selectedMap.value = maps[Math.floor(Math.random() * maps.length)];
    opponentName.value = selectedMap.value.bestPlayer || 'ELITE_GHOST';

    // Auto-load audio if available
    if (selectedMap.value.audioUrl) {
       try {
         matchStatus.value = 'DOWNLOADING BATTLE TRACK...';
         const res = await fetch(selectedMap.value.audioUrl);
         const arrayBuffer = await res.arrayBuffer();
         const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
         audioBuffer.value = await audioCtx.decodeAudioData(arrayBuffer);
       } catch (e) {
         console.warn("Could not auto-load audio, using silent buffer", e);
       }
    }

  } catch (e: any) {
    console.error("Matchmaking failed", e);
    matchStatus.value = `CONNECTION ERROR: ${e.message || 'Unknown Error'}`;
    // Stay on screen longer to read error
    setTimeout(() => step.value = 'MODESELECT', 4000);
    return;
  }

  matchStatus.value = 'OPPONENT FOUND: SYNCHRONIZING...';
  await new Promise(r => setTimeout(r, 1000));
  
  step.value = 'READY';
}

async function startGame() {
  if (!selectedMap.value) return;
  
  // Set Timer based on category
  if (selectedCategory.value === '3m') timeRemaining.value = 180;
  else if (selectedCategory.value === '10m') timeRemaining.value = 600;
  else if (selectedCategory.value === '1h') timeRemaining.value = 3600;

  obstacles.value = selectedMap.value.beatTimes || [];
  sections.value = selectedMap.value.sections || [];
  
  // Create audio buffer (Try to simulate real audio or use silent if missing)
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const bufferLength = Math.max(1, audioCtx.sampleRate * (selectedMap.value.duration || 120));
  audioBuffer.value = audioCtx.createBuffer(1, bufferLength, audioCtx.sampleRate);
  
  step.value = 'PLAY';
  playerProgress.value = 0;
  opponentProgress.value = 0;

  // Start Global Match Timer
  clearInterval(matchTimer);
  matchTimer = setInterval(() => {
    timeRemaining.value--;
    if (timeRemaining.value <= 0) {
      handleTimeout();
    }
  }, 1000);
}

function updateProgress(data: { progress: number, ghostProgress: number }) {
  playerProgress.value = data.progress;
  // Opponent progress is provided by GameCanvas which simulates it based on map's autoplay log
  opponentProgress.value = data.ghostProgress;
  
  // Instant clear detection
  if (playerProgress.value >= 100) {
    finalizeMatch('player');
  } else if (opponentProgress.value >= 100) {
    finalizeMatch('opponent');
  }
}

function handleRoundFinish(data: any) {
  // If player crashed
  if (data?.outcome === 'fail') {
    finalizeMatch('opponent');
  } else if (playerProgress.value >= 100) {
    finalizeMatch('player');
  }
}

function handleTimeout() {
  clearInterval(matchTimer);
  // Compare progress
  let win: 'player' | 'opponent' | 'draw' = 'draw';
  if (playerProgress.value > opponentProgress.value) win = 'player';
  else if (playerProgress.value < opponentProgress.value) win = 'opponent';
  
  finalizeMatch(win as any);
}

function finalizeMatch(win: 'player' | 'opponent' | 'draw') {
  clearInterval(matchTimer);
  winner.value = win;
  results.value.p1 = playerProgress.value;
  results.value.p2 = opponentProgress.value;
  
  // Update Rating
  if (user.value && !user.value.isGuest && (win === 'player' || win === 'opponent')) {
    const currentRating = user.value.rating || 1000;
    const ratingChange = win === 'player' ? 25 : -15;
    const newRating = Math.max(0, currentRating + ratingChange);
    
    updateRating(newRating, {
      opponent: opponentName.value,
      winner: win === 'player' ? user.value.username : opponentName.value,
      myScore: results.value.p1,
      opponentScore: results.value.p2,
      date: new Date(),
      ratingChange: ratingChange
    });
  }

  step.value = 'RESULT';
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function exitGame() {
  router.push('/');
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;700;900&display=swap');

.multi-container {
  width: 100%;
  height: 100vh;
  background: #050510;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Outfit', sans-serif;
  position: relative;
  overflow: hidden;
}

.background-anim {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at 50% 50%, #1a1a3a 0%, #000 100%);
  z-index: 0;
}

.setup-screen {
  z-index: 10;
  text-align: center;
  width: 100%;
  max-width: 800px;
}

.glass-panel {
  background: rgba(20, 20, 30, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 3rem;
  border-radius: 24px;
  box-shadow: 0 0 60px rgba(0,0,0,0.6);
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin: 3rem 0;
}

.mode-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.mode-card:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: #00ffff;
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 10px 40px rgba(0, 255, 255, 0.2);
}

.mode-icon { font-size: 3rem; }
.mode-card h3 { font-size: 1.5rem; font-weight: 900; color: #00ffff; margin: 0; }
.mode-card p { color: #888; font-size: 0.9rem; margin: 0; }

.radar {
  width: 180px;
  height: 180px;
  border: 2px solid #00ffff;
  border-radius: 50%;
  margin: 2rem auto;
  position: relative;
  overflow: hidden;
  background: rgba(0, 255, 255, 0.05);
}

.radar-line {
  position: absolute;
  top: 50%; left: 50%;
  width: 90px;
  height: 2px;
  background: linear-gradient(90deg, #00ffff, transparent);
  transform-origin: left center;
  animation: radarRotate 2s linear infinite;
}

@keyframes radarRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.category-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #00ffff;
  color: #000;
  font-weight: 900;
  border-radius: 4px;
  margin-top: 1rem;
}

.match-hud {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%);
}

.timer-display {
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: 2px;
  color: #fff;
  text-shadow: 0 0 20px rgba(255,255,255,0.5);
}

.timer-display.critical {
  color: #ff3333;
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  from { transform: scale(1); text-shadow: 0 0 10px #ff0000; }
  to { transform: scale(1.1); text-shadow: 0 0 30px #ff0000; }
}

.concurrent-progress {
  width: 80%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.p-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.p-bar .fill {
  height: 100%;
  background: #00ffff;
  transition: width 0.1s linear;
}

.p-bar .fill.enemy {
  background: #ff00ff;
}

.vs-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  margin-bottom: 2rem;
}

.player-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar {
  font-size: 3rem; color: #00ffff; width: 80px; height: 80px;
  border: 2px solid #00ffff; display: flex; justify-content: center;
  align-items: center; border-radius: 12px; background: rgba(0, 255, 255, 0.1);
}

.avatar.opponent { color: #ff00ff; border-color: #ff00ff; background: rgba(255, 0, 255, 0.1); }

.vs-badge { font-size: 2.5rem; font-weight: 900; text-shadow: 0 0 20px rgba(255, 255, 255, 0.5); }

.battle-btn {
  width: 100%; padding: 1.5rem; font-size: 1.8rem; font-weight: 900;
  background: linear-gradient(135deg, #00ffff, #ff00ff);
  border: none; color: #000; cursor: pointer; border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.battle-btn:hover { transform: scale(1.02); box-shadow: 0 0 30px rgba(0, 255, 255, 0.5); }

.victory-text {
  font-size: 5rem; font-weight: 900; color: #00ffff;
  text-shadow: 0 0 50px rgba(0, 255, 255, 0.5); margin-bottom: 2rem;
}
.victory-text.loss { color: #ff00ff; text-shadow: 0 0 50px rgba(255, 0, 255, 0.5); }
.victory-text.draw { color: #ffff00; text-shadow: 0 0 50px rgba(255, 255, 0, 0.5); }

.duel-res { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.res-item { display: flex; align-items: center; gap: 1rem; }
.res-item .prog-bar { flex: 1; height: 10px; background: #222; border-radius: 5px; overflow: hidden; }
.res-item .prog-bar .fill { height: 100%; background: #00ffff; }
.res-item .prog-bar .fill.enemy { background: #ff00ff; }

.action-btn {
  padding: 1rem 2rem; background: #fff; color: #000; border: none;
  font-weight: 900; cursor: pointer; border-radius: 8px; margin: 0 0.5rem;
}
.action-btn.secondary { background: transparent; border: 1px solid #666; color: #fff; }

.back-btn-simple {
  margin-top: 2rem; background: transparent; border: none; color: #666;
  font-weight: bold; cursor: pointer; text-decoration: underline;
}

.cancel-btn {
  margin-top: 2rem; background: rgba(255,0,0,0.2); border: 1px solid #ff0000;
  color: #ff0000; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;
}

.timeout-badge {
  color: #ffaa00; font-weight: bold; padding: 0.5rem 1rem;
  border: 1px solid #ffaa00; border-radius: 4px; border-style: dashed; margin-bottom: 1rem; display: inline-block;
}
</style>
