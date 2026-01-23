<template>
  <div class="song-selector">
    <!-- Tabs -->
    <div class="tabs">
      <button :class="{ active: mode === 'upload' }" @click="mode = 'upload'">UPLOAD</button>
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
      <div class="save-option" v-if="selectedFile">
        <label>
          <input type="checkbox" v-model="saveToStorage" /> Save to Storage?
        </label>
      </div>
    </div>

    <!-- Storage Mode -->
    <div v-else class="tab-content storage-list">
      <div v-if="songs.length === 0" class="empty">No songs in storage</div>
      <div 
        v-for="song in songs" 
        :key="song.id" 
        class="storage-item"
        :class="{ selected: selectedSongId === song.id }"
        @click="selectStoredSong(song)"
      >
        {{ song.name }}
      </div>
    </div>

    <button class="confirm-btn" :disabled="!currentSelection" @click="confirm">
      SELECT
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

const emit = defineEmits(['select']);
const mode = ref<'upload' | 'storage'>('upload');
const { saveSong, getSongs } = useSongStorage();

const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const saveToStorage = ref(false);

const songs = ref<StoredSong[]>([]);
const selectedSongId = ref<string | null>(null);
const currentSelection = ref<File | null>(null);

onMounted(async () => {
  songs.value = await getSongs();
});

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
  selectedSongId.value = null; // Reset storage selection
}

async function selectStoredSong(song: StoredSong) {
  selectedSongId.value = song.id;
  // Convert blob to File if needed, or just keep as Blob. 
  // API expects File usually but Blob is fine for audio context.
  // StoredSong.blob is stored as Blob/File.
  currentSelection.value = song.blob as File;
  selectedFile.value = null; // Reset upload selection
}

async function confirm() {
  if (!currentSelection.value) return;
  
  if (mode.value === 'upload' && saveToStorage.value && selectedFile.value) {
    await saveSong(selectedFile.value);
    songs.value = await getSongs(); // refresh
  }

  emit('select', currentSelection.value);
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
</style>
