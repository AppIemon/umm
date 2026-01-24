<template>
  <div class="song-selector">
    <!-- Tabs -->
    <div class="tabs">
      <button :class="{ active: mode === 'samples' }" @click="mode = 'samples'">SAMPLES</button>
      <button :class="{ active: mode === 'upload' }" @click="mode = 'upload'">UPLOAD</button>
      <button :class="{ active: mode === 'youtube' }" @click="mode = 'youtube'">YOUTUBE</button>
      <button :class="{ active: mode === 'storage' }" @click="mode = 'storage'">STORAGE</button>
    </div>

    <!-- Sample Music Mode (신규 플레이어용) -->
    <div v-if="mode === 'samples'" class="tab-content">
      <p class="section-desc">CC0 무료 음악 - 저작권 걱정 없이 바로 플레이!</p>
      <div class="sample-list">
        <div 
          v-for="sample in sampleTracks" 
          :key="sample.id" 
          class="sample-item"
          :class="{ selected: selectedSample?.id === sample.id, loading: loadingSampleId === sample.id }"
          @click="selectSample(sample)"
        >
          <div class="sample-info">
            <span class="sample-name">{{ sample.name }}</span>
            <span class="sample-meta">{{ sample.genre }} • {{ sample.duration }}</span>
          </div>
          <span v-if="loadingSampleId === sample.id" class="loading-indicator">◆</span>
        </div>
      </div>
    </div>

    <!-- Upload Mode -->
    <div v-else-if="mode === 'upload'" class="tab-content">
      <div 
        class="drop-zone"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <p v-if="!selectedFile">DROP FILE HERE</p>
        <p v-else class="highlight">{{ selectedFile.name }}</p>
      </div>
      <input type="file" ref="fileInput" accept="audio/*" style="display:none" @change="handleFileSelect" />
    </div>

    <!-- YouTube Mode -->
    <div v-else-if="mode === 'youtube'" class="tab-content">
      <div class="youtube-input-container">
        <input 
          v-model="youtubeUrl" 
          type="text" 
          placeholder="Paste YouTube URL here..." 
          @keyup.enter="fetchYoutube"
          :disabled="isYoutubeLoading"
        />
        <button class="fetch-btn" @click="fetchYoutube" :disabled="!youtubeUrl || isYoutubeLoading">
          {{ isYoutubeLoading ? 'LOADING...' : 'LOAD' }}
        </button>
      </div>
      <p v-if="youtubeError" class="error-msg">{{ youtubeError }}</p>
      <div v-if="selectedFile && mode === 'youtube'" class="youtube-preview">
        <p class="highlight">Loaded: {{ selectedFile.name }}</p>
      </div>
    </div>

    <!-- Storage Mode -->
    <div v-else-if="mode === 'storage'" class="tab-content">
      <div v-if="storageItems.length > 0" class="storage-list">
        <div 
          v-for="item in storageItems" 
          :key="item.id" 
          class="storage-item" 
          :class="{ selected: selectedStorageItem?.id === item.id }"
          @click="selectStorageItem(item)"
        >
          <span class="name">{{ item.name }}</span>
          <span class="date">{{ new Date(item.timestamp).toLocaleDateString() }}</span>
        </div>
      </div>
      <p v-else class="empty-msg">NO RECENT DATA FOUND</p>
    </div>

    <button class="confirm-btn" :disabled="(!currentSelection && !selectedStorageItem && !selectedSample) || isYoutubeLoading || loadingSampleId" @click="confirm">
      SELECT
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

const emit = defineEmits(['select']);
const mode = ref<'samples' | 'upload' | 'youtube' | 'storage'>('samples');

const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const currentSelection = ref<File | null>(null);

// Sample tracks (CC0 / Public Domain)
interface SampleTrack {
  id: string;
  name: string;
  genre: string;
  duration: string;
  url: string;
}

const sampleTracks = ref<SampleTrack[]>([
  { id: '1', name: 'Bit Bit Loop', genre: 'Electronic', duration: '1:30', url: '/api/samples?id=1' },
  { id: '2', name: 'Soliloquy', genre: 'Ambient', duration: '2:00', url: '/api/samples?id=2' },
  { id: '3', name: 'Orbital Colossus', genre: 'Epic Electronic', duration: '3:00', url: '/api/samples?id=3' },
]);

const selectedSample = ref<SampleTrack | null>(null);
const loadingSampleId = ref<string | null>(null);

async function selectSample(sample: SampleTrack) {
  selectedSample.value = sample;
  selectedStorageItem.value = null;
  currentSelection.value = null;
  
  // 샘플 파일을 미리 로드하여 File 객체로 변환
  loadingSampleId.value = sample.id;
  try {
    const response = await fetch(sample.url);
    if (!response.ok) throw new Error('Failed to load sample');
    const blob = await response.blob();
    const file = new File([blob], sample.name + '.mp3', { type: 'audio/mpeg' });
    currentSelection.value = file;
    selectedFile.value = file;
  } catch (e) {
    console.error('Failed to load sample:', e);
    selectedSample.value = null;
  } finally {
    loadingSampleId.value = null;
  }
}

// Storage logic
const storageItems = ref<any[]>([]);
const selectedStorageItem = ref<any>(null);

function loadStorage() {
  const data = localStorage.getItem('umm_recent_maps');
  if (data) {
    try {
      storageItems.value = JSON.parse(data).sort((a: any, b: any) => b.timestamp - a.timestamp);
    } catch (e) {
      console.error(e);
    }
  }
}

onMounted(loadStorage);
watch(mode, (newMode) => {
  if (newMode === 'storage') loadStorage();
});

function selectStorageItem(item: any) {
  selectedStorageItem.value = item;
  currentSelection.value = null;
  selectedSample.value = null;
}

// YouTube refs
const youtubeUrl = ref('');
const isYoutubeLoading = ref(false);
const youtubeError = ref('');

async function fetchYoutube() {
  if (!youtubeUrl.value) return;
  
  isYoutubeLoading.value = true;
  youtubeError.value = '';
  selectedFile.value = null;
  currentSelection.value = null;
  selectedSample.value = null;
  
  try {
    const response = await fetch('/api/youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: youtubeUrl.value })
    });
    
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to download');
    }
    
    // Get filename from header if possible, or default
    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'youtube_audio.mp3';
    if (contentDisposition) {
        const match = contentDisposition.match(/filename\*=UTF-8''(.+)/);
        if (match && match[1]) filename = decodeURIComponent(match[1]);
    }

    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type || 'audio/mpeg' });
    
    handleFile(file);
  } catch (e: any) {
    console.error(e);
    youtubeError.value = e.message || "Failed to load YouTube video";
  } finally {
    isYoutubeLoading.value = false;
  }
}

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files?.[0]) handleFile(target.files[0]);
}

function handleDrop(e: DragEvent) {
  if (e.dataTransfer?.files?.[0]) handleFile(e.dataTransfer.files[0]);
}

function handleFile(file: File) {
  selectedFile.value = file;
  currentSelection.value = file;
  selectedStorageItem.value = null;
  selectedSample.value = null;
}

async function confirm() {
  if (mode.value === 'storage' && selectedStorageItem.value) {
    emit('select', { type: 'storage', data: selectedStorageItem.value });
  } else if (currentSelection.value) {
    emit('select', currentSelection.value);
  }
}
</script>

<style scoped>
.song-selector {
  width: 100%;
  max-width: 450px;
  background: rgba(0,0,0,0.5);
  border: 1px solid #333;
  padding: 1rem;
  border-radius: 8px;
}

.tabs {
  display: flex;
  margin-bottom: 1rem;
}

.tabs button {
  flex: 1;
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid #333;
  color: #666;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: bold;
}

.tabs button.active {
  border-color: var(--primary, #00f3ff);
  color: white;
}

.section-desc {
  color: #888;
  font-size: 0.8rem;
  margin-bottom: 1rem;
  text-align: center;
}

.sample-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 180px;
  overflow-y: auto;
}

.sample-item {
  padding: 0.8rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.sample-item:hover {
  background: rgba(255,255,255,0.1);
  border-color: #444;
}

.sample-item.selected {
  border-color: var(--primary, #00f3ff);
  background: rgba(0, 243, 255, 0.1);
}

.sample-item.loading {
  opacity: 0.7;
}

.sample-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.sample-name {
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.sample-meta {
  color: #666;
  font-size: 0.75rem;
}

.loading-indicator {
  color: var(--primary, #00f3ff);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.drop-zone {
  border: 2px dashed #444;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 1rem;
}

.drop-zone:hover {
  border-color: var(--primary, #00f3ff);
}

.storage-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.storage-item {
  padding: 0.5rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid transparent;
  cursor: pointer;
}

.storage-item.selected {
  border-color: var(--primary, #00f3ff);
  background: rgba(0, 243, 255, 0.1);
}

.confirm-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.8rem;
  background: var(--primary, #00f3ff);
  color: black;
  border: none;
  font-weight: bold;
  cursor: pointer;
}

.confirm-btn:disabled {
  background: #333;
  color: #555;
  cursor: not-allowed;
}

.highlight {
  color: var(--primary, #00f3ff);
}

.save-option {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #aaa;
}

.youtube-input-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.youtube-input-container input {
  flex: 1;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #444;
  color: white;
  border-radius: 4px;
}

.youtube-input-container .fetch-btn {
  padding: 0 1.5rem;
  background: #ff0000;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
}

.youtube-input-container .fetch-btn:disabled {
  background: #550000;
  cursor: not-allowed;
}

.error-msg {
  color: #ff4444;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.youtube-preview {
  padding: 1rem;
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  border-radius: 4px;
  text-align: center;
}

.empty-msg {
  color: #666;
  text-align: center;
  padding: 2rem;
}
</style>
