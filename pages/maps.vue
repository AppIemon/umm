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
        <div v-for="map in filteredMaps" :key="map._id" class="map-card">
          <div class="card-header">
            <span class="diff-tag" :style="{ color: getDiffColor(map.difficulty) }">
              DIFF: {{ map.difficulty }}
            </span>
            <span class="date">{{ new Date(map.createdAt).toLocaleDateString() }}</span>
          </div>
          <h3 class="map-title">{{ map.title }}</h3>
          <div class="map-info">
            <span class="creator">BY: {{ map.creatorName }}</span>
            <span class="duration">{{ Math.floor(map.duration) }}s</span>
          </div>
          
            <div class="actions">
              <button @click="playMap(map)" class="action-btn play">PLAY</button>
              <template v-if="currentTab === 'my'">
                <button @click="startEdit(map)" class="action-btn edit">EDIT</button>
                <button @click="startRename(map)" class="action-btn rename">RENAME</button>
                <button @click="toggleShare(map)" class="action-btn share">
                  {{ map.isShared ? 'PRIVATE' : 'SHARE' }}
                </button>
                <button @click="deleteMap(map)" class="action-btn delete">DEL</button>
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

const playMap = async (map: any) => {
  try {
    const fullMap = await $fetch(`/api/maps/${map._id}`);
    sessionStorage.setItem('umm_load_map', JSON.stringify(fullMap));
    router.push('/play');
  } catch (e) {
    alert("Failed to load map data.");
  }
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
  if (d < 4) return '#00ff88';
  if (d < 7) return '#ffff00';
  return '#ff4444';
};

watch(currentTab, fetchMaps);
onMounted(fetchMaps);
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
  background: rgba(20, 20, 30, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: transform 0.2s, border-color 0.2s;
}

.map-card:hover {
  transform: translateY(-5px);
  border-color: #ff00ff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.8rem;
}

.date { color: #555; }

.map-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.map-info {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.8rem;
  text-align: center;
  border-radius: 8px;
  font-weight: 900;
  font-size: 0.8rem;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.action-btn.play {
  background: #00ffff;
  color: #000;
}

.action-btn.edit {
  background: rgba(255, 255, 255, 0.05);
  color: #aaa;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn.share {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn:hover {
  opacity: 0.8;
  border-color: #00ffff;
  color: #fff;
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
</style>
