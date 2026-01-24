<template>
  <div class="guide-page">
    <div class="background-anim"></div>
    <div class="guide-container">
      <h1 class="page-title">GAME GUIDE</h1>
      
      <!-- Reuse the content structure from GameGuide but inline -->
      <div class="guide-card">
        <div class="step-image">
          <div v-if="currentStep === 0" class="demo-box input-demo">
            <div class="key-icon space">SPACE</div>
            <div class="key-icon mouse">CLICK</div>
            <p>누르고 있으면 <strong>상승</strong><br>떼면 <strong>하강</strong></p>
          </div>

          <div v-if="currentStep === 1" class="demo-box portal-demo">
            <div class="portal-row">
              <span class="p-icon speed">>></span>
              <span>속도 변화</span>
            </div>
            <div class="portal-row">
              <span class="p-icon gravity">⟳</span>
              <span>중력 반전</span>
            </div>
            <div class="portal-row">
              <span class="p-icon mini">◆</span>
              <span>미니 모드</span>
            </div>
          </div>

          <div v-if="currentStep === 2" class="demo-box tips-demo">
            <div class="tip-item">⚡ <strong>붉은색</strong>은 장애물입니다. 피하세요!</div>
            <div class="tip-item">🎵 <strong>박자</strong>에 맞춰 움직이는게 중요합니다.</div>
            <div class="tip-item">★ <strong>100%</strong> 완주에 도전하세요!</div>
          </div>
        </div>

        <div class="step-text">
          <h3>{{ steps[currentStep].title }}</h3>
          <p>{{ steps[currentStep].desc }}</p>
        </div>

        <div class="guide-nav">
           <button 
             v-for="(s, i) in steps" 
             :key="i"
             class="nav-dot"
             :class="{ active: i === currentStep }"
             @click="currentStep = i"
           >
             {{ s.title }}
           </button>
        </div>
      </div>

       <div class="actions">
         <NuxtLink to="/play" class="action-btn">PLAY NOW</NuxtLink>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const currentStep = ref(0);
const steps = [
  {
    title: '기본 조작 (CONTROLS)',
    desc: '스페이스바나 마우스 왼쪽 버튼을 길게 누르면 위로 올라가고, 떼면 아래로 내려옵니다. 파도처럼 리듬을 타보세요!'
  },
  {
    title: '포탈 시스템 (PORTALS)',
    desc: '다양한 포탈을 통과하면 속도가 빨라지거나, 중력이 반대로 바뀌거나, 기체가 작아집니다. 변화에 빠르게 적응하세요!'
  },
  {
    title: '생존 전략 (STRATEGY)',
    desc: '음악의 비트에 맞춰 장애물이 등장합니다. 눈으로만 보지 말고, 귀로 들으며 리듬을 타면 더 쉽게 피할 수 있습니다.'
  }
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;700;900&display=swap');

.guide-page {
  min-height: 100vh;
  background: #050510;
  color: white;
  font-family: 'Outfit', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 2rem 2rem 250px; /* Nav width */
  position: relative;
  overflow: hidden;
}

.background-anim {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at 70% 30%, #1a1a3a 0%, #000 100%);
  z-index: 0;
}

.guide-container {
  z-index: 10;
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: 4px;
  background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  text-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
}

.guide-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 0 60px rgba(0,0,0,0.6);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  min-height: 500px;
}

.step-image {
  width: 100%;
}

.demo-box {
  width: 100%;
  height: 200px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.input-demo { flex-direction: row; }

.key-icon {
  padding: 1rem 1.5rem;
  border: 2px solid #fff;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.5rem;
  box-shadow: 0 4px 0 #fff;
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.1);
}

.portal-demo {
  color: white;
  align-items: flex-start;
  padding: 0 3rem;
  justify-content: center;
}

.portal-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 1.3rem;
}

.p-icon {
  display: inline-flex;
  width: 40px; height: 40px;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-weight: bold;
}

.p-icon.speed { color: #44ff44; border: 1px solid #44ff44; }
.p-icon.gravity { color: #ffff00; border: 1px solid #ffff00; }
.p-icon.mini { color: #ff66cc; border: 1px solid #ff66cc; font-size: 1rem; }

.tips-demo {
  align-items: flex-start;
  padding: 0 3rem;
  font-size: 1.2rem;
  line-height: 1.8;
  justify-content: center;
}

.step-text {
  text-align: center;
  max-width: 600px;
}

.step-text h3 {
  color: #00ffff;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.step-text p {
  color: #ccc;
  font-size: 1.1rem;
  line-height: 1.6;
}

.guide-nav {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}

.nav-dot {
  padding: 0.8rem 1.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #666;
  border-radius: 30px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.nav-dot.active {
  background: #00ffff;
  color: #000;
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
}

.nav-dot:hover:not(.active) {
  border-color: #fff;
  color: #fff;
}

.actions {
  margin-top: 1rem;
}

.action-btn {
  padding: 1rem 3rem;
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  color: black;
  font-weight: 900;
  font-size: 1.2rem;
  text-decoration: none;
  border-radius: 50px;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
  transition: transform 0.2s;
  display: inline-block;
}

.action-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 50px rgba(0, 255, 255, 0.5);
}
</style>
