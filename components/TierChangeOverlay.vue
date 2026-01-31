<template>
  <Teleport to="body">
    <Transition name="tier-overlay">
      <div v-if="show" class="tier-overlay">
        <div class="tier-content" :class="{ promotion: isPromotion, demotion: !isPromotion }">
          <div class="tier-badge old" :style="{ color: oldTierColor }">
            <span class="tier-icon">{{ oldTierIcon }}</span>
            <span class="tier-name">{{ oldTierName }}</span>
          </div>
          
          <div class="arrow-container">
            <div class="arrow" :class="{ up: isPromotion, down: !isPromotion }">
              {{ isPromotion ? '▲' : '▼' }}
            </div>
          </div>
          
          <div class="tier-badge new" :style="{ color: newTierColor }">
            <span class="tier-icon pulse">{{ newTierIcon }}</span>
            <span class="tier-name">{{ newTierName }}</span>
          </div>
          
          <h2 class="title" :class="{ promotion: isPromotion }">
            {{ isPromotion ? '승급!' : '강등' }}
          </h2>
          <p class="subtitle">
            {{ isPromotion ? 'PROMOTION' : 'DEMOTION' }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'

interface Props {
  show: boolean
  oldTierName?: string
  oldTierIcon?: string
  oldTierColor?: string
  newTierName?: string
  newTierIcon?: string
  newTierColor?: string
  isPromotion?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  oldTierName: 'Bronze',
  oldTierIcon: '🥉',
  oldTierColor: '#cd7f32',
  newTierName: 'Silver',
  newTierIcon: '🥈',
  newTierColor: '#c0c0c0',
  isPromotion: true
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

// Auto-close after 3.5 seconds
watch(() => props.show, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      emit('close')
    }, 3500)
  }
})
</script>

<style scoped>
.tier-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(10px);
}

.tier-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem;
  background: rgba(20, 20, 40, 0.9);
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.tier-content.promotion {
  border-color: rgba(255, 215, 0, 0.5);
  box-shadow: 0 0 60px rgba(255, 215, 0, 0.3);
}

.tier-content.demotion {
  border-color: rgba(255, 0, 0, 0.3);
  box-shadow: 0 0 60px rgba(255, 0, 0, 0.2);
}

.tier-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.tier-badge.old {
  opacity: 0.5;
  transform: scale(0.8);
}

.tier-badge.new {
  transform: scale(1.2);
}

.tier-icon {
  font-size: 4rem;
}

.tier-icon.pulse {
  animation: pulse 1s infinite;
}

.tier-name {
  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.arrow-container {
  padding: 1rem 0;
}

.arrow {
  font-size: 2rem;
  animation: bounce 0.8s infinite;
}

.arrow.up {
  color: #00ff88;
}

.arrow.down {
  color: #ff4444;
}

.title {
  font-size: 3rem;
  font-weight: 900;
  margin: 0;
  text-shadow: 0 0 30px currentColor;
}

.title.promotion {
  color: #ffd700;
}

.title:not(.promotion) {
  color: #ff4444;
}

.subtitle {
  color: #888;
  font-size: 1rem;
  letter-spacing: 3px;
  margin: 0;
}

@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.tier-overlay-enter-active {
  animation: fadeIn 0.3s ease-out;
}

.tier-overlay-leave-active {
  animation: fadeOut 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>
