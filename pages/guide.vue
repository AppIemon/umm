<template>
  <div class="guide-page">
    <div class="background-anim"></div>
    
    <!-- Game Mode -->
    <div v-if="isGameMode" class="game-view">
      <GameCanvas 
        class="guide-game"
        :audioBuffer="audioBuffer"
        :obstacles="mapData.beatTimes"
        :sections="mapData.sections"
        :loadMap="mapData"
        :difficulty="1"
        :tutorialMode="true"
        :invincible="false"
        @exit="isGameMode = false"
        @complete="finishTutorial"
        @progress-update="handleProgress"
      />
      <div v-if="isGameMode" class="tutorial-overlay">
        <div class="message-box" v-if="guideMessage">
          <div class="message-content" v-html="guideMessage"></div>
        </div>
        <div class="key-guide">
          <span>HOLD SPACE = UP</span>
          <span>RELEASE = DOWN</span>
        </div>
        <button class="exit-btn" @click="isGameMode = false">EXIT TUTORIAL</button>
      </div>
    </div>

    <!-- Guide Content -->
    <div v-else class="guide-container">
      <h1 class="page-title">GAME GUIDE</h1>
      
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
         <button @click="startTutorialGame" class="action-btn tutorial-btn">
           🎮 TRY TUTORIAL GAME
         </button>
         <NuxtLink to="/play" class="action-btn play-btn">PLAY REAL GAME</NuxtLink>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GameCanvas from '@/components/GameCanvas.vue';
import { GameEngine } from '@/utils/game-engine';

const currentStep = ref(0);
const isGameMode = ref(false);
const audioBuffer = ref<AudioBuffer | null>(null);
const mapData = ref<any>(null);
const guideMessage = ref<string>('');

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

const startTutorialGame = () => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const duration = 60; // 60 seconds tutorial
  const sampleRate = audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, sampleRate * duration, sampleRate);
  
  audioBuffer.value = buffer;
  mapData.value = generateEasyMap(duration);
  guideMessage.value = "튜토리얼을 시작합니다.<br>장애물을 피해 끝까지 생존하세요!";
  
  isGameMode.value = true;
};

const finishTutorial = () => {
  alert("훌륭합니다! 이제 실전으로 갈 준비가 되었습니다.");
  isGameMode.value = false;
};

const handleProgress = (data: { progress: number }) => {
  const p = data.progress; // 0 to 100
  
  if (p < 5) guideMessage.value = "튜토리얼을 시작합니다.<br>장애물을 피해 끝까지 생존하세요!";
  else if (p < 15) guideMessage.value = "바닥의 가시는 <strong>점프(클릭 유지)</strong>하여 피하세요.";
  else if (p < 25) guideMessage.value = "천장의 가시는 <strong>버튼을 떼서</strong> 피하세요.";
  else if (p < 35) guideMessage.value = "<strong>속도 변화 포탈</strong>입니다.<br>속도가 느려지거나 빨라집니다.";
  else if (p < 45) guideMessage.value = "중앙에 있는 <strong>톱니바퀴</strong>와 <strong>레이저</strong>를 주의하세요!";
  else if (p < 55) guideMessage.value = "이제 <strong>미니 모드</strong>입니다.<br>몸이 작아지고 더 민첩해집니다.";
  else if (p < 65) guideMessage.value = "좁은 틈 사이를 조심해서 통과하세요!";
  else if (p < 75) guideMessage.value = "<strong>중력 반전</strong>!<br>이제 위아래 조작이 반대가 됩니다.";
  else if (p < 85) guideMessage.value = "빠른 속도에 적응하세요!<br>마지막 관문입니다.";
  else if (p < 95) guideMessage.value = "거의 다 왔습니다! 조금만 더!";
  else guideMessage.value = "축하합니다!<br>튜토리얼 완료!";
};

const generateEasyMap = (duration: number) => {
  const obstacles: any[] = [];
  const portals: any[] = [];
  
  // 1. Basic Spikes (Bottom & Top) - 0% ~ 20%
  obstacles.push({ x: 800, y: 500, width: 50, height: 40, type: 'spike' });
  obstacles.push({ x: 1200, y: 500, width: 50, height: 40, type: 'spike' });
  obstacles.push({ x: 1600, y: 150, width: 50, height: 50, type: 'spike' }); 
  obstacles.push({ x: 2000, y: 150, width: 50, height: 50, type: 'spike' });

  // 2. Speed Changes (0.5x -> 2x) - 20% ~ 40%
  // Slow down (0.5x)
  portals.push({ x: 2500, y: 150, width: 64, height: 600, type: 'speed_0.5', activated: false });
  obstacles.push({ x: 3000, y: 360, width: 60, height: 60, type: 'block' }); // Easy block
  
  // Normal Speed
  portals.push({ x: 3500, y: 150, width: 64, height: 600, type: 'speed_1', activated: false });
  
  // Speed Up (2x)
  portals.push({ x: 3800, y: 150, width: 64, height: 600, type: 'speed_2', activated: false });
  obstacles.push({ x: 4200, y: 500, width: 50, height: 50, type: 'spike' }); // Faster jump

  // Back to Normal
  portals.push({ x: 4600, y: 150, width: 64, height: 600, type: 'speed_1', activated: false });

  // 3. New Obstacles (Saw, Laser) - 40% ~ 50%
  obstacles.push({ x: 5000, y: 360, width: 80, height: 80, type: 'saw' }); // Center Saw
  obstacles.push({ x: 5500, y: 100, width: 20, height: 200, type: 'v_laser' }); // High laser
  obstacles.push({ x: 5500, y: 620, width: 20, height: 100, type: 'v_laser' }); // Low laser

  // 4. Mini Mode - 50% ~ 70%
  portals.push({ x: 6000, y: 150, width: 64, height: 600, type: 'mini_pink', activated: false });
  
  // Mini obstacles (tighter gaps but mini is small)
  obstacles.push({ x: 6500, y: 300, width: 40, height: 40, type: 'spike_ball' });
  obstacles.push({ x: 6800, y: 400, width: 40, height: 40, type: 'spike_ball' });
  
  obstacles.push({ x: 7200, y: 200, width: 50, height: 50, type: 'block' });
  obstacles.push({ x: 7200, y: 520, width: 50, height: 50, type: 'block' }); 
  
  // Restore Size
  portals.push({ x: 7800, y: 150, width: 64, height: 600, type: 'mini_green', activated: false });

  // 5. Gravity Inversion - 70% ~ 90%
  portals.push({ x: 8200, y: 150, width: 64, height: 600, type: 'gravity_yellow', activated: false });
  obstacles.push({ x: 8700, y: 150, width: 50, height: 50, type: 'spike' }); // On 'floor' (top)
  obstacles.push({ x: 9200, y: 200, width: 50, height: 50, type: 'spike' }); 

  // Restore Gravity
  portals.push({ x: 9700, y: 150, width: 64, height: 600, type: 'gravity_blue', activated: false });

  // 6. Final Rush - 90% ~ 100%
  obstacles.push({ x: 10200, y: 450, width: 60, height: 60, type: 'saw' });

  return {
    title: 'TUTORIAL COMPLETE',
    difficulty: 1,
    seed: 12345,
    engineObstacles: obstacles,
    enginePortals: portals,
    autoplayLog: [], // User plays
    duration: duration,
    beatTimes: [], // No beats
    sections: [],
    bpm: 120,
    measureLength: 2.0
  };
};
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
  padding: 0; 
  position: relative;
  overflow: hidden;
}

.game-view {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.tutorial-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  align-items: center; 
  pointer-events: none;
}

.message-box {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #00ffff;
  padding: 1.5rem 3rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
  animation: slideDown 0.5s ease-out;
  pointer-events: auto;
}

.message-content {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  line-height: 1.4;
}

.message-content strong {
  color: #00ffff;
}

.key-guide {
  position: absolute;
  right: 0;
  top: 0;
  background: rgba(0,0,0,0.5);
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.2);
  display: flex;
  flex-direction: column;
  font-weight: bold;
  color: #00ffff;
  text-align: right;
}

.exit-btn {
  position: absolute;
  top: 100px;
  right: 0;
  pointer-events: auto;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 50, 50, 0.8);
  border: 1px solid #ff0000;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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
  padding: 2rem;
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
  display: flex;
  gap: 1.5rem;
}

.action-btn {
  padding: 1rem 2rem;
  color: white;
  font-weight: 900;
  font-size: 1.1rem;
  text-decoration: none;
  border-radius: 50px;
  transition: transform 0.2s;
  display: inline-block;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 30px rgba(0,0,0,0.3);
}

.tutorial-btn {
  background: linear-gradient(90deg, #44ff44, #00ffff);
  color: black;
  box-shadow: 0 0 30px rgba(68, 255, 68, 0.3);
}

.play-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.3);
}

.action-btn:hover {
  transform: scale(1.05);
}
</style>
