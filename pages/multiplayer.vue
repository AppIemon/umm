<template>
  <div class="multi-container">
    <div class="background-anim"></div>
    
    <!-- 1. Lobby Screen -->
    <div v-if="step === 'LOBBY'" class="setup-screen glass-panel lobby-panel">
      <h1 class="glow-text">MULTIPLAYER LOBBY</h1>
      
      <div class="lobby-actions">
        <button @click="step = 'CREATE'" class="create-btn">CREATE ROOM</button>
        <button @click="refreshRooms" class="refresh-btn">REFRESH</button>
      </div>

      <div class="room-list">
        <div v-if="rooms.length === 0" class="no-rooms">NO ROOMS AVAILABLE</div>
        <div v-else v-for="room in rooms" :key="room._id" class="room-card" @click="joinRoom(room._id)">
          <div class="room-info">
            <h3 class="room-title">{{ room.title }}</h3>
            <div class="room-meta-row">
              <span class="room-host">HOST: {{ room.host }}</span>
              <span class="room-time">TIME: {{ room.duration }}s</span>
            </div>
          </div>
          <div class="room-status-badge">
            {{ room.currentPlayers }} / {{ room.maxPlayers }}
          </div>
        </div>
      </div>
      
      <button @click="exitGame" class="back-btn-simple">BACK TO MENU</button>
    </div>

    <!-- 2. Create Room Screen -->
    <div v-else-if="step === 'CREATE'" class="setup-screen glass-panel">
       <h1 class="glow-text">CREATE ROOM</h1>
       
       <div class="form-container">
         <div class="form-group">
           <label>ROOM TITLE</label>
           <input v-model="newRoomTitle" class="input-field" placeholder="Enter room name" maxlength="20" />
         </div>
         
         <div class="form-group">
           <label>MAX PLAYERS: {{ newRoomMaxPlayers }}</label>
           <input type="range" v-model.number="newRoomMaxPlayers" min="2" max="10" class="range-slider" />
         </div>
         
         <div class="form-group">
           <label>DURATION (Seconds: 30 ~ 1800)</label>
           <input 
             type="number" 
             v-model.number="newRoomDuration" 
             class="input-field" 
             min="30" 
             max="1800"
             step="10"
           />
           <div class="duration-hint">30s (30sec) ~ 1800s (30min)</div>
         </div>

         <div class="form-group">
           <label>DIFFICULTY: {{ newRoomDifficulty }}</label>
           <input type="range" v-model.number="newRoomDifficulty" min="1" max="30" class="range-slider" />
         </div>

         <div class="form-group">
            <label>MUSIC</label>
            <select v-model="newRoomMusic" class="input-field select-field">
                <option v-for="track in sampleTracks" :key="track.id" :value="track">
                    {{ track.name }}
                </option>
            </select>
         </div>
       </div>

       <div class="action-row">
         <button @click="createRoom" class="confirm-btn">CREATE</button>
         <button @click="step = 'LOBBY'" class="cancel-btn">CANCEL</button>
       </div>
    </div>

    <!-- 3. Waiting Room Screen -->
    <div v-else-if="step === 'ROOM'" class="setup-screen glass-panel room-view">
      <h2 class="room-header-title">{{ currentRoom?.title }}</h2>
      <div class="room-header-meta">
         <span>TIME: {{ currentRoom?.duration }}s</span>
         <span>DIFF: {{ currentRoom?.difficulty }}</span>
         <span>MUSIC: {{ currentRoom?.musicTitle || 'Random' }}</span>
         <span>PLAYERS: {{ currentRoom?.players.length }} / {{ currentRoom?.maxPlayers }}</span>
      </div>

      <div class="room-content-row">
        <div class="player-grid">
          <div v-for="pl in currentRoom?.players" :key="pl.userId" class="player-card-lg" :class="{host: pl.isHost}">
            <div class="avatar-lg">◆</div>
            <div class="player-name">{{ pl.username }}</div>
            <span v-if="pl.userId === playerId" class="me-badge">YOU</span>
            <span v-if="pl.isHost" class="host-badge">HOST</span>
          </div>
          <!-- Placeholders -->
          <div v-for="i in (currentRoom ? (currentRoom.maxPlayers - currentRoom.players.length) : 0)" :key="`placeholder-${i}`" class="player-card-lg empty">
            <div class="avatar-lg empty">+</div>
            <div class="player-name">EMPTY</div>
          </div>
        </div>
        
        <div class="chat-sidebar">
          <MultiplayerChat 
            v-if="currentRoomId"
            :roomId="currentRoomId"
            :userId="playerId"
            :username="playerUsername"
            :messages="currentRoom?.messages || []"
          />
        </div>
      </div>

      <div v-if="isHost" class="host-controls">
         <button @click="startRoomGame" class="start-btn" :disabled="!currentRoom || currentRoom.players.length < 1">START GAME</button>
         <p v-if="currentRoom && currentRoom.players.length < 2" class="hint-text">Waiting for players...</p>
      </div>
      <div v-else class="guest-controls">
         <div class="loading-spinner"></div>
         <p class="waiting-text">WAITING FOR HOST TO START...</p>
      </div>
      
      <button @click="leaveRoom" class="leave-btn">LEAVE ROOM</button>
    </div>

    <!-- 4. Result/Play Screen -->
    <div v-else-if="step === 'PLAY' || step === 'RESULT'" class="ingame-container">
      <div v-if="step === 'RESULT'" class="result-overlay">
        <div class="result-box glass-panel">
          <h1 class="victory-text">{{ didIWin ? 'VICTORY' : 'FINISH' }}</h1>
          <div class="result-list">
             <div v-for="(p, idx) in sortedPlayers" :key="p.userId" class="result-row" :class="{ winner: idx===0, me: p.userId === playerId }">
               <span class="rank">#{{ idx + 1 }}</span>
               <span class="name">{{ p.username }}</span>
               <span class="score">{{ p.progress.toFixed(1) }}% ({{ p.clearCount || 0 }} Wins)</span>
             </div>
          </div>
          <button @click="leaveRoom" class="action-btn">EXIT TO LOBBY</button>
        </div>
      </div>
    
      <div class="match-hud">
        <div class="timer-display" :class="{ critical: timeRemaining < 30 }">
          {{ formatTime(timeRemaining) }}
        </div>
        
        <!-- Leaderboard HUD -->
        <div class="leaderboard-hud">
          <div v-for="(p, idx) in top3Players" :key="p.userId" class="lb-item">
             <span class="lb-rank">#{{ idx + 1 }}</span>
             <span class="lb-name">{{ p.username }}</span>
             <span class="lb-score">{{ p.progress.toFixed(0) }}%</span>
          </div>
        </div>
      </div>

      <GameCanvas
        v-if="audioBuffer"
        :key="currentMapIndex"
        :audioBuffer="audioBuffer"
        :obstacles="obstacles"
        :sections="sections"
        :loadMap="selectedMap"
        :multiplayerMode="true"
        :opponentY="bestOpponent?.y || 360"
        :opponentProgress="bestOpponent?.progress || 0"
        @exit="handleRoundFinish" 
        @complete="handleRoundFinish({ outcome: 'win' })"
        @progress-update="updateMyProgress"
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
const { user } = useAuth(); // We don't use updateRating logic for custom rooms yet

type Step = 'LOBBY' | 'CREATE' | 'ROOM' | 'PLAY' | 'RESULT';
const step = ref<Step>('LOBBY');

// Lobby State
const rooms = ref<any[]>([]);
const newRoomTitle = ref('New Room');
const newRoomMaxPlayers = ref(4);
const newRoomDuration = ref(120);
const newRoomDifficulty = ref(10);
const newRoomMusic = ref<any>(null);

const sampleTracks = ref<any[]>([
  { id: 'random', name: '🎲 Random Sample', url: null, bpm: 120, measureLength: 2.0 },
  { id: '1', name: "God Chang-seop (신창섭) '바로 리부트 정상화' MV", url: '/audio/samples/God Chang-seop (신창섭) \'바로 리부트 정상화\' MV.mp3', bpm: 128, measureLength: 2.0 },
  { id: '2', name: 'I Love You', url: '/audio/samples/I Love You.mp3', bpm: 128, measureLength: 2.0 },
  { id: '3', name: 'Nyan Cat! [Official]', url: '/audio/samples/Nyan Cat! [Official].mp3', bpm: 140, measureLength: 2.0 },
]);

async function fetchRecentMaps() {
  try {
    const res: any = await $fetch('/api/maps', {
      params: { shared: 'true' }
    });
    if (res && Array.isArray(res)) {
       const recentMaps = res.slice(0, 50).map((m: any) => ({
         id: m._id,
         name: `🎵 ${m.title} (by ${m.creatorName})`,
         url: m.audioUrl,
         bpm: m.bpm || 120,
         measureLength: m.measureLength || 2.0
       }));
       sampleTracks.value.push(...recentMaps);
    }
  } catch (e) {
    console.error("Failed to fetch recent maps", e);
  }
}

onMounted(() => {
    newRoomMusic.value = sampleTracks.value[0]; // Default Random
    fetchRecentMaps();
});

// Room State
const currentRoom = ref<any>(null);
const currentRoomId = ref<string | null>(null);
const currentMapIndex = ref(0); // Track progress in stages


const playerId = computed(() => user.value?._id || sessionStorage.getItem('umm_player_id') || ('guest_' + Math.random().toString(36).substr(2,9)));
const playerUsername = computed(() => user.value?.displayName || user.value?.username || 'Guest');
const isHost = computed(() => currentRoom.value?.hostId === playerId.value);

// Game State
const selectedMap = ref<any>(null);
const audioBuffer = ref<AudioBuffer | null>(null);
const obstacles = ref<number[]>([]);
const sections = ref<SongSection[]>([]);
const timeRemaining = ref(0);
const matchTimer = ref<any>(null);
const statusInterval = ref<any>(null);

// In-game State
const myProgress = ref(0);
const myY = ref(360);
const playerClearCount = ref(0);
const allPlayers = ref<any[]>([]); // Synced via poll

let isEnteringGame = false;

const showNavbar = useState('showNavbar');

onMounted(() => {
  if (!user.value?._id && !sessionStorage.getItem('umm_player_id')) {
    sessionStorage.setItem('umm_player_id', playerId.value);
  }
  refreshRooms();
});

onUnmounted(() => {
  stopPolling();
  showNavbar.value = true;
});

function stopPolling() {
  if (matchTimer.value) clearInterval(matchTimer.value);
  if (statusInterval.value) clearInterval(statusInterval.value);
}

// 플레이어가 맵 클리어 시 호출
async function handlePlayerClear() {
  playerClearCount.value++;
  
  // Update local state for immediate feedback
  const me = allPlayers.value.find(p => p.userId === playerId.value);
  if (me) {
    me.clearCount = (me.clearCount || 0) + 1;
  }
  
  // 서버에 클리어 알림
  try {
    await $fetch('/api/rooms/clear', {
      method: 'POST',
      body: {
        matchId: currentRoomId.value, // Backend expects 'matchId'
        userId: playerId.value
      }
    });
  } catch (e) {
    console.error('Failed to notify clear', e);
  }
}

// 다음 맵 로드
async function loadNextMap() {
  const nextIndex = currentMapIndex.value + 1;
  
  try {
    const res: any = await $fetch('/api/rooms/next-map', {
      method: 'POST',
      body: {
        roomId: currentRoomId.value,
        userId: playerId.value,
        mapIndex: nextIndex
      }
    });
    
    if (res.map) {
      selectedMap.value = res.map;
      currentMapIndex.value = res.mapIndex; // Update index ONLY after successful fetch
      obstacles.value = res.map.engineObstacles || [];
      sections.value = res.map.sections || [];
      myProgress.value = 0;
    }
  } catch (e) {
    console.error('Failed to load next map', e);
  }
}

// 1. LOBBY
async function refreshRooms() {
  try {
    // Background cleanup of stale rooms
    await $fetch('/api/rooms/cleanup');
    
    const res: any = await $fetch('/api/rooms');
    rooms.value = res.rooms;
  } catch (e) {
    console.error("Failed to fetch rooms", e);
  }
}

async function createRoom() {
  if (!newRoomTitle.value) return;

  let finalMusicUrl = newRoomMusic.value?.url;
  let finalMusicTitle = newRoomMusic.value?.name;
  let finalBpm = newRoomMusic.value?.bpm || 120;
  let finalMeasureLength = newRoomMusic.value?.measureLength || 2.0;

  if (!newRoomMusic.value || newRoomMusic.value.id === 'random') {
    const realTracks = sampleTracks.value.filter(t => t.id !== 'random');
    const randomTrack = realTracks[Math.floor(Math.random() * realTracks.length)];
    finalMusicUrl = randomTrack.url;
    finalMusicTitle = randomTrack.name;
    finalBpm = randomTrack.bpm;
    finalMeasureLength = randomTrack.measureLength;
  }

  try {
    const res: any = await $fetch('/api/rooms/create', {
      method: 'POST',
      body: {
        title: newRoomTitle.value,
        maxPlayers: newRoomMaxPlayers.value,
        duration: newRoomDuration.value,
        userId: playerId.value,
        username: playerUsername.value,
        difficulty: newRoomDifficulty.value,
        musicUrl: finalMusicUrl,
        musicTitle: finalMusicTitle,
        musicBpm: finalBpm,
        musicMeasureLength: finalMeasureLength
      }
    });
    if (res.success) {
      currentRoomId.value = res.roomId;
      step.value = 'ROOM';
      startRoomPolling();
    }
  } catch (e) {
    alert("Failed to create room");
  }
}

async function joinRoom(roomId: string) {
  try {
    const res: any = await $fetch('/api/rooms/join', {
      method: 'POST',
      body: { roomId, userId: playerId.value, username: playerUsername.value }
    });
    if (res.success) {
      currentRoomId.value = res.roomId;
      step.value = 'ROOM';
      startRoomPolling();
    }
  } catch (e: any) {
    alert("Cannot join room: " + (e.statusMessage || "Error"));
  }
}

async function leaveRoom() {
  stopPolling();
  if (currentRoomId.value) {
    try {
      await $fetch(`/api/rooms/${currentRoomId.value}/leave`, {
        method: 'POST',
        body: { userId: playerId.value }
      });
    } catch (e) {
      console.error("Failed to leave room", e);
    }
  }
  currentRoomId.value = null;
  currentRoom.value = null;
  step.value = 'LOBBY';
  showNavbar.value = true;
  refreshRooms();
}

// 2. POLLING (ROOM & GAME)
function startRoomPolling() {
  stopPolling();
  statusInterval.value = setInterval(async () => {
    if (!currentRoomId.value) return;
    try {
      // If playing, we also send our state
      const body: any = { userId: playerId.value };
      if (step.value === 'PLAY') {
         body.progress = myProgress.value;
         body.y = myY.value;
      }
      
      // We can use the generic status endpoint or specific update endpoint
      // Update endpoint for state
      if (step.value === 'PLAY') {
         await $fetch(`/api/rooms/${currentRoomId.value}/update`, {
           method: 'POST', body
         });
      }
      
      // Get status
      const res: any = await $fetch(`/api/rooms/${currentRoomId.value}/status`, {
        params: { userId: playerId.value }
      });
      
      currentRoom.value = res.room;
      allPlayers.value = res.room.players || [];
      
      // Sync Time Remaining with server
      if (res.room.status === 'playing' && res.room.startedAt) {
        const startTs = new Date(res.room.startedAt).getTime();
        const nowTs = Date.now();
        const elapsed = Math.floor((nowTs - startTs) / 1000);
        const serverDuration = res.room.duration || 60;
        timeRemaining.value = Math.max(0, serverDuration - elapsed);
      }
      
      // Check for Game Start
      if (step.value === 'ROOM' && res.room.status === 'playing') {
        enterGame(res.room);
      }
      
      // Check for Game Over logic if needed (handled by timer mostly)
    } catch (e) {
      console.error("Poll error", e);
    }
  }, 1000); // 1s poll in waiting, maybe faster in game?
}

// 3. START GAME
async function startRoomGame() {
  if (!isHost.value || !currentRoomId.value) return;
  try {
    await $fetch(`/api/rooms/${currentRoomId.value}/start`, {
      method: 'POST',
      body: { userId: playerId.value }
    });
  } catch (e: any) {
    const errorMsg = e.data?.statusMessage || e.statusMessage || e.message || "Unknown error";
    alert("Failed to start: " + errorMsg);
  }
}

async function enterGame(roomData: any) {
  if (isEnteringGame) return;
  isEnteringGame = true;
  
  // Load Map (If map isn't populated in roomData, fetch it)
  // Our status API populates map if playing
  if (!roomData.map) return;
  
  selectedMap.value = roomData.map;
  timeRemaining.value = roomData.duration || 60; // Fallback to avoid NaN
  
  // Audio Load
  audioBuffer.value = null; // Reset
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (selectedMap.value.audioUrl) {
      // Decode real audio
      const response = await fetch(selectedMap.value.audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      audioBuffer.value = await audioCtx.decodeAudioData(arrayBuffer);
    } else {
      // Use dummy buffer if no audio url (or system gen map)
      const bufferLength = audioCtx.sampleRate * timeRemaining.value;
      audioBuffer.value = audioCtx.createBuffer(1, bufferLength, audioCtx.sampleRate);
    }
  } catch (e) {
    console.error("Audio Load Error", e);
  }

  obstacles.value = selectedMap.value.engineObstacles || [];
  // Need to convert objects if they are raw? GameEngine takes specific format?
  // GameCanvas expects `obstacles` to be beatTimes array? No, looking at GameCanvas props:
  // `obstacles: number[]` (BEAT TIMES) OR `loadMap` object?
  // GameCanvas uses `loadMap` if present. `engine.loadMapData(props.loadMap)`.
  // So we just pass `selectedMap`.
  
  step.value = 'PLAY';
  showNavbar.value = false;
  isEnteringGame = false;
  
  // Start local timer (As fallback/smoother, but poll will correct it)
  if (matchTimer.value) clearInterval(matchTimer.value);
  matchTimer.value = setInterval(() => {
    // timeRemaining is now also synced from poll, but we dec locally for smoothness
    if (timeRemaining.value > 0) {
      timeRemaining.value--;
    } else {
      finishGame();
    }
  }, 1000);
}

function updateMyProgress(data: any) {
  myProgress.value = data.progress;
  myY.value = data.y;
}

function handleRoundFinish(data: any) {
  // Check if player completed the map
  if (data?.outcome === 'win') {
    handlePlayerClear();
    // After clear, load next stage after a short delay
    setTimeout(() => {
       loadNextMap();
    }, 1500); // 1.5 seconds delay to show "Complete"
  }
}

async function finishGame() {
  // Do one last poll to get final scores
  try {
    const res: any = await $fetch(`/api/rooms/${currentRoomId.value}/status`, {
      params: { userId: playerId.value }
    });
    if (res.room) {
      allPlayers.value = res.room.players || [];
    }
  } catch (e) {}
  
  stopPolling();
  step.value = 'RESULT';
}

async function exitGame() {
  await leaveRoom();
  router.push('/');
}

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

const top3Players = computed(() => {
  // Sort by Clear Count then Progress
  return [...allPlayers.value].sort((a,b) => {
    if ((b.clearCount || 0) !== (a.clearCount || 0)) {
      return (b.clearCount || 0) - (a.clearCount || 0);
    }
    return b.maxProgress - a.maxProgress;
  }).slice(0, 3);
});

const sortedPlayers = computed(() => {
  return [...allPlayers.value].sort((a,b) => {
    if ((b.clearCount || 0) !== (a.clearCount || 0)) {
      return (b.clearCount || 0) - (a.clearCount || 0);
    }
    return b.maxProgress - a.maxProgress;
  });
});

const bestOpponent = computed(() => {
  // Find the player with highest progress that isn't me
  return sortedPlayers.value.find(p => p.userId !== playerId.value);
});

const didIWin = computed(() => {
  return sortedPlayers.value[0]?.userId === playerId.value;
});

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;700;900&display=swap');

.multi-container {
  width: 100%; height: 100vh; background: #050510; color: white;
  display: flex; justify-content: center; align-items: center;
  font-family: 'Outfit', sans-serif; position: relative; overflow: hidden;
}

.background-anim {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at 50% 50%, #1a1a3a 0%, #000 100%); z-index: 0;
}

.setup-screen {
  z-index: 10; text-align: center; width: 100%; max-width: 900px;
  display: flex; flex-direction: column; align-items: center; gap: 2rem;
}

.glass-panel {
  background: rgba(20, 20, 30, 0.85); backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1); padding: 3rem;
  border-radius: 24px; box-shadow: 0 0 60px rgba(0,0,0,0.6);
}

.glow-text {
  font-size: 3rem; color: #00ffff; text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
  margin: 0; font-weight: 900;
}

/* LOBBY */
.lobby-panel { width: 90%; height: 80vh; }
.room-list {
  width: 100%; flex: 1; overflow-y: auto;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 12px;
}
.room-card {
  background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 12px;
  cursor: pointer; border: 1px solid transparent; text-align: left;
  display: flex; justify-content: space-between; align-items: center;
}
.room-card:hover { 
  background: rgba(0, 255, 255, 0.1); border-color: #00ffff; 
}
.room-title { font-size: 1.2rem; font-weight: bold; margin: 0 0 0.5rem 0; color: #fff; }
.room-meta-row { font-size: 0.8rem; color: #888; display: flex; gap: 1rem; }
.room-status-badge { 
  background: #333; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: bold;
}

.lobby-actions { display: flex; gap: 1rem; width: 100%; justify-content: flex-end; }
.create-btn { background: #00ffff; color: #000; font-weight: bold; padding: 0.8rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; }
.refresh-btn { background: transparent; border: 1px solid #666; color: #fff; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; }

.back-btn-simple {
  margin-top: 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #aaa;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: bold;
}
.back-btn-simple:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-color: #fff;
  transform: translateY(-2px);
}

/* FORM */
.form-container { width: 100%; display: flex; flex-direction: column; gap: 1.5rem; max-width: 500px; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; text-align: left; }
.input-field { padding: 1rem; background: rgba(0,0,0,0.5); border: 1px solid #444; color: #fff; border-radius: 8px; font-size: 1.2rem; }
.select-field {
  appearance: none;
  background-color: rgba(0,0,0,0.5);
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.5em;
  padding-right: 2.5rem;
  cursor: pointer;
}
.select-field option {
  background: #333;
  color: white;
}
.duration-opts { display: flex; gap: 1rem; }
.duration-opts button { flex: 1; padding: 1rem; background: #222; border: 1px solid #444; color: #888; border-radius: 8px; cursor: pointer; }
.duration-opts button.active { background: #00ffff; color: #000; font-weight: bold; border-color: #00ffff; }

.duration-hint { font-size: 0.8rem; color: #888; margin-top: 0.3rem; }
.action-row { display: flex; gap: 1rem; margin-top: 2rem; }
.confirm-btn { flex: 2; padding: 1rem; background: linear-gradient(135deg, #00ffff, #0088ff); border: none; font-weight: 900; color: #000; border-radius: 8px; cursor: pointer; font-size: 1.2rem; }
.cancel-btn { flex: 1; padding: 1rem; background: transparent; border: 1px solid #666; color: #fff; border-radius: 8px; cursor: pointer; }

/* ROOM VIEW */
.room-view { width: 90%; height: 80vh; }
.room-header-title { font-size: 2.5rem; margin: 0; color: #fff; }
.room-header-meta { display: flex; gap: 2rem; color: #888; font-size: 1.2rem; margin-bottom: 2rem; }
.room-content-row {
  display: flex; gap: 2rem; width: 100%; flex: 1; min-height: 0;
}
.player-grid { 
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
  gap: 1.5rem; flex: 2; margin-bottom: auto; overflow-y: auto;
}
.chat-sidebar {
  flex: 1; min-width: 300px;
}
.player-card-lg { 
  background: rgba(255,255,255,0.05); padding: 2rem; border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
  position: relative; border: 2px solid transparent;
}
.player-card-lg.host { border-color: #ffd700; }
.player-card-lg.empty { opacity: 0.3; border-style: dashed; }
.avatar-lg { width: 80px; height: 80px; background: rgba(0,255,255,0.1); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 2rem; color: #00ffff; }
.host-badge { position: absolute; top: 10px; right: 10px; background: #ffd700; color: #000; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: bold; }
.me-badge { background: #00ffff; color: #000; padding: 0.2rem 0.8rem; border-radius: 12px; font-weight: bold; font-size: 0.8rem; }
.start-btn { width: 100%; max-width: 400px; padding: 1.5rem; font-size: 1.5rem; font-weight: 900; background: #00ff00; color: #000; border: none; border-radius: 12px; cursor: pointer; }
.start-btn:disabled { background: #444; color: #888; cursor: not-allowed; }
.leave-btn { color: #ff4444; background: transparent; border: 1px solid #ff4444; padding: 0.8rem 2rem; border-radius: 8px; cursor: pointer; margin-top: 1rem; }

/* PLAY HUD */
.match-hud { position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; display: flex; justify-content: space-between; padding: 20px; pointer-events: none; }
.timer-display { font-size: 3rem; font-weight: 900; color: #fff; text-shadow: 0 0 10px #000; }
.leaderboard-hud { background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 12px; text-align: right; }
.lb-item { display: flex; gap: 1rem; justify-content: flex-end; font-weight: bold; font-size: 1.1rem; }
.lb-score { color: #00ffff; }

.result-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 2000;
  background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center;
}
.result-box { width: 600px; display: flex; flex-direction: column; align-items: center; gap: 2rem; }
.result-list { width: 100%; display: flex; flex-direction: column; gap: 1rem; }
.result-row { display: flex; align-items: center; background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; font-size: 1.2rem; }
.result-row.winner { border: 2px solid #ffd700; background: rgba(255, 215, 0, 0.1); }
.result-row.me { background: rgba(0,255,255,0.1); }
.rank { font-weight: 900; width: 50px; }
.name { flex: 1; text-align: left; }
.score { font-weight: bold; }

.action-btn {
  margin-top: 2rem;
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: 900;
  color: white;
  background: linear-gradient(90deg, #ff4444, #ff8844);
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 68, 68, 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.action-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(255, 68, 68, 0.6);
  background: linear-gradient(90deg, #ff5555, #ff9955);
}

.action-btn:active {
  transform: translateY(1px);
}

</style>
