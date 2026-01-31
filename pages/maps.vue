<template>
  <div class="maps-page">
    <div class="background-anim"></div>
    
    <div class="container">
      <header class="page-header">
        <h1 class="title">MAP_DATABASE</h1>
        <div class="tabs">
          <button 
            :class="['tab-btn', { active: currentTab === 'my' }]" 
            @click="currentTab = 'my'"
          >
            MY_ENTRIES
          </button>
          <button 
            :class="['tab-btn', { active: currentTab === 'shared' }]" 
            @click="currentTab = 'shared'"
          >
            GLOBAL_UPLOADS
          </button>
        </div>
      </header>

      <div class="map-grid" v-if="!loading">
        <div v-for="map in filteredMaps" :key="map._id" :class="['map-card', { 'is-verified': map.isVerified }]">
          <div class="card-header">
            <span class="diff-tag" :style="{ color: getDiffColor(map.difficulty) }">
              DIFF: {{ map.difficulty }}
            </span>
            <span v-if="map.isVerified" class="verified-tag">✓ VERIFIED</span>
            <span v-if="map.rating > 0" class="rating-tag">
              RATE: ★{{ map.rating.toFixed(1) }}
            </span>
            <span v-else class="rating-tag empty">
              RATE: -
            </span>
            <span class="date">{{ new Date(map.createdAt).toLocaleDateString() }}</span>
          </div>
          <h3 class="map-title">
            {{ map.title }}
            <span v-if="map.isVerified" class="verified-icon" title="Verified Map">✓</span>
          </h3>
          <div class="map-info">
            <span class="creator">BY: {{ map.creatorName }}</span>
            <span class="duration">{{ Math.floor(map.duration) }}s</span>
            <span v-if="map.myBestProgress !== undefined" class="my-progress">MY: {{ Math.floor(map.myBestProgress) }}%</span>
          </div>
          
            <div class="actions">
              <button @click="playMap(map)" class="action-btn play" title="Play"><span class="btn-icon">▶</span><span class="btn-text">PLAY</span></button>
              <template v-if="currentTab === 'my'">
                <button @click="startEdit(map)" class="action-btn edit" title="Edit"><span class="btn-icon">✏</span><span class="btn-text">EDIT</span></button>
                <button @click="startRename(map)" class="action-btn rename" title="Rename"><span class="btn-icon">📝</span><span class="btn-text">NAME</span></button>
                <button 
                  @click="toggleShare(map)" 
                  class="action-btn share"
                  :title="map.isShared ? 'Make Private' : 'Share'"
                >
                  <span class="btn-icon">{{ map.isShared ? '🔒' : '🌐' }}</span><span class="btn-text">{{ map.isShared ? 'PRIV' : 'SHARE' }}</span>
                </button>
                <button @click="deleteMap(map)" class="action-btn delete" title="Delete"><span class="btn-icon">✕</span><span class="btn-text">DEL</span></button>
              </template>
              <template v-if="currentTab === 'shared' && map.isVerified">
                <button @click="openRating(map)" class="action-btn rate" title="Rate"><span class="btn-icon">★</span><span class="btn-text">RATE</span></button>
              </template>
            </div>
        </div>

        <div v-if="renamingMap" class="rename-modal">
          <div class="modal-content glass-panel">
            <h3>RENAME_ENTRY</h3>
            <input v-model="newTitle" placeholder="Enter new title..." @keyup.enter="renameMap">
            <div class="modal-actions">
              <button @click="renameMap" class="confirm">CONFIRM</button>
              <button @click="renamingMap = null" class="cancel">CANCEL</button>
            </div>
          </div>
        </div>

        <!-- Rating Modal -->
        <div v-if="ratingMap" class="rename-modal">
          <div class="modal-content glass-panel">
            <h3>RATE_MAP</h3>
            <p class="rating-info">{{ ratingMap.title }}</p>
            <div class="rating-slider-container">
              <input 
                type="range" 
                min="1" 
                max="30" 
                v-model.number="newRating" 
                class="rating-slider"
              >
              <span class="rating-value" :style="{ color: getDiffColor(newRating) }">{{ newRating }}</span>
            </div>
            <div class="modal-actions">
              <button @click="submitRating" class="confirm">SUBMIT</button>
              <button @click="ratingMap = null" class="cancel">CANCEL</button>
            </div>
          </div>
        </div>
        
        <div v-if="filteredMaps.length === 0" class="empty-state">
          NO DATA FOUND IN THIS SECTOR
        </div>
      </div>
      
      <div v-else class="loading-state">
        ACCESSING DATABASE...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';

const { user } = useAuth();
const router = useRouter();

const currentTab = ref<'my' | 'shared'>('my');
const maps = ref<any[]>([]);
const loading = ref(true);
const renamingMap = ref<any>(null);
const newTitle = ref('');
const ratingMap = ref<any>(null);
const newRating = ref(15);

const fetchMaps = async () => {
  loading.value = true;
  try {
    const creator = currentTab.value === 'my' ? (user.value?.username || 'Guest') : undefined;
    const shared = currentTab.value === 'shared' ? 'true' : undefined;
    
    maps.value = await $fetch('/api/maps', {
      query: { creator, shared }
    });
  } catch (e) {
    console.error("Fetch maps error:", e);
  } finally {
    loading.value = false;
  }
};

const filteredMaps = computed(() => maps.value);

const playMap = (map: any) => {
  router.push({ path: '/play', query: { map: map._id } });
};

const startEdit = async (map: any) => {
  try {
    const fullMap = await $fetch(`/api/maps/${map._id}`);
    sessionStorage.setItem('umm_edit_map', JSON.stringify(fullMap));
    router.push('/editor');
  } catch (e) {
    alert("Failed to load map data.");
  }
};

const deleteMap = async (map: any) => {
  if (!confirm(`Are you sure you want to delete "${map.title}"?`)) return;
  try {
    await $fetch(`/api/maps/${map._id}`, { method: 'DELETE' });
    maps.value = maps.value.filter(m => m._id !== map._id);
  } catch (e) {
    alert("Map deletion failed.");
  }
};

const startRename = (map: any) => {
  renamingMap.value = map;
  newTitle.value = map.title;
};

const renameMap = async () => {
  if (!renamingMap.value || !newTitle.value.trim()) return;
  try {
    const updated: any = await $fetch(`/api/maps/${renamingMap.value._id}`, {
      method: 'PATCH',
      body: { title: newTitle.value.trim() }
    });
    renamingMap.value.title = updated.title;
    renamingMap.value = null;
  } catch (e) {
    alert("Rename failed.");
  }
};

const toggleShare = async (map: any) => {
  try {
    const updated: any = await $fetch(`/api/maps/${map._id}`, {
      method: 'PATCH',
      body: { isShared: !map.isShared }
    });
    map.isShared = updated.isShared;
  } catch (e) {
    alert("Toggle share failed.");
  }
};

const getDiffColor = (d: number) => {
  if (d < 8) return '#00ff88';
  if (d < 16) return '#ffff00';
  if (d < 24) return '#ff8800';
  return '#ff4444';
};

const openRating = (map: any) => {
  ratingMap.value = map;
  newRating.value = Math.round(map.rating) || 15;
};

const submitRating = async () => {
  if (!ratingMap.value) return;
  try {
    const updated: any = await $fetch(`/api/maps/${ratingMap.value._id}/rate`, {
      method: 'POST',
      body: { rating: newRating.value }
    });
    ratingMap.value.rating = updated.rating;
    ratingMap.value.ratingCount = updated.ratingCount;
    ratingMap.value = null;
  } catch (e) {
    alert("Rating failed.");
  }
};

watch(currentTab, fetchMaps);

onMounted(() => {
  if (!user.value) {
    alert("Guest cannot access MAP Database. Please Login.");
    router.push('/');
    return;
  }
  fetchMaps();
});
</script>

<style scoped>
.maps-page {
  min-height: 100vh;
  background: #050510;
  color: white;
  font-family: 'Outfit', sans-serif;
  padding: 4rem 2rem;
  position: relative;
  overflow-x: hidden;
}

.background-anim {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at 50% 50%, #1a1a3a 0%, #000 100%);
  z-index: 0;
}

.container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  z-index: 1;
}

.page-header {
  margin-bottom: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.title {
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.tabs {
  display: flex;
  gap: 1rem;
}

.tab-btn {
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #666;
  font-weight: 700;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.tab-btn.active {
  background: rgba(0, 255, 255, 0.1);
  border-color: #00ffff;
  color: #00ffff;
}

.map-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.map-card {
  background: rgba(20, 20, 30, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1.8rem;
  border-radius: 20px;
  backdrop-filter: blur(15px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.map-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(255, 0, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: -1;
}

.map-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.map-card:hover::before {
  opacity: 1;
}

.map-card.is-verified {
  border-color: rgba(0, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.05);
}

.map-card.is-verified:hover {
  border-color: #00ffff;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
  font-size: 0.8rem;
}

.date { color: #555; }
.rating-tag {
  color: #00ffaa;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(0, 255, 170, 0.3);
}
.rating-tag.empty {
  color: #444;
  text-shadow: none;
}

.map-title {
  font-size: 1.5rem;
  font-weight: 900;
  margin-bottom: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 1px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.verified-icon {
  color: #00ffff;
  font-size: 1rem;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

.map-info {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.creator {
  color: #aaa;
  font-weight: 500;
}

.my-progress {
  color: #00ffff;
  font-weight: 900;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
}

.actions {
  display: flex;
  gap: 0.6rem;
  margin-top: auto;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 60px;
  padding: 0.8rem 0.5rem;
  text-align: center;
  border-radius: 10px;
  font-weight: 900;
  font-size: 0.75rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.action-btn.play {
  background: #00ffff;
  color: #000;
  box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.action-btn.edit {
  background: rgba(255, 255, 255, 0.08);
  color: #ccc;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn.share {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.rename {
  background: white;
  color: black;
}

.action-btn.delete {
  background: #eee;
  color: #333;
}

.action-btn:hover:not(:disabled) {
  opacity: 1;
  transform: translateY(-2px);
  filter: brightness(1.2);
}

.action-btn.play:hover {
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.5);
}

/* Modal Styles */
.rename-modal {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 400px;
  padding: 2rem;
  background: #0a0a1a;
  border: 1px solid #00ffff;
  border-radius: 16px;
  text-align: center;
}

.modal-content h3 {
  margin-bottom: 1.5rem;
  letter-spacing: 2px;
  color: #00ffff;
}

.modal-content input {
  width: 100%;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  margin-bottom: 1.5rem;
  outline: none;
}

.modal-content input:focus {
  border-color: #00ffff;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.modal-actions button {
  flex: 1;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.modal-actions .confirm {
  background: #00ffff;
  color: #000;
  border: none;
}

.modal-actions .cancel {
  background: transparent;
  color: #888;
  border: 1px solid #444;
}

.empty-state, .loading-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 5rem;
  color: #555;
  letter-spacing: 2px;
}

.verified-tag {
  color: #00ffaa;
  font-weight: 700;
  font-size: 0.75rem;
  background: rgba(0, 255, 170, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.action-btn.rate {
  background: linear-gradient(135deg, #ffaa00 0%, #ff6600 100%);
  color: #000;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.rating-info {
  color: #888;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.rating-slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.rating-slider {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  outline: none;
}

.rating-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.rating-value {
  font-size: 1.5rem;
  font-weight: 900;
  min-width: 40px;
  text-align: center;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .maps-page {
    padding: 1rem 0.5rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .title {
    font-size: 1.5rem;
    letter-spacing: 2px;
  }
  
  .tabs {
    width: 100%;
    justify-content: space-between;
  }
  
  .tab-btn {
    flex: 1;
    padding: 0.6rem 0.8rem;
    font-size: 0.7rem;
    text-align: center;
  }
  
  .map-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .map-card {
    padding: 1rem;
  }
  
  .card-header {
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.7rem;
  }
  
  .map-title {
    font-size: 1.1rem;
  }
  
  .map-info {
    font-size: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .actions {
    gap: 0.4rem;
  }
  
  .action-btn {
    padding: 0.6rem 0.3rem;
    font-size: 0.9rem;
    min-width: 40px;
  }
  
  .action-btn .btn-text {
    display: none;
  }
  
  .action-btn .btn-icon {
    display: inline;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
}

@media (min-width: 769px) {
  .action-btn .btn-icon {
    display: none;
  }
  
  .action-btn .btn-text {
    display: inline;
  }
}
</style>
