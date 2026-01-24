<template>
  <div v-if="isOpen" class="guide-overlay" @click.self="close">
    <div class="guide-modal">
      <div class="guide-header">
        <h2>★ GAME GUIDE ★</h2>
        <button class="close-btn" @click="close">×</button>
      </div>
      
      <div class="guide-content">
        <transition name="slide-fade" mode="out-in">
          <div :key="currentStep" class="step-container">
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
          </div>
        </transition>
      </div>

      <div class="guide-footer">
        <div class="dots">
          <span 
            v-for="(s, i) in steps" 
            :key="i"
            :class="{ active: i === currentStep }"
            @click="currentStep = i"
          ></span>
        </div>
        <div class="buttons">
          <button v-if="currentStep > 0" class="btn prev" @click="prev">이전</button>
          <button v-if="currentStep < steps.length - 1" class="btn next" @click="next">다음</button>
          <button v-else class="btn start" @click="close">시작하기!</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  modelValue?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'close']);

const isOpen = ref(true);
const currentStep = ref(0);

const steps = [
  {
    title: '기본 조작',
    desc: '스페이스바나 마우스 왼쪽 버튼을 길게 누르면 위로 올라가고, 떼면 아래로 내려옵니다. 파도처럼 리듬을 타보세요!'
  },
  {
    title: '포탈 시스템',
    desc: '다양한 포탈을 통과하면 속도가 빨라지거나, 중력이 반대로 바뀌거나, 기체가 작아집니다. 변화에 빠르게 적응하세요!'
  },
  {
    title: '생존 전략',
    desc: '음악의 비트에 맞춰 장애물이 등장합니다. 눈으로만 보지 말고, 귀로 들으며 리듬을 타면 더 쉽게 피할 수 있습니다.'
  }
];

const next = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  } else {
    close();
  }
};

const prev = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const close = () => {
  isOpen.value = false;
  emit('update:modelValue', false);
  emit('close');
  localStorage.setItem('umm_guide_seen', 'true');
};

onMounted(() => {
  // Check local storage if user has seen guide?
  // User asked for guide addition explicitly, so maybe always show or check usage.
  // For now, default Open, but respect logic if controlled by parent.
});
</script>

<style scoped>
.guide-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

.guide-modal {
  width: 90%;
  max-width: 500px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  box-shadow: 0 0 40px rgba(0, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.guide-header {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.guide-header h2 {
  margin: 0;
  color: #00ffff;
  font-size: 1.5rem;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 2rem;
  cursor: pointer;
  line-height: 0.5;
  transition: color 0.2s;
}

.close-btn:hover { color: #fff; }

.guide-content {
  padding: 2rem;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.5rem;
  width: 100%;
}

.demo-box {
  width: 100%;
  height: 150px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.input-demo {
  flex-direction: row;
}

.key-icon {
  padding: 0.8rem 1.2rem;
  border: 2px solid #fff;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px 0 #fff;
  transform: translateY(-4px);
}

.key-icon.space { width: 120px; }

.portal-demo {
  color: white;
  align-items: flex-start;
  padding: 0 2rem;
  gap: 0.8rem;
}

.portal-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
}

.p-icon {
  display: inline-flex;
  width: 30px; height: 30px;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-weight: bold;
}

.p-icon.speed { color: #44ff44; border: 1px solid #44ff44; }
.p-icon.gravity { color: #ffff00; border: 1px solid #ffff00; }
.p-icon.mini { color: #ff66cc; border: 1px solid #ff66cc; font-size: 0.8rem; }

.tips-demo {
  align-items: flex-start;
  padding: 0 1.5rem;
  font-size: 1rem;
  line-height: 1.6;
}

.step-text h3 {
  color: white;
  margin-bottom: 0.5rem;
  font-size: 1.4rem;
}

.step-text p {
  color: #aaa;
  line-height: 1.5;
  margin: 0;
}

.guide-footer {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dots {
  display: flex;
  gap: 8px;
}

.dots span {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s;
}

.dots span.active {
  background: #00ffff;
  transform: scale(1.2);
}

.buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn.prev {
  background: transparent;
  color: #888;
}

.btn.next {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn.start {
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  color: black;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
}

.btn:hover {
  transform: translateY(-2px);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
