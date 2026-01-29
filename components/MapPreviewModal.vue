<template>
  <div class="map-preview-modal-overlay">
    <div class="map-preview-modal glass-panel">
      <div class="modal-header">
        <h2>MAP VISUALIZATION LOGIC</h2>
        <div class="legend">
          <span class="legend-item"><span class="color-box note"></span> Piano Notes (Beats)</span>
          <span class="legend-item"><span class="color-box path"></span> Path (Trajectory)</span>
          <span class="legend-item"><span class="color-box obstacle"></span> Obstacles</span>
        </div>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="preview-viewport">
        <div class="scroll-container" ref="scrollContainer">
          <canvas ref="canvas" :width="canvasWidth" :height="720"></canvas>
        </div>
      </div>
      
      <div class="info-footer">
        <p>Total Duration: {{ duration.toFixed(1) }}s</p>
        <p>Total Length: {{ canvasWidth }}px</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';

const props = defineProps<{
  mapData: any;
}>();

const emit = defineEmits(['close']);

const canvas = ref<HTMLCanvasElement | null>(null);
const scrollContainer = ref<HTMLDivElement | null>(null);

const scale = 0.5; // Scale down for preview
const baseSpeed = 350; // Pixels per second

const duration = computed(() => props.mapData?.duration || 60);
const canvasWidth = computed(() => Math.ceil(duration.value * baseSpeed * scale) + 500);

const drawMap = () => {
  if (!canvas.value || !props.mapData) return;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;
  
  const w = canvas.value.width;
  const h = canvas.value.height;
  
  // Clear
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, w, h);
  
  // Grid (background)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 100 * scale;
  
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 40 * scale) { // 40px grid roughly
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  
  // Draw Bounds (Ceiling/Floor)
  ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';
  ctx.fillRect(0, 0, w, 140 * scale); // Top margin area (approx)
  
  ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
  const bottomBound = (720 - 140) * scale; // Assuming fixed internal height logic mapped to canvas
  
  // Our game engine logic: minY=140, maxY=580. Canvas height=720.
  // We need to map game coordinates (0~720) to preview canvas coordinates (also 0~720 but scaled?)
  // Wait, if canvas height is fixed 720, we should use 1:1 Y scale or scaled Y?
  // Let's use 1:1 Y scale for vertical clarity, but compress X.
  // Or scale both. If we scale both, 720 becomes 360.
  // The canvas height is defined as 720 in template. 
  // Let's use scale for X, and keep Y 1:1 to see details clearly? Or Scale Y too?
  // If we don't scale Y, the map is tall. scrollable X.
  // User asked for "Shrunk map". 
  // Let's keep Y 1:1 so we can see the full height, just scroll X.
  // Actually, let's keep aspect ratio.
  
  const drawScaleX = scale;
  const drawScaleY = 1.0; // Keep Y 1:1 for better visibility of notes/path height

  // 1. Draw "Piano Notes" (Beats) as vertical lines
  if (props.mapData.beatTimes) {
    ctx.lineWidth = 2;
    props.mapData.beatTimes.forEach((time: number) => {
      const x = time * baseSpeed * drawScaleX;
      
      // Draw a "Note" line
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)'; // Yellowish
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
      
      // Note indicator at bottom
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(x - 2, h - 20, 4, 10);
    });
  }
  
  // 2. Draw Obstacles
  if (props.mapData.engineObstacles) {
    ctx.fillStyle = '#ff4444';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    
    props.mapData.engineObstacles.forEach((obs: any) => {
      const x = obs.x * drawScaleX;
      const y = obs.y * drawScaleY;
      const w = obs.width * drawScaleX;
      const h = obs.height * drawScaleY;
      
      if (obs.type === 'spike' || obs.type === 'mini_spike') {
         ctx.beginPath();
         // Simple triangle representation
         if (obs.y > 300) { // Bottom spike
            ctx.moveTo(x, y + h); ctx.lineTo(x + w/2, y); ctx.lineTo(x + w, y + h);
         } else { // Top spike
            ctx.moveTo(x, y); ctx.lineTo(x + w/2, y + h); ctx.lineTo(x + w, y);
         }
         ctx.fill(); 
      } else {
         ctx.fillRect(x, y, w, h);
      }
    });
  }
  
  // 3. Draw Path (AutoplayLog)
  if (props.mapData.autoplayLog && props.mapData.autoplayLog.length > 0) {
    ctx.beginPath();
    ctx.strokeStyle = '#00ffff'; // Cyan path
    ctx.lineWidth = 4;
    
    let first = true;
    props.mapData.autoplayLog.forEach((p: any) => {
      const x = p.x * drawScaleX;
      const y = p.y * drawScaleY;
      
      if (first) {
        ctx.moveTo(x, y);
        first = false;
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }
};

onMounted(() => {
  drawMap();
});

watch(() => props.mapData, drawMap);
</script>

<style scoped>
.map-preview-modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.map-preview-modal {
  width: 95vw;
  height: 90vh;
  background: #0f0f1f;
  border: 1px solid #444;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 12px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: white;
}

.legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  font-size: 0.9rem;
}

.color-box {
  width: 16px; height: 16px;
  display: inline-block;
  border-radius: 4px;
}

.color-box.note { background: rgba(255, 255, 0, 0.5); border: 1px solid #ff0; }
.color-box.path { background: #00ffff; }
.color-box.obstacle { background: #ff4444; }

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
}

.preview-viewport {
  flex: 1;
  background: #000;
  overflow: hidden;
  border: 1px solid #333;
  position: relative;
}

.scroll-container {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

.info-footer {
  margin-top: 10px;
  color: #666;
  font-size: 0.8rem;
  display: flex;
  gap: 20px;
}
</style>
