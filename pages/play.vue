<template>
  <div class="play-page">
    <div class="background-anim"></div>
    
    <!-- Step 1: Song Selection -->
    <div v-if="step === 'upload'" class="setup-container">
      <div v-if="isAnalyzing" class="processing-overlay">
         <div class="loader-content">
            <div class="wave-loader">◆</div>
            <h2>맵 생성 중...</h2>
            <div class="progress-bar"><div class="fill"></div></div>
            <p>비트를 분석하고 장애물을 배치하고 있습니다</p>
         </div>
      </div>
      
      <div class="header-icon">◆</div>
      <h1 class="title">ULTRA MUSIC MANIA</h1>
      <p class="desc" v-if="!loadedMapData">음악 파일을 선택하면 자동으로 맵이 생성됩니다</p>
      <p class="desc map-notice" v-else>
        로드된 맵: <strong>{{ loadedMapData.title }}</strong><br>
        게임을 시작하려면 이 맵에 사용된 노래 파일을 선택해주세요.
      </p>
      <SongSelector @select="handleSongSelect" />
      
      <div class="difficulty-select">
        <div class="diff-header">
          <label>난이도 설정:</label>
          <span class="diff-value" :style="{ color: getDifficultyColor(difficulty) }">
            {{ difficultyName }} ({{ difficulty }})
          </span>
        </div>
        <div class="slider-container">
          <input 
            type="range" 
            min="1" 
            max="30" 
            v-model.number="difficulty" 
            class="diff-slider"
          >
          <div class="slider-marks">
            <span>EASY</span>
            <span>NORMAL</span>
            <span>HARD</span>
            <span>INSANE</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Game -->
    <GameCanvas 
      v-if="step === 'play'"
      :audioBuffer="audioBuffer"
      :obstacles="obstacles"
      :sections="sections"
      :loadMap="loadedMapData"
      :difficulty="difficulty"
      @retry="startGame"
      @exit="step = 'upload'"
      @map-ready="handleMapReady"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAudioAnalyzer, type SongSection } from '@/composables/useAudioAnalyzer';
import { useAuth } from '@/composables/useAuth';
import { useRoute } from 'vue-router';

// 플레이 중에는 navbar 숨기기
definePageMeta({
  layout: 'game'
});

const step = ref<'upload' | 'play'>('upload');
const selectedSong = ref<File | null>(null);
const { analyzeAudio } = useAudioAnalyzer();

// Game Data
const audioBuffer = ref<AudioBuffer | null>(null);
const obstacles = ref<number[]>([]);
const sections = ref<SongSection[]>([]);
const isAnalyzing = ref(false);
const loadedMapData = ref<any>(null);
const { user } = useAuth();
const route = useRoute();

// Difficulty
const difficulty = ref(10);

const difficultyName = computed(() => {
  if (difficulty.value < 8) return 'EASY';
  if (difficulty.value < 16) return 'NORMAL';
  if (difficulty.value < 24) return 'HARD';
  return 'IMPOSSIBLE';
});

const getDifficultyColor = (d: number) => {
  if (d < 8) return '#00ff88';
  if (d < 16) return '#ffff00';
  if (d < 24) return '#ff8800';
};


const handleSongSelect = async (file: File) => {
  selectedSong.value = file;
  isAnalyzing.value = true;
  
  await new Promise(r => setTimeout(r, 100));

  try {
    if (loadedMapData.value) {
      // 로드된 맵이 있으면 분석을 건너뛰고 오디오만 로드
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await audioCtx.decodeAudioData(arrayBuffer);
      audioBuffer.value = buffer;
      // 맵 데이터는 이미 onMounted에서 세팅됨
    } else {
      const result = await analyzeAudio(file, difficulty.value);
      audioBuffer.value = result.buffer;
      obstacles.value = result.obstacles;
      sections.value = result.sections;
    }
    
    isAnalyzing.value = false;
    step.value = 'play';
  } catch (e) {
    console.error(e);
    isAnalyzing.value = false;
    alert("오디오 분석 또는 로드에 실패했습니다");
  }
};

const startGame = () => {
  step.value = 'play';
};

const handleMapReady = async (mapData: any) => {
  // 생성된 맵을 서버에 저장
  if (!selectedSong.value) return;
  
  try {
    await $fetch('/api/maps', {
      method: 'POST',
      body: {
        title: selectedSong.value.name.substring(0, 100),
        difficulty: mapData.difficulty,
        seed: obstacles.value.length * 777 + Math.floor(mapData.duration * 100),
        beatTimes: obstacles.value,
        sections: sections.value,
        engineObstacles: mapData.engineObstacles,
        enginePortals: mapData.enginePortals,
        autoplayLog: mapData.autoplayLog,
        duration: mapData.duration,
        creatorName: user.value?.username || 'Guest'
      }
    });
    console.log("Map saved successfully");
  } catch (e) {
    console.error("Failed to save map:", e);
  }
};

const handleMapOnlyStart = async (targetMap: any) => {
  loadedMapData.value = targetMap;
  obstacles.value = targetMap.beatTimes;
  sections.value = targetMap.sections;
  difficulty.value = targetMap.difficulty;
  
  // Create silent buffer
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const buffer = audioCtx.createBuffer(1, Math.max(1, audioCtx.sampleRate * (targetMap.duration || 10)), audioCtx.sampleRate);
  audioBuffer.value = buffer;
  
  step.value = 'play';
};

const initFromQuery = async () => {
  const mapId = route.query.map || route.query.mapId;
  if (!mapId) return;

  try {
    const targetMap: any = await $fetch(`/api/maps/${mapId}`);
    if (targetMap) {
      if (route.query.map) {
        // ?map=id 인 경우 바로 시작 (무음)
        await handleMapOnlyStart(targetMap);
      } else {
        // ?mapId=id 인 경우 노래 선택 대기
        loadedMapData.value = targetMap;
        obstacles.value = targetMap.beatTimes;
        sections.value = targetMap.sections;
        difficulty.value = targetMap.difficulty;
      }
    }
  } catch (e) {
    console.error("Failed to load map:", e);
  }
};

onMounted(initFromQuery);

// 쿼리 파라미터 변경 감지 (예: 다른 맵으로 이동 시)
watch(() => route.query.map, (newMap) => {
  if (newMap) initFromQuery();
});
watch(() => route.query.mapId, (newMapId) => {
  if (newMapId) initFromQuery();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;700;900&display=swap');

.play-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #050510;
  color: white;
  font-family: 'Outfit', sans-serif;
  overflow: hidden;
  position: relative;
}

.background-anim {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%);
  z-index: 0;
}

.setup-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
  z-index: 10;
  animation: fadeIn 0.5s ease-out;
  padding: 2rem;
}

.header-icon {
  font-size: 4rem;
  color: #00ffff;
  text-shadow: 0 0 30px #00ffff;
  transform: rotate(-45deg);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { 
    transform: rotate(-45deg) scale(1);
    filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.5));
  }
  50% { 
    transform: rotate(-45deg) scale(1.1);
    filter: drop-shadow(0 0 40px rgba(255, 0, 255, 0.7));
  }
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

.desc {
  color: #888;
  font-size: 1rem;
  margin-bottom: 1rem;
  text-align: center;
}

.map-notice {
  color: #00ffff;
  background: rgba(0, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 12px;
  border: 1px dashed #00ffff;
}

.map-notice strong {
  color: #fff;
  font-size: 1.2rem;
}

.difficulty-select {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
  width: 100%;
}

.diff-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.diff-header label {
  color: #666;
  font-size: 0.9rem;
  letter-spacing: 2px;
}

.diff-value {
  font-size: 1.2rem;
  font-weight: 900;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.slider-container {
  width: 100%;
}

.diff-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.diff-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  transition: transform 0.2s;
}

.diff-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.slider-marks {
  display: flex;
  justify-content: space-between;
  margin-top: 0.8rem;
  color: #444;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
}

/* Loader */
.processing-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.loader-content { 
  text-align: center; 
}

.wave-loader {
  font-size: 5rem;
  color: #00ffff;
  transform: rotate(-45deg);
  animation: spin 2s linear infinite;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 30px #00ffff;
}

@keyframes spin {
  0% { transform: rotate(-45deg); }
  100% { transform: rotate(315deg); }
}

.loader-content h2 { 
  margin-bottom: 1.5rem; 
  background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.5rem;
}

.loader-content p {
  color: #666;
  font-size: 0.9rem;
}

.progress-bar {
  width: 300px; 
  height: 4px; 
  background: rgba(255,255,255,0.1); 
  margin: 0 auto 1rem; 
  position: relative; 
  overflow: hidden;
  border-radius: 2px;
}

.fill {
  position: absolute; 
  top: 0; 
  left: 0; 
  height: 100%; 
  width: 50%;
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  animation: load 1s infinite linear;
  border-radius: 2px;
}

@keyframes load {
  0% { left: -50%; }
  100% { left: 100%; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
