<template>
  <div class="song-selector">
    <!-- Tabs -->
    <div class="tabs">
      <button :class="{ active: mode === 'samples' }" @click="mode = 'samples'">SAMPLES</button>
      <button :class="{ active: mode === 'upload' }" @click="mode = 'upload'">UPLOAD</button>
      <button :class="{ active: mode === 'youtube' }" @click="mode = 'youtube'">GUIDE</button>
      <button :class="{ active: mode === 'storage' }" @click="mode = 'storage'">RECENT</button>
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

    <!-- YouTube Guide Mode (MP3 변환 안내) -->
    <div v-else-if="mode === 'youtube'" class="tab-content">
      <div class="youtube-guide">
        <h3 class="guide-title">🎵 YouTube MP3 변환 가이드</h3>
        <p class="guide-desc">저작권 보호를 위해 직접 다운로드 기능이 제거되었습니다.<br/>아래 방법으로 MP3 파일을 준비해주세요.</p>
        
        <div class="guide-steps">
          <div class="step">
            <span class="step-num">1</span>
            <div class="step-content">
              <strong>YouTube 영상 URL 복사</strong>
              <p>원하는 음악 영상의 주소를 복사하세요</p>
            </div>
          </div>
          
          <div class="step">
            <span class="step-num">2</span>
            <div class="step-content">
              <strong>MP3 변환 사이트 이용</strong>
              <p>아래 사이트에서 MP3로 변환하세요</p>
              <div class="converter-links">
                <a href="https://y2mate.com" target="_blank" rel="noopener" class="converter-link">
                  <span class="link-icon">🔗</span> Y2Mate
                </a>
                <a href="https://ytmp3.cc" target="_blank" rel="noopener" class="converter-link">
                  <span class="link-icon">🔗</span> YTMP3
                </a>
                <a href="https://loader.to" target="_blank" rel="noopener" class="converter-link">
                  <span class="link-icon">🔗</span> Loader.to
                </a>
              </div>
            </div>
          </div>
          
          <div class="step">
            <span class="step-num">3</span>
            <div class="step-content">
              <strong>MP3 파일 업로드</strong>
              <p>다운로드한 MP3 파일을 UPLOAD 탭에서 업로드하세요</p>
              <button class="go-upload-btn" @click="mode = 'upload'">UPLOAD 탭으로 이동 →</button>
            </div>
          </div>
        </div>
        
        <div class="warning-box">
          <span class="warning-icon">⚠️</span>
          <p>이상한 스팸 사이트가 나올 수도 있으니 자동으로 열리는 사이트는 바로 닫아주세요.<br/>2번정도 닫으면 다운로드가 됩니다.</p>
        </div>
      </div>
    </div>

    <!-- Recent Songs Mode -->
    <div v-else-if="mode === 'storage'" class="tab-content">
      <p class="section-desc">최근 사용한 노래 (최대 20곡)</p>
      <div v-if="recentSongs.length > 0" class="storage-list">
        <div 
          v-for="song in recentSongs" 
          :key="song.id" 
          class="storage-item" 
          :class="{ selected: selectedRecentSong?.id === song.id }"
          @click="selectRecentSong(song)"
        >
          <div class="song-info">
            <span class="name">{{ song.name }}</span>
            <span class="date">{{ formatDate(song.addedAt) }}</span>
          </div>
          <button class="delete-btn" @click.stop="deleteRecentSong(song.id)">✕</button>
        </div>
      </div>
      <div v-else class="empty-state">
        <p class="empty-icon">📁</p>
        <p class="empty-msg">최근 사용한 노래가 없습니다</p>
        <p class="empty-hint">UPLOAD 탭에서 노래를 추가하면 여기에 기록됩니다</p>
      </div>
      
      <button 
        v-if="recentSongs.length > 0" 
        class="clear-all-btn" 
        @click="clearAllSongs"
      >
        전체 삭제
      </button>
    </div>

    <button 
      class="confirm-btn" 
      :disabled="!canConfirm" 
      @click="confirm"
    >
      SELECT
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRecentSongs, type RecentSong } from '@/composables/useRecentSongs';

const emit = defineEmits(['select']);
const mode = ref<'samples' | 'upload' | 'youtube' | 'storage'>('samples');

const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const currentSelection = ref<File | null>(null);

// Recent Songs
const { addSong, getSongs, deleteSong, clearAll } = useRecentSongs();
const recentSongs = ref<RecentSong[]>([]);
const selectedRecentSong = ref<RecentSong | null>(null);

// Sample tracks (CC0 / Public Domain)
interface SampleTrack {
  id: string;
  name: string;
  genre: string;
  duration: string;
  url: string;
}

const sampleTracks = ref<SampleTrack[]>([
  { id: '1', name: "God Chang-seop (신창섭) '바로 리부트 정상화' MV", genre: 'K-Pop', duration: '3:36', url: '/audio/samples/God Chang-seop (신창섭) \'바로 리부트 정상화\' MV.mp3' },
  { id: '2', name: 'I Love You', genre: 'Pop', duration: '3:41', url: '/audio/samples/I Love You.mp3' },
  { id: '3', name: 'Nyan Cat! [Official]', genre: 'Electronic', duration: '3:37', url: '/audio/samples/Nyan Cat! [Official].mp3' },
]);


const selectedSample = ref<SampleTrack | null>(null);
const loadingSampleId = ref<string | null>(null);

// Can confirm check
const canConfirm = computed(() => {
  if (mode.value === 'youtube') return false; // Guide mode - no confirm
  if (loadingSampleId.value) return false;
  return currentSelection.value || selectedRecentSong.value || selectedSample.value;
});

async function loadRecentSongs() {
  try {
    recentSongs.value = await getSongs();
  } catch (e) {
    console.error('Failed to load recent songs:', e);
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString();
}

async function selectSample(sample: SampleTrack) {
  selectedSample.value = sample;
  selectedRecentSong.value = null;
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

function selectRecentSong(song: RecentSong) {
  selectedRecentSong.value = song;
  currentSelection.value = null;
  selectedSample.value = null;
}

async function deleteRecentSong(id: string) {
  try {
    await deleteSong(id);
    await loadRecentSongs();
    if (selectedRecentSong.value?.id === id) {
      selectedRecentSong.value = null;
    }
  } catch (e) {
    console.error('Failed to delete song:', e);
  }
}

async function clearAllSongs() {
  if (!confirm('모든 최근 노래를 삭제하시겠습니까?')) return;
  try {
    await clearAll();
    recentSongs.value = [];
    selectedRecentSong.value = null;
  } catch (e) {
    console.error('Failed to clear songs:', e);
  }
}

onMounted(loadRecentSongs);

watch(mode, (newMode) => {
  if (newMode === 'storage') loadRecentSongs();
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

async function handleFile(file: File) {
  selectedFile.value = file;
  currentSelection.value = file;
  selectedRecentSong.value = null;
  selectedSample.value = null;
  
  // 최근 노래에 추가
  try {
    await addSong(file);
  } catch (e) {
    console.error('Failed to save to recent songs:', e);
  }
}

async function confirm() {
  if (mode.value === 'storage' && selectedRecentSong.value) {
    // RecentSong에서 File 생성
    const file = new File(
      [selectedRecentSong.value.blob], 
      selectedRecentSong.value.name, 
      { type: selectedRecentSong.value.blob.type || 'audio/mpeg' }
    );
    emit('select', file);
  } else if (currentSelection.value) {
    emit('select', currentSelection.value);
  }
}
</script>

<style scoped>
.song-selector {
  width: 100%;
  max-width: 500px;
  background: rgba(0,0,0,0.6);
  border: 1px solid #333;
  padding: 1.2rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.tabs {
  display: flex;
  margin-bottom: 1rem;
  gap: 2px;
}

.tabs button {
  flex: 1;
  padding: 0.6rem;
  background: rgba(255,255,255,0.05);
  border: none;
  border-bottom: 2px solid #333;
  color: #666;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: bold;
  transition: all 0.2s;
}

.tabs button:first-child {
  border-radius: 8px 0 0 0;
}

.tabs button:last-child {
  border-radius: 0 8px 0 0;
}

.tabs button.active {
  border-color: var(--primary, #00f3ff);
  color: white;
  background: rgba(0, 243, 255, 0.1);
}

.tabs button:hover:not(.active) {
  background: rgba(255,255,255,0.1);
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
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 1rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.drop-zone:hover {
  border-color: var(--primary, #00f3ff);
  background: rgba(0, 243, 255, 0.05);
}

/* YouTube Guide Styles */
.youtube-guide {
  padding: 0.5rem 0;
}

.guide-title {
  font-size: 1.1rem;
  color: white;
  margin-bottom: 0.5rem;
  text-align: center;
}

.guide-desc {
  color: #888;
  font-size: 0.8rem;
  text-align: center;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.step {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  background: rgba(255,255,255,0.03);
  padding: 0.8rem;
  border-radius: 8px;
}

.step-num {
  width: 24px;
  height: 24px;
  background: var(--primary, #00f3ff);
  color: black;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content strong {
  color: white;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.3rem;
}

.step-content p {
  color: #888;
  font-size: 0.75rem;
  margin: 0;
}

.converter-links {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.converter-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.8rem;
  background: rgba(255,0,0,0.2);
  color: #ff6b6b;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  transition: all 0.2s;
}

.converter-link:hover {
  background: rgba(255,0,0,0.3);
  transform: translateY(-1px);
}

.link-icon {
  font-size: 0.7rem;
}

.go-upload-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary, #00f3ff);
  color: black;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.go-upload-btn:hover {
  transform: translateX(3px);
}

.warning-box {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.8rem;
  background: rgba(255, 200, 0, 0.1);
  border: 1px solid rgba(255, 200, 0, 0.3);
  border-radius: 6px;
}

.warning-icon {
  font-size: 1rem;
}

.warning-box p {
  color: #ffcc00;
  font-size: 0.7rem;
  margin: 0;
  line-height: 1.4;
}

/* Storage / Recent Songs Styles */
.storage-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.storage-item {
  padding: 0.6rem 0.8rem;
  background: rgba(255,255,255,0.05);
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.storage-item:hover {
  background: rgba(255,255,255,0.1);
}

.storage-item.selected {
  border-color: var(--primary, #00f3ff);
  background: rgba(0, 243, 255, 0.1);
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
}

.song-info .name {
  color: white;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-info .date {
  color: #666;
  font-size: 0.7rem;
}

.delete-btn {
  width: 24px;
  height: 24px;
  background: rgba(255, 0, 0, 0.2);
  border: none;
  border-radius: 4px;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: rgba(255, 0, 0, 0.4);
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.empty-msg {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.empty-hint {
  color: #555;
  font-size: 0.75rem;
}

.clear-all-btn {
  width: 100%;
  margin-top: 0.8rem;
  padding: 0.5rem;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  color: #ff6b6b;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  background: rgba(255, 0, 0, 0.2);
}

.confirm-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.9rem;
  background: var(--primary, #00f3ff);
  color: black;
  border: none;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 243, 255, 0.3);
}

.confirm-btn:disabled {
  background: #333;
  color: #555;
  cursor: not-allowed;
}

.highlight {
  color: var(--primary, #00f3ff);
}
</style>
