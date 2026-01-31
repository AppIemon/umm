<template>
  <div class="mypage-container">
    <div class="header">
      <h1 class="title">PILOT PROFILE</h1>
      <button class="back-btn" @click="router.push('/')"><span class="btn-icon">←</span><span class="btn-text">BACK</span></button>
    </div>

    <div class="content">
      <!-- Profile & Rating Section -->
      <div class="stats-col">
        <div class="glass-panel profile-card">
          <div class="user-id">@{{ user?.username }}</div>
          <div class="rating-display">
            <span class="label">SKILL RATING</span>
            <span class="value">{{ user?.rating || 1000 }}</span>
          </div>
        </div>

        <!-- Match History -->
        <div class="glass-panel history-section">
          <h2>MATCH HISTORY</h2>
          <div class="history-list" v-if="user?.matchHistory?.length">
            <div v-for="(match, idx) in user.matchHistory" :key="idx" class="match-item" :class="{ win: match.winner === user.username }">
              <div class="match-meta">
                <span class="m-date">{{ formatDate(new Date(match.date).getTime()) }}</span>
                <span class="m-opp">VS {{ match.opponent }}</span>
              </div>
              <div class="match-res">
                <span class="res-tag">{{ match.winner === user.username ? 'WIN' : 'LOSS' }}</span>
                <span class="m-rating" :class="{ plus: match.ratingChange > 0 }">
                  {{ match.ratingChange > 0 ? '+' : '' }}{{ match.ratingChange }}
                </span>
              </div>
              <div class="m-score">{{ match.myScore.toFixed(0) }}% - {{ match.opponentScore.toFixed(0) }}%</div>
            </div>
          </div>
          <div v-else class="empty-state">NO BATTLE DATA</div>
        </div>

        <!-- Upload Section -->
        <div class="upload-section glass-panel">
          <h2>UPLOAD NEW TRACK</h2>
          <div 
            class="drop-zone"
            @dragover.prevent
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <p>DROP FILE OR CLICK TO UPLOAD</p>
          </div>
          <input 
            type="file" 
            ref="fileInput" 
            accept="audio/*" 
            style="display: none"
            @change="handleFileSelect" 
          />
        </div>
      </div>

      <div class="right-col">
          <!-- Settings Section -->
          <div class="settings-section glass-panel">
             <h2>ENGINE CUSTOMIZATION</h2>
             <div class="setting-row">
                 <label>FIRE PLANET COLOR</label>
                 <input type="color" v-model="settings.fireColor.value" @change="settings.saveSettings" />
             </div>
             <div class="setting-row">
                 <label>ICE PLANET COLOR</label>
                 <input type="color" v-model="settings.iceColor.value" @change="settings.saveSettings" />
             </div>
             <!-- Future: Image Upload handling for planets -->
          </div>

          <!-- Storage List -->
          <div class="storage-section glass-panel">
            <h2>SAVED TRACKS ({{ songs.length }})</h2>
            <div class="song-list" v-if="songs.length > 0">
              <div v-for="song in songs" :key="song.id" class="song-item">
                <div class="song-info">
                  <span class="song-name">{{ song.name }}</span>
                  <span class="song-date">{{ formatDate(song.date) }}</span>
                </div>
                <div class="actions">
                  <button class="delete-btn" @click="removeSong(song.id)" title="Delete"><span class="btn-icon">✕</span><span class="btn-text">DELETE</span></button>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              NO TRACKS SAVED
            </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useGameSettings } from '@/composables/useGameSettings';

const router = useRouter();
const { saveSong, getSongs, deleteSong } = useSongStorage();
const { user, isAuthenticated } = useAuth();
const settings = useGameSettings();

const songs = ref<StoredSong[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

onMounted(async () => {
    if (!user.value || user.value.isGuest) {
        alert("Login required to access storage.");
        router.push('/login');
        return;
    }
  await loadSongs();
});

async function loadSongs() {
  try {
    songs.value = await getSongs();
  } catch (e) {
    console.error(e);
  }
}

function triggerFileInput() {
  fileInput.value?.click();
}

async function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    await addSong(target.files[0]);
  }
}

async function handleDrop(e: DragEvent) {
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    await addSong(e.dataTransfer.files[0]);
  }
}

async function addSong(file: File) {
  try {
    await saveSong(file);
    await loadSongs();
  } catch (e) {
    alert("Failed to save song");
  }
}

async function removeSong(id: string) {
  if (confirm('Delete this track?')) {
    await deleteSong(id);
    await loadSongs();
  }
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString();
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;700;900&display=swap');

.mypage-container {
  width: 100%;
  min-height: 100vh;
  background: #050510;
  color: white;
  padding: 2rem;
  box-sizing: border-box;
  overflow-y: auto;
  font-family: 'Outfit', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.title {
  font-size: 3rem;
  font-weight: 900;
  color: #ff4d4d;
  text-shadow: 0 0 20px rgba(255, 77, 77, 0.3);
}

.back-btn {
  background: transparent;
  border: 1px solid #333;
  color: #888;
  padding: 0.5rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 4px;
}

.back-btn:hover {
  border-color: #ff4d4d;
  color: #ff4d4d;
}

.content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
}

.stats-col {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-left: 4px solid #4d94ff;
}

.user-id {
  font-size: 1.2rem;
  font-weight: 900;
  color: #fff;
}

.rating-display {
  display: flex;
  flex-direction: column;
}

.rating-display .label {
  font-size: 0.7rem;
  color: #888;
  letter-spacing: 1px;
}

.rating-display .value {
  font-size: 2.5rem;
  font-weight: 900;
  color: #00ffff;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
}

.history-section {
  max-height: 400px;
  overflow-y: auto;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.match-item {
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem;
  border-radius: 8px;
  border-left: 3px solid #ff4d4d;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
}

.match-item.win {
  border-left-color: #00ffff;
  background: rgba(0, 255, 255, 0.02);
}

.match-meta {
  display: flex;
  flex-direction: column;
}

.m-date { font-size: 0.7rem; color: #666; }
.m-opp { font-weight: bold; font-size: 0.9rem; }

.match-res {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.res-tag {
  font-weight: 900;
  font-size: 0.8rem;
}

.m-rating {
  font-size: 0.8rem;
  color: #ff4d4d;
}

.plus { color: #00ffff !important; }

.m-score {
  grid-column: span 2;
  font-family: monospace;
  font-size: 0.8rem;
  color: #888;
}

.glass-panel {
  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
}

/* Right Col (Settings + List) */
.right-col {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.settings-section {
    margin-bottom: 1rem;
}
.setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
}
.setting-row label {
    font-weight: bold;
    color: #ccc;
}
.setting-row input[type="color"] {
    width: 40px;
    height: 40px;
    border: none;
    background: none;
    cursor: pointer;
}

h2 {
  font-size: 1.2rem;
  color: #4d94ff;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 700;
}

.drop-zone {
  border: 2px dashed rgba(77, 148, 255, 0.3);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
  border-radius: 8px;
  text-align: center;
  padding: 1rem;
}

.drop-zone:hover {
  border-color: #4d94ff;
  background: rgba(77, 148, 255, 0.1);
  color: white;
}

.song-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-left-color: #ff4d4d;
}

.song-info {
  display: flex;
  flex-direction: column;
}

.song-name {
  font-weight: bold;
  font-size: 1.1rem;
}

.song-date {
  font-size: 0.8rem;
  color: #666;
}

.delete-btn {
  background: transparent;
  color: #555;
  border: 1px solid #333;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  border-color: #ff4d4d;
  color: #ff4d4d;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #444;
  font-style: italic;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .mypage-container {
    padding: 1rem;
  }
  
  .header {
    margin-bottom: 1rem;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .back-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .back-btn .btn-text {
    display: none;
  }
  
  .back-btn .btn-icon {
    display: inline;
  }
  
  .content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .glass-panel {
    padding: 1rem;
  }
  
  h2 {
    font-size: 1rem;
    margin-bottom: 0.8rem;
  }
  
  .rating-display .value {
    font-size: 2rem;
  }
  
  .match-item {
    padding: 0.8rem;
  }
  
  .drop-zone {
    height: 120px;
    padding: 0.5rem;
  }
  
  .song-item {
    padding: 0.8rem;
  }
  
  .song-name {
    font-size: 0.9rem;
  }
  
  .delete-btn {
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
  }
  
  .delete-btn .btn-text {
    display: none;
  }
  
  .delete-btn .btn-icon {
    display: inline;
  }
  
  .setting-row {
    padding: 0.3rem;
    font-size: 0.85rem;
  }
  
  .setting-row input[type="color"] {
    width: 32px;
    height: 32px;
  }
}

@media (min-width: 769px) {
  .back-btn .btn-icon,
  .delete-btn .btn-icon {
    display: none;
  }
  
  .back-btn .btn-text,
  .delete-btn .btn-text {
    display: inline;
  }
}
</style>
