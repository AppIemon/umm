<template>
  <div class="rankings-page">
    <div class="background-anim"></div>
    <div class="header">
      <h1 class="title">HALL OF SYNC</h1>
      <NuxtLink to="/" class="back-btn">← BACK</NuxtLink>
    </div>
    
    <div class="rank-list glass-panel">
      <div v-if="scores.length === 0" class="no-scores">NO DATA RECORDED</div>
      <div v-else v-for="(s, i) in scores" :key="i" class="rank-item">
        <div class="rank-pos" :class="{ 'top-3': i < 3 }">#{{ i + 1 }}</div>
        <div class="score-data">
          <span class="score-val">{{ s.score }}</span>
          <span class="score-label">TILES</span>
        </div>
        <span class="date">{{ new Date(s.date).toLocaleDateString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const scores = ref([]);

onMounted(() => {
  const data = localStorage.getItem('impossibletiming_scores');
  if (data) {
    scores.value = JSON.parse(data).sort((a,b) => b.score - a.score);
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;700;900&display=swap');

.rankings-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px;
  min-height: 100vh;
  background: #050510;
  color: white;
  font-family: 'Outfit', sans-serif;
  position: relative;
  overflow: hidden;
}

.background-anim {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at 50% 10%, #1a1a3a 0%, #000 100%);
  z-index: 0;
}

.header {
  z-index: 10;
  text-align: center;
  margin-bottom: 3rem;
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.title {
  font-size: 3rem;
  color: #4d94ff;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 5px;
  text-shadow: 0 0 30px rgba(77, 148, 255, 0.4);
  margin: 0;
}

.back-btn {
  color: #666;
  text-decoration: none;
  font-weight: bold;
  letter-spacing: 2px;
  font-size: 0.9rem; 
  transition: color 0.3s;
}
.back-btn:hover {
  color: white;
}

.rank-list {
  z-index: 10;
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  font-family: 'Outfit', sans-serif;
}

.glass-panel {
  background: rgba(20, 20, 30, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 0 50px rgba(0,0,0,0.5);
}

.no-scores {
  text-align: center;
  color: #444;
  font-style: italic;
  padding: 2rem;
}

.rank-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: transform 0.2s;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-item:hover {
  background: rgba(255,255,255,0.02);
  transform: translateX(10px);
}

.rank-pos {
  font-size: 1.5rem;
  font-weight: 900;
  color: #444;
  width: 60px;
}

.rank-pos.top-3 {
  color: #ff4d4d;
  text-shadow: 0 0 10px rgba(255, 77, 77, 0.5);
}

.score-data {
  flex-grow: 1;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.score-val {
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.score-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: bold;
}

.date {
  color: #666;
  font-size: 0.9rem;
  font-family: monospace;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .rankings-page {
    padding: 1.5rem 1rem;
  }
  
  .title {
    font-size: 1.5rem;
    letter-spacing: 2px;
  }
  
  .glass-panel {
    padding: 1rem;
  }
  
  .rank-item {
    padding: 1rem 0.8rem;
  }
  
  .rank-pos {
    font-size: 1.1rem;
    width: 40px;
  }
  
  .score-val {
    font-size: 1.4rem;
  }
  
  .score-label {
    font-size: 0.65rem;
  }
  
  .date {
    font-size: 0.7rem;
  }
}
</style>
