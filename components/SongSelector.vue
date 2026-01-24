<template>
  <div class="song-selector">
    <!-- Tabs -->
    <div class="tabs">
      <button :class="{ active: mode === 'upload' }" @click="mode = 'upload'">UPLOAD</button>
      <button :class="{ active: mode === 'youtube' }" @click="mode = 'youtube'">YOUTUBE</button>
      <button :class="{ active: mode === 'storage' }" @click="mode = 'storage'">STORAGE</button>
    </div>

    <!-- Upload Mode -->
    <div v-if="mode === 'upload'" class="tab-content">
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

    <button class="confirm-btn" :disabled="(!currentSelection && !selectedStorageItem) || isYoutubeLoading" @click="confirm">
      SELECT
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

const emit = defineEmits(['select']);
const mode = ref<'upload' | 'youtube'>('upload');

const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const currentSelection = ref<File | null>(null);

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
  currentSelection.value = null; // Clear file selection
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
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match && match[1]) filename = match[1];
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
  selectedStorageItem.value = null; // Clear storage selection
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
  max-width: 400px;
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
}

.tabs button.active {
  border-color: var(--primary, #00f3ff);
  color: white;
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
  background: #ff0000; /* YouTube red */
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
</style>
