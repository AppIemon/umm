<template>
  <div class="editor-page" :class="{ 'is-mobile': isMobile }">
    <div class="background-anim"></div>
    
    <!-- Top Header -->
    <header class="editor-header glass-panel">
      <div class="header-row">
        <div class="left">
          <h1 class="title">MAP_ARCHITECT <span class="version">v2.0</span></h1>
          <div class="map-meta" v-if="!isMobile">
            <input v-model="mapData.title" placeholder="Map Title" class="map-title-input" />
            <span class="creator">BY: {{ user?.username || 'Guest' }}</span>
          </div>
        </div>
        <div class="right" v-if="!isMobile">
          <div class="config-summary">
            <span class="stat">OBJ: {{ mapData.engineObstacles.length }}</span>
            <span class="stat">PORT: {{ mapData.enginePortals.length }}</span>
          </div>
        </div>
      </div>
      
      <!-- Mobile Title Row -->
      <div class="mobile-title-row" v-if="isMobile">
        <input v-model="mapData.title" placeholder="Map Title" class="map-title-input" />
      </div>
      
      <div class="transport-controls">
        <!-- Mobile Toggles -->
        <button v-if="isMobile" @click="showPalette = !showPalette" class="control-btn mobile-toggle" :class="{ active: showPalette }">
           🎨
        </button>
        
        <button @click="testMap" class="control-btn test" :disabled="isTesting">
          <span class="icon">▶</span> <span v-if="!isMobile">{{ isTesting ? 'TESTING...' : 'TEST' }}</span>
        </button>
        <button @click="togglePreview" class="control-btn tutorial" :class="{ active: isPreviewing }">
          <span class="icon">🎓</span> <span v-if="!isMobile">{{ isPreviewing ? 'STOP' : 'TUTORIAL' }}</span>
        </button>
        <button @click="saveMap" class="control-btn save" :disabled="isSaving">
          <span class="icon">💾</span> <span v-if="!isMobile">{{ isSaving ? 'SAVING...' : 'SAVE' }}</span>
        </button>

        <button @click="showHitboxes = !showHitboxes" class="control-btn" :class="{ active: showHitboxes }">
          <span class="icon">⛶</span> <span v-if="!isMobile">HITBOX</span>
        </button>
        
        <button v-if="isMobile" @click="showProperties = !showProperties" class="control-btn mobile-toggle" :class="{ active: showProperties }">
           ⚙️
        </button>

        <button @click="router.push('/maps')" class="control-btn exit"><span v-if="!isMobile">EXIT</span><span v-else>✕</span></button>
      </div>
    </header>

    <div class="main-layout" :class="{ 'is-mobile': isMobile }">
      <!-- Left Sidebar: Object Types -->
      <aside class="sidebar left-sidebar glass-panel" :class="{ 'mobile-drawer': isMobile, 'open': showPalette }">
        <div class="drawer-header" v-if="isMobile">
           <h3>PALETTE</h3>
           <button @click="showPalette = false" class="close-drawer">✕</button>
        </div>
        <h3 v-else>PALETTE</h3>
        <div class="object-list">
          <div v-for="type in obstacleTypes" :key="type" 
               class="palette-item" :class="{ selected: selectedPaletteType === type }"
               @click="selectedPaletteType = type">
            <div class="symbol">{{ getSymbol(type) }}</div>
            <span class="name">{{ type.split('_').join(' ').toUpperCase() }}</span>
          </div>
          <div class="separator">PORTALS</div>
          <div v-for="type in portalTypes" :key="type"
               class="palette-item portal" :class="{ selected: selectedPaletteType === type }"
               @click="selectedPaletteType = type">
            <div class="symbol">{{ getPortalSymbol(type) }}</div>
            <span class="name">{{ type.split('_').join(' ').toUpperCase() }}</span>
          </div>
        </div>
      </aside>

      <!-- Center: Workspace (Canvas) -->
      <main class="workspace glass-panel" ref="workspaceRef" 
            @mousedown="onWorkspaceMouseDown" 
            @mousemove="onWorkspaceMouseMove" 
            @mouseup="onWorkspaceMouseUp"
            @touchstart="onWorkspaceTouchStart"
            @touchmove="onWorkspaceTouchMove"
            @touchend="onWorkspaceTouchEnd"
            @wheel="onWorkspaceWheel"
            @contextmenu.prevent>
        
        <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight" class="editor-canvas"></canvas>
        
        <!-- Grid Info Overlay -->
        <div class="grid-info">
          <span>ZOOM: {{ (zoom * 100).toFixed(0) }}%</span>
          <span>X: {{ Math.floor(cameraX) }}</span>
        </div>
        
        <!-- Timeline Tool -->
        <div class="timeline-container">
           <input type="range" min="0" :max="totalLength" v-model.number="cameraX" class="timeline-slider" />
        </div>
      </main>

      <!-- Right Sidebar: Properties -->
      <aside class="sidebar right-sidebar glass-panel" :class="{ 'mobile-drawer': isMobile, 'open': showProperties }">
        <div class="drawer-header" v-if="isMobile">
           <h3>PROPERTIES</h3>
           <button @click="showProperties = false" class="close-drawer">✕</button>
        </div>
        <h3 v-else>PROPERTIES</h3>
        
        <div v-if="selectedObjects.length === 1" class="properties-list">
          <div class="prop-group">
            <label>TYPE</label>
            <span class="prop-val-static">{{ selectedObjects[0].type.toUpperCase() }}</span>
          </div>
          
          <div class="prop-group">
            <label>POSITION X / Y</label>
            <div class="input-pair">
              <input type="number" v-model.number="selectedObjects[0].x" />
              <input type="number" v-model.number="selectedObjects[0].y" />
            </div>
          </div>
          
          <div class="prop-group">
            <label>SIZE W / H</label>
            <div class="input-pair">
              <input type="number" v-model.number="selectedObjects[0].width" />
              <input type="number" v-model.number="selectedObjects[0].height" />
            </div>
          </div>
          
          <div class="prop-group">
            <label>ROTATION (DEG)</label>
            <div class="rotation-controls">
              <button @click="rotateSelected(-45)" title="Rotate -45" class="rot-btn">↺</button>
              <button @click="rotateSelected(45)" title="Rotate 45" class="rot-btn">↻</button>
              <button @click="rotateSelected(90)" title="Rotate 90" class="rot-btn">90°</button>
              <button @click="rotateSelected(180)" title="Rotate 180" class="rot-btn">180°</button>
            </div>
            <div class="input-pair">
              <input type="number" v-model.number="selectedObjects[0].angle" />
              <input type="range" min="0" max="360" v-model.number="selectedObjects[0].angle" />
            </div>
          </div>

          <div class="prop-group" v-if="selectedObjects[0].movement">
            <label>MOVEMENT TYPE</label>
            <select :value="selectedObjects[0].movement.type" @change="setMovementType(($event.target as HTMLSelectElement).value)">
              <option value="none">NONE</option>
              <option value="updown">UP-DOWN</option>
              <option value="leftright">LEFT-RIGHT</option>
              <option value="rotate">ROTATE</option>
              <option value="bounce">BOUNCE</option>
            </select>

            <template v-if="selectedObjects[0].movement.type !== 'none'">
              <label>SPEED / RANGE</label>
              <div class="input-pair">
                <input type="number" step="0.1" v-model.number="selectedObjects[0].movement.speed" placeholder="Speed" />
                <input type="number" v-model.number="selectedObjects[0].movement.range" placeholder="Range" />
              </div>
              <label>PHASE OFFSET</label>
              <input type="number" step="0.1" v-model.number="selectedObjects[0].movement.phase" />
            </template>
          </div>

          <template v-if="['planet', 'star'].includes(selectedObjects[0].type)">
              <div v-if="selectedObjects[0].type === 'planet'">
                <label>ORBIT MOON COUNT</label>
                <input type="number" v-model.number="ensureCustomData(selectedObjects[0]).orbitCount" placeholder="0 or 2" />
              </div>
              <label>ORBIT SPEED</label>
              <input type="number" step="0.1" v-model.number="ensureCustomData(selectedObjects[0]).orbitSpeed" placeholder="Speed" />
              <label>ORBIT DISTANCE</label>
              <input type="number" v-model.number="ensureCustomData(selectedObjects[0]).orbitDistance" placeholder="Distance" />
              
              <div v-if="selectedObjects[0].type === 'star'" class="hint-text">
                 Drag a Planet onto this Star to attach it!
              </div>

              <div v-if="selectedObjects[0].children && selectedObjects[0].children.length > 0" class="children-list">
                 <label>ATTACHED PLANETS: {{ selectedObjects[0].children.length }}</label>
                 <div v-for="(child, idx) in selectedObjects[0].children" :key="idx" class="child-item">
                    <span>Planet {{ idx + 1 }}</span>
                 </div>
              </div>
           </template>

          <button @click="deleteSelected" class="delete-btn">DELETE OBJECT</button>
        </div>
        
        <div v-else-if="selectedObjects.length > 1" class="properties-list">
          <div class="prop-group">
            <label>MULTIPLE SELECTION</label>
            <span class="prop-val-static">{{ selectedObjects.length }} OBJECTS</span>
          </div>
          <button @click="deleteSelected" class="delete-btn">DELETE ALL</button>
        </div>

        <div v-else class="empty-selection">
          SELECT OBJECTS TO MODIFY
        </div>

        <div class="global-settings prop-group">
           <h3>LEVEL CONFIG</h3>
        </div>

        <div class="audio-settings prop-group">
           <h3>AUDIO CONFIG</h3>
           <label>BPM</label>
           <input type="number" v-model.number="mapData.bpm" />
           <label>MEASURE LENGTH (S)</label>
           <input type="number" step="0.1" v-model.number="mapData.measureLength" />
           
           <div class="audio-upload">
              <label>AUDIO FILE</label>
              <button @click="triggerAudioInput" class="upload-btn">
                {{ mapData.audioData ? 'AUDIO LOADED' : 'UPLOAD MP3' }}
              </button>
              <input type="file" ref="audioInputRef" accept="audio/*" style="display:none" @change="handleAudioUpload" />
              <p v-if="mapData.audioData" class="audio-hint">Audio embedded in map data</p>
           </div>
        </div>
      </aside>
    </div>

    <!-- Smart Gen Modal -->
    <div v-if="showSmartGenModal" class="modal-overlay">
      <div class="modal-box glass-panel">
        <h2>SMART MAP GENERATION</h2>
        <div class="progress-section">
          <div class="progress-bar">
            <div class="fill" :style="{ width: smartGenProgress + '%' }"></div>
          </div>
          <span class="status-text">{{ getStatusText(smartGenStatus) }} ({{ (smartGenProgress).toFixed(0) }}%)</span>
        </div>
        
        <div class="log-console">
          <div v-for="(line, i) in smartGenLog" :key="i" class="log-line">{{ line }}</div>
        </div>
        
        <div class="modal-actions">
          <button @click="showSmartGenModal = false" :disabled="isGenerating && smartGenProgress < 100" class="control-btn exit">CLOSE</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { GameEngine, type MapData, type Obstacle, type Portal } from '@/utils/game-engine';
import type { ObstacleType, PortalType } from '@/utils/types';
import { drawObstacle } from '@/utils/canvas-renderer';
import { CHUNK_SIZE, splitBase64ToChunks } from '@/utils/audioUtils';

const router = useRouter();
const { user } = useAuth();
const engine = new GameEngine();

// State
const mapData = ref<any>({
  title: 'NEW UNTITLED MAP',
  duration: 60,
  difficulty: 15,
  engineObstacles: [],
  enginePortals: [],
  beatTimes: [],
  sections: [],
  seed: 0,
  bpm: 120,
  measureLength: 2.0
});

const totalLength = ref(60 * 350 + 500); // Duration * BaseSpeed
const cameraX = ref(0);
const zoom = ref(1.0);
const selectedObjects = ref<any[]>([]);
const selectedPaletteType = ref<string>('spike');
const showHitboxes = ref(true);
const workspaceRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const audioInputRef = ref<HTMLInputElement | null>(null);

const obstacleTypes: ObstacleType[] = ['spike', 'block', 'saw', 'mini_spike', 'laser', 'spike_ball', 'v_laser', 'mine', 'orb', 'slope', 'triangle', 'steep_triangle', 'piston_v', 'falling_spike', 'hammer', 'rotor', 'cannon', 'spark_mine', 'laser_beam', 'crusher_jaw', 'swing_blade', 'growing_spike', 'planet', 'star', 'invisible_wall', 'fake_block'];
const portalTypes: PortalType[] = ['gravity_yellow', 'gravity_blue', 'speed_0.25', 'speed_0.5', 'speed_1', 'speed_2', 'speed_3', 'speed_4', 'mini_pink', 'mini_green', 'teleport_in', 'teleport_out'];

const getSymbol = (type: string) => engine.getPortalSymbol(type as any) || '■';
const getPortalSymbol = (type: string) => engine.getPortalSymbol(type as any);

// Undo/Redo & Clipboard State
const history = ref<string[]>([]);
const historyIdx = ref(-1);
const clipboard = ref<any[]>([]);
const isShiftPressed = ref(false);
const isPreviewing = ref(false);
const previewTime = ref(0);
const previewX = ref(200);
const previewY = ref(360);
const previewTrail = ref<{x: number, y: number}[]>([]);
let lastPreviewFrameTime = 0;
let previewAudioSource: AudioBufferSourceNode | null = null;
let previewAudioBuffer: AudioBuffer | null = null;
let previewAudioCtx: AudioContext | null = null;
const isSelectionBoxActive = ref(false);
const selectionBox = ref({ x1: 0, y1: 0, x2: 0, y2: 0 });

// Mobile State
const isMobile = ref(false);
const showPalette = ref(true);
const showProperties = ref(true);

// Canvas dimensions (responsive)
const canvasWidth = ref(1200);
const canvasHeight = ref(600);

const updateCanvasSize = () => {
  if (!workspaceRef.value) return;
  const rect = workspaceRef.value.getBoundingClientRect();
  // Use devicePixelRatio for sharper rendering on high-DPI displays
  const dpr = window.devicePixelRatio || 1;
  canvasWidth.value = Math.floor(rect.width * dpr);
  canvasHeight.value = Math.floor((rect.height - 40) * dpr); // -40 for timeline
};

const checkMobile = () => {
  const wasMobile = isMobile.value;
  isMobile.value = window.innerWidth <= 768;
  if (!wasMobile && isMobile.value) {
     // Switched to mobile
     showPalette.value = false;
     showProperties.value = false;
  } else if (wasMobile && !isMobile.value) {
     // Switched to desktop
     showPalette.value = true;
     showProperties.value = true;
  }
  // Update canvas size when checking mobile
  setTimeout(updateCanvasSize, 50);
};

// Touch State
let touchStartX = 0;
let touchStartY = 0;
let touchStartCamX = 0;
let lastTouchTime = 0;
let isTouchDragging = false;
let touchDragObject: any = null;

const onWorkspaceTouchStart = (e: TouchEvent) => {
  if (e.touches.length !== 1) return;
  const touch = e.touches[0];
  if (!canvasRef.value) return;
  
  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = canvasRef.value.width / rect.width;
  const scaleY = canvasRef.value.height / rect.height;
  
  const x = ((touch.clientX - rect.left) * scaleX) / zoom.value + cameraX.value;
  const y = ((touch.clientY - rect.top) * scaleY) / zoom.value;
  
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchStartCamX = cameraX.value;
  
  // Check for object selection
  const found = findObjectAt(x, y);
  
  // Double tap to add object
  const now = Date.now();
  if (now - lastTouchTime < 300 && !found) {
    addObject(x, y);
    saveState();
    lastTouchTime = 0;
    return;
  }
  lastTouchTime = now;
  
  if (found) {
    selectedObjects.value = [found];
    isTouchDragging = true;
    touchDragObject = found;
    dragInitialPos.clear();
    dragInitialPos.set(found, { x: found.x - x, y: found.y - y });
  } else {
    // Pan mode
    isTouchDragging = false;
    touchDragObject = null;
  }
};

const onWorkspaceTouchMove = (e: TouchEvent) => {
  if (e.touches.length !== 1) return;
  const touch = e.touches[0];
  if (!canvasRef.value) return;
  
  if (isTouchDragging && touchDragObject) {
    const rect = canvasRef.value.getBoundingClientRect();
    const scaleX = canvasRef.value.width / rect.width;
    const scaleY = canvasRef.value.height / rect.height;
    
    const x = ((touch.clientX - rect.left) * scaleX) / zoom.value + cameraX.value;
    const y = ((touch.clientY - rect.top) * scaleY) / zoom.value;
    
    const offset = dragInitialPos.get(touchDragObject);
    if (offset) {
      touchDragObject.x = x + offset.x;
      touchDragObject.y = y + offset.y;
      if ('initialY' in touchDragObject) touchDragObject.initialY = touchDragObject.y;
    }
  } else {
    // Pan camera
    const dx = touch.clientX - touchStartX;
    cameraX.value = Math.max(0, touchStartCamX - dx / zoom.value);
  }
  
  e.preventDefault();
};

const onWorkspaceTouchEnd = () => {
  if (isTouchDragging && touchDragObject) {
    saveState();
  }
  isTouchDragging = false;
  touchDragObject = null;
};

// Smart Generation
import { SmartMapGenerator } from '@/utils/smart-map-generator';
const showSmartGenModal = ref(false);
const smartGenLog = ref<string[]>([]);
const smartGenProgress = ref(0);
const smartGenStatus = ref('');
const isGenerating = ref(false);
const isTesting = ref(false);
const isSaving = ref(false);

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'idle': 'IDLE',
    'analyzing_song': 'SONG ANALYSIS',
    'generating_path': 'MOVEMENT PATH GENERATION',
    'adjusting_path': 'MOVEMENT PATH ADJUSTMENT',
    'generating_map': 'MAP GENERATION',
    'adjusting_map': 'MAP ADJUSTMENT',
    'saving_map': 'MAP SAVING',
    'completed': 'COMPLETED',
    'failed': 'FAILED'
  };
  return map[status] || status.toUpperCase().replace('_', ' ');
};

const openSmartGen = async () => {
  if (!mapData.value.audioData) {
    alert("Please upload audio first!");
    return;
  }
  showSmartGenModal.value = true;
  isGenerating.value = true;
  smartGenLog.value = [];
  
  const gen = new SmartMapGenerator(engine);
  // Hook up logs
  const interval = setInterval(() => {
    smartGenLog.value = [...gen.log];
    smartGenProgress.value = gen.progress;
    smartGenStatus.value = gen.status;
  }, 100);

  // Convert Base64 Audio to ArrayBuffer
  const res = await fetch(mapData.value.audioData);
  const buffer = await res.arrayBuffer();

  const success = await gen.generate(buffer, mapData.value);
  
  clearInterval(interval);
  isGenerating.value = false;
  
  if (success) {
    // Apply changes
    mapData.value.engineObstacles = [...engine.obstacles];
    mapData.value.enginePortals = [...engine.portals];
    mapData.value.autoplayLog = [...engine.autoplayLog];
    
    // Auto-save ? Or just let user save.
    smartGenLog.value.push("Map updated in editor. Click SAVE to persist.");
    saveState();
  }
};

const saveState = () => {
  const state = JSON.stringify(mapData.value);
  if (history.value[historyIdx.value] === state) return;
  
  history.value = history.value.slice(0, historyIdx.value + 1);
  history.value.push(state);
  if (history.value.length > 50) history.value.shift();
  else historyIdx.value++;
};

const undo = () => {
  if (historyIdx.value > 0) {
    historyIdx.value--;
    mapData.value = JSON.parse(history.value[historyIdx.value]!);
  }
};

const redo = () => {
  if (historyIdx.value < history.value.length - 1) {
    historyIdx.value++;
    mapData.value = JSON.parse(history.value[historyIdx.value]!);
  }
};

// Editor Logic
let isDragging = false;
let isDraggingObject = false;
let isResizing = false;
let resizeHandle = '';
let startDragX = 0;
let startDragCamX = 0;
let dragInitialPos = new Map<any, { x: number, y: number }>();

const getResizeHandle = (x: number, y: number, obj: any) => {
  const threshold = 10 / zoom.value;
  if (Math.abs(x - obj.x) < threshold && Math.abs(y - obj.y) < threshold) return 'tl';
  if (Math.abs(x - (obj.x + obj.width)) < threshold && Math.abs(y - obj.y) < threshold) return 'tr';
  if (Math.abs(x - obj.x) < threshold && Math.abs(y - (obj.y + obj.height)) < threshold) return 'bl';
  if (Math.abs(x - (obj.x + obj.width)) < threshold && Math.abs(y - (obj.y + obj.height)) < threshold) return 'br';
  return null;
};

const onWorkspaceMouseDown = (e: MouseEvent) => {
  if (e.button === 1) { // Middle click pan
    isDragging = true;
    startDragX = e.clientX;
    startDragCamX = cameraX.value;
    e.preventDefault();
    return;
  }

  if (e.button === 2) { // Right click selection box
    if (!canvasRef.value) return;
    isSelectionBoxActive.value = true;
    const rect = canvasRef.value.getBoundingClientRect();
    const scaleX = canvasRef.value.width / rect.width;
    const scaleY = canvasRef.value.height / rect.height;
    const x = ((e.clientX - rect.left) * scaleX) / zoom.value + cameraX.value;
    const y = ((e.clientY - rect.top) * scaleY) / zoom.value;
    selectionBox.value = { x1: x, y1: y, x2: x, y2: y };
    e.preventDefault();
    return;
  }
  
  if (e.button !== 0) return; // Only allow left click for others
  
  if (!canvasRef.value) return;
  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = canvasRef.value.width / rect.width;
  const scaleY = canvasRef.value.height / rect.height;
  
  let x = ((e.clientX - rect.left) * scaleX) / zoom.value + cameraX.value;
  let y = ((e.clientY - rect.top) * scaleY) / zoom.value;
  
  // Snap to grid if Shift is pressed
  if (isShiftPressed.value) {
    x = Math.round(x / 25) * 25;
    y = Math.round(y / 25) * 25;
  }
  
  // 1. Check resize handles on selected object (only if one is selected)
  if (selectedObjects.value.length === 1) {
    const handle = getResizeHandle(x, y, selectedObjects.value[0]);
    if (handle) {
      isResizing = true;
      resizeHandle = handle;
      return;
    }
  }

  // 2. Check for object selection and move drag
  const found = findObjectAt(x, y);
  if (found) {
    if (isShiftPressed.value) {
      const idx = selectedObjects.value.indexOf(found);
      if (idx === -1) selectedObjects.value.push(found);
      else selectedObjects.value.splice(idx, 1);
    } else {
      if (!selectedObjects.value.includes(found)) {
        selectedObjects.value = [found];
      }
      // If already includes, we keep it for multi-drag
    }
    
    if (selectedObjects.value.includes(found)) {
      isDraggingObject = true;
      dragInitialPos.clear();
      selectedObjects.value.forEach(obj => {
        dragInitialPos.set(obj, { x: obj.x - x, y: obj.y - y });
      });
    }
  } else {
    // 3. Clicked empty space: Always place new object (no Shift required now)
    // Clear selection first unless Shift is pressed (for potentially adding more without clearing? 
    // Actually, usually placing a new one selects only that one.)
    if (!isShiftPressed.value) {
      selectedObjects.value = [];
    }
    
    addObject(x, y);
    saveState();
  }
};

const onWorkspaceMouseMove = (e: MouseEvent) => {
  if (!canvasRef.value) return;
  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = canvasRef.value.width / rect.width;
  const scaleY = canvasRef.value.height / rect.height;
  let x = ((e.clientX - rect.left) * scaleX) / zoom.value + cameraX.value;
  let y = ((e.clientY - rect.top) * scaleY) / zoom.value;

  const rawX = x;
  const rawY = y;

  // Snapping
  if (isShiftPressed.value && !isSelectionBoxActive.value) {
    x = Math.round(x / 25) * 25;
    y = Math.round(y / 25) * 25;
  }

  if (isDragging) {
    const dx = e.clientX - startDragX;
    cameraX.value = Math.max(0, startDragCamX - dx / zoom.value);
  } else if (isSelectionBoxActive.value) {
    selectionBox.value.x2 = rawX;
    selectionBox.value.y2 = rawY;
  } else if (isResizing && selectedObjects.value.length === 1) {
    const obj = selectedObjects.value[0];
    if (resizeHandle === 'br') {
      obj.width = Math.max(10, x - obj.x);
      obj.height = Math.max(10, y - obj.y);
    } else if (resizeHandle === 'bl') {
      const right = obj.x + obj.width;
      obj.x = Math.min(right - 10, x);
      obj.width = right - obj.x;
      obj.height = Math.max(10, y - obj.y);
    } else if (resizeHandle === 'tr') {
      const bottom = obj.y + obj.height;
      obj.y = Math.min(bottom - 10, y);
      obj.height = bottom - obj.y;
      obj.width = Math.max(10, x - obj.x);
    } else if (resizeHandle === 'tl') {
      const right = obj.x + obj.width;
      const bottom = obj.y + obj.height;
      obj.x = Math.min(right - 10, x);
      obj.y = Math.min(bottom - 10, y);
      obj.width = right - obj.x;
      obj.height = bottom - obj.y;
    }
  } else if (isDraggingObject) {
    selectedObjects.value.forEach(obj => {
      const offset = dragInitialPos.get(obj);
      if (offset) {
        let nx = rawX + offset.x;
        let ny = rawY + offset.y;
        if (isShiftPressed.value) {
          nx = Math.round(nx / 25) * 25;
          ny = Math.round(ny / 25) * 25;
        }
        obj.x = nx;
        obj.y = ny;
        if ('initialY' in obj) obj.initialY = ny;


      }
    });
  }
};

const onWorkspaceMouseUp = () => {
  if (isSelectionBoxActive.value) {
    // Select objects within box
    const xMin = Math.min(selectionBox.value.x1, selectionBox.value.x2);
    const xMax = Math.max(selectionBox.value.x1, selectionBox.value.x2);
    const yMin = Math.min(selectionBox.value.y1, selectionBox.value.y2);
    const yMax = Math.max(selectionBox.value.y1, selectionBox.value.y2);

    const match = (obj: any) => {
      const oxMin = obj.x;
      const oxMax = obj.x + obj.width;
      const oyMin = obj.y;
      const oyMax = obj.y + obj.height;
      return !(oxMax < xMin || oxMin > xMax || oyMax < yMin || oyMin > yMax);
    };

    const inBox = [
      ...mapData.value.engineObstacles.filter(match),
      ...mapData.value.enginePortals.filter(match)
    ];
    selectedObjects.value = inBox;
    isSelectionBoxActive.value = false;
  } else if (isDraggingObject) {
    // Drag-to-Attach Logic
    // Drag-to-Attach Logic
    if (selectedObjects.value.length === 1) {
      const draggedObj = selectedObjects.value[0];
      const nonOrbitableTypes = ['falling_spike', 'growing_spike', 'piston_v', 'v_laser', 'laser_beam', 'boss', 'star']; 
      
      // Check if dragged object is attachable and not a parent itself in a weird way (stars usually root)
      if (!nonOrbitableTypes.includes(draggedObj.type)) {
        const cx = draggedObj.x + draggedObj.width / 2;
        const cy = draggedObj.y + draggedObj.height / 2;
        
        let targetParent: any = null;
        for (const obs of mapData.value.engineObstacles) {
           if (obs === draggedObj) continue;
           if (obs.type === 'star' || obs.type === 'planet') {
              if (cx >= obs.x && cx <= obs.x + obs.width && cy >= obs.y && cy <= obs.y + obs.height) {
                 targetParent = obs;
                 break;
              }
           }
        }

        if (targetParent) {
           console.log(`Attaching ${draggedObj.type} to ${targetParent.type}`);
           if (!targetParent.children) targetParent.children = [];
           // Remove from main list
           mapData.value.engineObstacles = mapData.value.engineObstacles.filter((o: any) => o !== draggedObj);
           // Add to children
           targetParent.children.push(draggedObj);
           draggedObj.parentId = 'attached'; 
        }
      }
    }
    saveState();
  } else if (isResizing) {
    saveState();
  }
  isDragging = false;
  isDraggingObject = false;
  isResizing = false;
  resizeHandle = '';
};

const onWorkspaceWheel = (e: WheelEvent) => {
  if (e.ctrlKey) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoom.value = Math.max(0.1, Math.min(5.0, zoom.value * delta));
  } else {
    cameraX.value = Math.max(0, cameraX.value + e.deltaY);
  }
};

const findObjectAt = (x: number, y: number) => {
  // Check obstacles
  for (const obs of mapData.value.engineObstacles) {
    if (x >= obs.x && x <= obs.x + obs.width && y >= obs.y && y <= obs.y + obs.height) return obs;
  }
  // Check portals
  for (const p of mapData.value.enginePortals) {
    if (x >= p.x && x <= p.x + p.width && y >= p.y && y <= p.y + p.height) return p;
  }
  return null;
};

const addObject = (x: number, y: number) => {
  const type = selectedPaletteType.value;
  if (obstacleTypes.includes(type as any)) {
    const newObs: Obstacle = {
      x, y: y - 25, width: 50, height: 50,
      type: type as ObstacleType,
      angle: 0,
      initialY: y - 25,
      movement: { type: 'none' as any, range: 0, speed: 0, phase: 0 }
    };
    mapData.value.engineObstacles.push(newObs);
    selectedObjects.value = [newObs];
  } else {
    const newPortal: Portal = {
      x, y: y - 30, width: 60, height: 80,
      type: type as PortalType,
      angle: 0,
      activated: false
    };
    mapData.value.enginePortals.push(newPortal);
    selectedObjects.value = [newPortal];
  }
};

const ensureCustomData = (obj: any) => {
  if (!obj.customData) {
    obj.customData = {};
  }
  return obj.customData;
};

const setMovementType = (type: string) => {
  if (selectedObjects.value.length !== 1) return;
  const obj = selectedObjects.value[0];
  if (!obj.movement) obj.movement = { type: 'none', range: 0, speed: 0, phase: 0 };
  
  // Lock checks
  if (obj.type === 'rotor' && type !== 'rotate') return; 
  if (obj.type === 'piston_v' && type !== 'updown') return;

  if (type === 'none') {
    obj.movement.type = 'none';
  } else {
    obj.movement.type = type;
    if (obj.movement.range === 0) obj.movement.range = 100;
    if (obj.movement.speed === 0) obj.movement.speed = 1.0;
  }
};

const deleteSelected = () => {
  if (selectedObjects.value.length === 0) return;
  mapData.value.engineObstacles = mapData.value.engineObstacles.filter((o: any) => !selectedObjects.value.includes(o));
  mapData.value.enginePortals = mapData.value.enginePortals.filter((p: any) => !selectedObjects.value.includes(p));
  selectedObjects.value = [];
  saveState();
};

const updateTotalLength = () => {
  const baseSpeed = engine.getDynamicBaseSpeed();
  totalLength.value = mapData.value.duration * baseSpeed + 500;
};

// Automaticaly adjust finish line (duration) based on obstacles
const updateMapDurationIndices = () => {
   let maxX = 0;
   const obs = mapData.value.engineObstacles || [];
   const prt = mapData.value.enginePortals || [];
   
   for (let i = 0; i < obs.length; i++) {
      const right = obs[i].x + obs[i].width;
      if (right > maxX) maxX = right;
   }
   for (let i = 0; i < prt.length; i++) {
      const right = prt[i].x + prt[i].width;
      if (right > maxX) maxX = right;
   }
   
   const baseSpeed = engine.getDynamicBaseSpeed();
   // Buffer: ~4-5 seconds
   const buffer = 1500;
   const targetLength = Math.max(2000, maxX + buffer);
   
   const newDuration = Math.max(10, Math.ceil((targetLength - 500) / baseSpeed));
   
   if (mapData.value.duration !== newDuration) {
      mapData.value.duration = newDuration;
      updateTotalLength();
   }
};

watch(
  [
    () => mapData.value.engineObstacles,
    () => mapData.value.enginePortals,
    () => mapData.value.difficulty
  ],
  () => {
    updateMapDurationIndices();
    updateTotalLength();
  },
  { deep: true }
);

const triggerAudioInput = () => audioInputRef.value?.click();

const handleAudioUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    mapData.value.audioData = ev.target?.result as string;
    mapData.value.audioUrl = `/audio/${file.name}`;
    if (!mapData.value.title || mapData.value.title === 'NEW UNTITLED MAP') {
       mapData.value.title = file.name.split('.')[0];
    }
    
  };
  reader.readAsDataURL(file);
};

const startPreviewAudio = () => {
  if (!previewAudioBuffer || !previewAudioCtx) return;
  stopPreviewAudio();
  
  previewAudioSource = previewAudioCtx.createBufferSource();
  previewAudioSource.buffer = previewAudioBuffer;
  previewAudioSource.connect(previewAudioCtx.destination);
  previewAudioSource.start(0);
};

const stopPreviewAudio = () => {
  if (previewAudioSource) {
    try { previewAudioSource.stop(); } catch(e) {}
    previewAudioSource = null;
  }
};

const togglePreview = async () => {
  if (isPreviewing.value) {
    isPreviewing.value = false;
    stopPreviewAudio();
    return;
  }

  // Load audio buffer if not already loaded
  if (!previewAudioCtx && typeof window !== 'undefined') {
     previewAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  if (mapData.value.audioData && !previewAudioBuffer && previewAudioCtx) {
    try {
      const res = await fetch(mapData.value.audioData);
      const arrayBuffer = await res.arrayBuffer();
      previewAudioBuffer = await previewAudioCtx.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.error("Failed to decode preview audio", err);
    }
  }

  // Generate autoplay for safety if possible
  const tempEngine = new GameEngine({ difficulty: mapData.value.difficulty });
  tempEngine.obstacles = [...mapData.value.engineObstacles];
  tempEngine.portals = [...mapData.value.enginePortals];
  tempEngine.totalLength = totalLength.value;
  
  const success = await tempEngine.computeAutoplayLogAsync(200, 360, () => {});
  mapData.value.autoplayLog = tempEngine.autoplayLog;
  
  if (!success) {
     if (!confirm("AI cannot find a clear path! Preview anyway?")) return;
  }
  
  isPreviewing.value = true;
  previewTime.value = 0;
  previewTrail.value = [];
  cameraX.value = 0;
  startPreviewAudio();
};

const testMap = async () => {
  if (isTesting.value) return;
  isTesting.value = true;
  console.log("Starting map test simulation...");

  try {
    // Generate autoplay for safety if possible
    const tempEngine = new GameEngine({ difficulty: mapData.value.difficulty });
    tempEngine.obstacles = [...mapData.value.engineObstacles];
    tempEngine.portals = [...mapData.value.enginePortals];
    tempEngine.totalLength = totalLength.value;
    
    console.log("Computing autoplay log...");
    // Give UI a chance to update before heavy sync work (if any)
    await new Promise(resolve => setTimeout(resolve, 50));

    const success = await tempEngine.computeAutoplayLogAsync(200, 360, (p) => {
        // Optional: show progress?
    });
    mapData.value.autoplayLog = tempEngine.autoplayLog;
    console.log("Autoplay computation result:", success);
    
    if (!success) {
       if (!confirm("AI cannot finish this map! Play anyway?")) {
         isTesting.value = false;
         return;
       }
    }
    
    // Save current editor state so we can return to it
    sessionStorage.setItem('umm_edit_map', JSON.stringify(mapData.value));
    sessionStorage.setItem('umm_is_test', 'true');
  
    // Navigate to play with this data
    sessionStorage.setItem('umm_load_map', JSON.stringify(mapData.value));
    router.push('/play');
  } catch (e: any) {
    console.error("Test map error:", e);
    alert("An error occurred during test preparation: " + e.message);
    isTesting.value = false;
  }
};

const saveMap = async () => {
  if (isSaving.value) return;
  isSaving.value = true;

  try {
    const isNew = !mapData.value._id;
    const url = isNew ? '/api/maps' : `/api/maps/${mapData.value._id}`;
    const method = isNew ? 'POST' : 'PATCH';
    
    // Ensure creator info
    if (isNew) {
      mapData.value.creatorName = user.value?.username || 'Guest';
    }

    // 4.5MB 청크 크기 (Vercel 제한 고려) - CHUNK_SIZE from audioUtils
    const audioData = mapData.value.audioData;
    
    // 오디오 데이터가 크면 청크로 분할
    if (audioData && audioData.length > CHUNK_SIZE) {
      const chunks = splitBase64ToChunks(audioData, CHUNK_SIZE);
      
      // 먼저 맵 데이터를 오디오 없이 저장
      const mapWithoutAudio = { ...mapData.value, audioData: null, audioChunks: [] };
      const res = await $fetch(url, { method, body: mapWithoutAudio }) as any;
      const mapId = res._id;
      if (isNew) mapData.value._id = mapId;
      
      // 각 청크를 순차적으로 업로드
      for (let i = 0; i < chunks.length; i++) {
        await $fetch(`/api/maps/${mapId}/audio-chunk`, {
          method: 'POST',
          body: { chunkIndex: i, chunkData: chunks[i], totalChunks: chunks.length }
        });
      }
      
      alert(`Map saved! (Audio: ${chunks.length} chunks)`);
    } else {
      // 작은 파일은 기존 방식으로 저장
      const res = await $fetch(url, { method, body: mapData.value });
      if (isNew) mapData.value._id = (res as any)._id;
      alert("Map saved successfully!");
    }
  } catch (e: any) {
    console.error('Save error:', e);
    const errorData = e.response?._data || {};
    
    if (errorData.statusMessage === "MUSIC_NOT_IN_SERVER") {
      const guide = errorData.data?.guide || "음악 파일을 서버에 저장할 수 없습니다.";
      const contact = errorData.data?.contact || "관리자에게 문의하세요.";
      alert(`${guide}\n\n문의처: ${contact}`);
    } else {
      const msg = errorData.statusMessage || e.message || 'Unknown error';
      alert(`Failed to save map: ${msg}`);
    }
  }
 finally {
    isSaving.value = false;
  }
};

// Render Loop
let animationId: number;
const draw = () => {
  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  
  const w = canvasRef.value.width;
  const h = canvasRef.value.height;
  const time = performance.now() / 1000;
  
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, w, h);
  
  ctx.save();
  ctx.scale(zoom.value, zoom.value);
  ctx.translate(-cameraX.value, 0);
  
  // Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  const gridSize = 50;
  const startX = Math.floor(cameraX.value / gridSize) * gridSize;
  for (let x = startX; x < cameraX.value + w / zoom.value; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h / zoom.value); ctx.stroke();
  }
  for (let y = 0; y < h / zoom.value; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(cameraX.value, y); ctx.lineTo(cameraX.value + w / zoom.value, y); ctx.stroke();
  }

  // Draw Death Zones
  ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
  ctx.fillRect(cameraX.value, 0, w / zoom.value, 140);
  ctx.fillRect(cameraX.value, 580, w / zoom.value, h / zoom.value - 580);
  
  // Boundaries
  ctx.strokeStyle = '#ff3333';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cameraX.value, 140); ctx.lineTo(cameraX.value + w/zoom.value, 140); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cameraX.value, 580); ctx.lineTo(cameraX.value + w/zoom.value, 580); ctx.stroke();
  
  ctx.fillStyle = '#ff3333';
  ctx.font = 'bold 12px Outfit';
  ctx.fillText('CEILING BOUNDARY', cameraX.value + 10, 130);
  ctx.fillText('FLOOR BOUNDARY', cameraX.value + 10, 575);

  // 1. Draw Paths / Background elements first
  // Draw Intended Path (Autoplay Log)
  if (mapData.value.autoplayLog && mapData.value.autoplayLog.length > 1) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.4)';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(mapData.value.autoplayLog[0].x, mapData.value.autoplayLog[0].y);
    for (let i = 1; i < mapData.value.autoplayLog.length; i++) {
      ctx.lineTo(mapData.value.autoplayLog[i].x, mapData.value.autoplayLog[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0;
    ctx.restore();
  }

  // Draw Portals (Same as In-game)
  mapData.value.enginePortals.forEach((p: Portal) => {
    const color = engine.getPortalColor(p.type);
    ctx.save();
    
    // 전역 회전 지원
    if (p.angle) {
      ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
      ctx.rotate(p.angle * Math.PI / 180);
      ctx.translate(-(p.x + p.width / 2), -(p.y + p.height / 2));
    }
    
    ctx.fillStyle = color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
    
    // Background glow
    ctx.globalAlpha = 0.2;
    ctx.fillRect(p.x, p.y, p.width, p.height);
    ctx.globalAlpha = 1.0;
    
    // Portal frame
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.width, p.height);
    
    // Symbol
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(engine.getPortalSymbol(p.type), p.x + p.width/2, p.y + p.height/2 + 8);
    ctx.restore();

    if (selectedObjects.value.includes(p)) {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(p.x - 5, p.y - 5, p.width + 10, p.height + 10);
    }

    if (showHitboxes.value) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(p.x, p.y, p.width, p.height);
      ctx.setLineDash([]);
    }
  });

  // Draw Obstacles (Same as In-game)
  mapData.value.engineObstacles.forEach((obs: Obstacle) => {
    ctx.save();
    
    // Ghost Path logic
    if (obs.movement && obs.movement.type === 'updown') {
       ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
       ctx.beginPath();
       ctx.moveTo(obs.x + obs.width/2, (obs.initialY || obs.y) - obs.movement.range);
       ctx.lineTo(obs.x + obs.width/2, (obs.initialY || obs.y) + obs.movement.range);
       ctx.stroke();
    }

    // Get current animated state
    const state = engine.getObstacleStateAt(obs, time);
    // X is usually static unless we add X movement later. However, the shared render function uses input x,y as Top-Left.
    // engine.getObstacleStateAt returns the modified x,y, angle. 
    // Obstacles in editor are drawn at static positions? No, we use state for animation previews.
    
    // Wait, getObstacleStateAt returns {x, y, angle}.
    // If we use state.y, we should use state.x too.
    // The shared drawObstacle takes (x, y).
    
    const drawX = obs.x; // Typically static in this game's movement logic (vertical only mostly?)
    // Actually getObstacleStateAt handles 'updown' which changes Y.
    // Does it handle X? Currently game-engine only has vertical movement or rotation.
    // If horizontal movement is added, we should use state.x.
    
    // For now, obs.x is fine.
    
    const drawY = state.y;
    const drawAngle = state.angle;
    
    // Draw using shared renderer
    // We pass overrideAngle = drawAngle to ensure rotation is respected
    // isEditor = true to see invisible walls/fake blocks
    drawObstacle(ctx, obs, drawX, drawY, time, true, drawAngle);

    if (showHitboxes.value) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(drawX, drawY, obs.width, obs.height);
      ctx.setLineDash([]);
    }

    ctx.restore();
  });

  // Finish Line
  const goalX = totalLength.value;
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 8;
  ctx.setLineDash([15, 10]);
  ctx.beginPath(); ctx.moveTo(goalX, 0); ctx.lineTo(goalX, h / zoom.value); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#00ff88';
  ctx.font = '900 32px Outfit';
  ctx.textAlign = 'center';
  ctx.fillText('FINISH LINE', goalX, 100);
  ctx.textAlign = 'left';

  // Draw Selection & Handles at BASE positions
  selectedObjects.value.forEach(obs => {
    ctx.save();
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    ctx.setLineDash([]);
    
    // Resize Handles (only for single selection)
    if (selectedObjects.value.length === 1) {
      ctx.fillStyle = '#fff';
      const handleSize = 6 / zoom.value;
      ctx.fillRect(obs.x - handleSize, obs.y - handleSize, handleSize * 2, handleSize * 2);
      ctx.fillRect(obs.x + obs.width - handleSize, obs.y - handleSize, handleSize * 2, handleSize * 2);
      ctx.fillRect(obs.x - handleSize, obs.y + obs.height - handleSize, handleSize * 2, handleSize * 2);
      ctx.fillRect(obs.x + obs.width - handleSize, obs.y + obs.height - handleSize, handleSize * 2, handleSize * 2);
    }
    ctx.restore();
  });

  // Draw Selection Box
  if (isSelectionBoxActive.value) {
    ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    const x = Math.min(selectionBox.value.x1, selectionBox.value.x2);
    const y = Math.min(selectionBox.value.y1, selectionBox.value.y2);
    const w_box = Math.abs(selectionBox.value.x2 - selectionBox.value.x1);
    const h_box = Math.abs(selectionBox.value.y2 - selectionBox.value.y1);
    ctx.fillRect(x, y, w_box, h_box);
    ctx.strokeRect(x, y, w_box, h_box);
  }

  // Draw Preview Player
  if (isPreviewing.value) {
    // 1. Draw Preview Trail
    if (previewTrail.value.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(previewTrail.value[0].x, previewTrail.value[0].y);
      for (let i = 1; i < previewTrail.value.length; i++) {
        ctx.lineTo(previewTrail.value[i].x, previewTrail.value[i].y);
      }
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
      ctx.lineWidth = 14 / zoom.value;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
    }

    const log = mapData.value.autoplayLog;
    if (log && log.length > 0) {
      // Calculate delta time
      const now = performance.now() / 1000;
      if (!lastPreviewFrameTime) lastPreviewFrameTime = now;
      const dt = now - lastPreviewFrameTime;
      lastPreviewFrameTime = now;

      // Advance preview time
      previewTime.value += dt;
      
      // Find current position in autoplay log efficiently (Binary Search or Linear)
      let currentPoint: any = log[0];
      
      for (let i = 0; i < log.length; i++) {
        if (log[i].time >= previewTime.value) {
          if (i > 0) {
            const p1 = log[i-1];
            const p2 = log[i];
            const t = (previewTime.value - p1.time) / (p2.time - p1.time);
            currentPoint = {
              x: p1.x + (p2.x - p1.x) * t,
              y: p1.y + (p2.y - p1.y) * t,
              holding: p1.holding
            };
          } else {
            currentPoint = log[i];
          }
          break;
        }
        currentPoint = log[log.length - 1];
      }
      
      previewX.value = currentPoint.x;
      previewY.value = currentPoint.y;
      
      // Update trail
      previewTrail.value.push({ x: previewX.value, y: previewY.value });
      if (previewTrail.value.length > 500) previewTrail.value.shift();

      // Auto-update camera (smooth transition)
      cameraX.value = Math.max(0, previewX.value - 200);

      // Draw Player
      ctx.save();
      ctx.fillStyle = currentPoint.holding ? '#ff00ff' : '#00ffff';
      ctx.shadowBlur = 25;
      ctx.shadowColor = ctx.fillStyle as string;
      ctx.beginPath();
      ctx.arc(previewX.value, previewY.value, 18 / zoom.value, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Stop at end
      if (previewX.value >= totalLength.value) {
        isPreviewing.value = false;
        lastPreviewFrameTime = 0;
        stopPreviewAudio();
      }
    }
  } else {
    lastPreviewFrameTime = 0;
  }

  ctx.restore();
  animationId = requestAnimationFrame(draw);
};

const rotateSelected = (degrees: number) => {
  selectedObjects.value.forEach(obj => {
    if ('angle' in obj) {
      obj.angle = (obj.angle || 0) + degrees;
      if (obj.angle < 0) obj.angle += 360;
      if (obj.angle >= 360) obj.angle -= 360;
    }
  });
  saveState();
};

onMounted(() => {
  // If editing existing map
  const editData = sessionStorage.getItem('umm_edit_map');
  if (editData) {
    mapData.value = JSON.parse(editData);
    sessionStorage.removeItem('umm_edit_map');
    updateTotalLength();
  }
  
  // Initial state
  saveState(); 

  // Init AudioContext on client-side only
  if (typeof window !== 'undefined' && !previewAudioCtx) {
     previewAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  draw();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

    if (e.key === 'Shift') isShiftPressed.value = true;
    
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'c') {
        if (selectedObjects.value.length > 0) {
          clipboard.value = selectedObjects.value.map(o => ({ ...o, _id: undefined }));
        }
      } else if (e.key === 'x') {
        if (selectedObjects.value.length > 0) {
          clipboard.value = selectedObjects.value.map(o => ({ ...o, _id: undefined }));
          deleteSelected();
        }
      } else if (e.key === 'v') {
        if (clipboard.value.length > 0) {
          // Calculate bounding box center of clipboard items to offset correctly
          const minX = Math.min(...clipboard.value.map(o => o.x));
          const minY = Math.min(...clipboard.value.map(o => o.y));
          
          const newItems = clipboard.value.map(o => {
            const newItem = { ...o, x: cameraX.value + (o.x - minX) + 100, y: o.y };
            if (obstacleTypes.includes(newItem.type)) mapData.value.engineObstacles.push(newItem);
            else mapData.value.enginePortals.push(newItem);
            return newItem;
          });
          selectedObjects.value = newItems;
          saveState();
        }
      } else if (e.key === 'z') {
        undo();
      } else if (e.key === 'y') {
        redo();
      }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedObjects.value.length > 0) {
        deleteSelected();
      }
    } else if (e.key.toLowerCase() === 'r') {
      if (selectedObjects.value.length > 0) {
        rotateSelected(45);
      }
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Shift') isShiftPressed.value = false;
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    cancelAnimationFrame(animationId);
    stopPreviewAudio();
    stopPreviewAudio();
    window.removeEventListener('resize', checkMobile);
  });
  
  checkMobile();
  window.addEventListener('resize', checkMobile);
  window.addEventListener('resize', updateCanvasSize);
  setTimeout(updateCanvasSize, 100);
});
</script>

<style scoped>
.editor-page {
  width: 100%;
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height for mobile */
  background: #050510;
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Outfit', sans-serif;
}

.background-anim {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at 10% 10%, #0a0a25 0%, #000 100%);
  opacity: 0.5;
  z-index: 0;
}

.editor-header {
  margin: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0.8rem 1rem;
  z-index: 10;
  flex-shrink: 0;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.mobile-title-row {
  width: 100%;
}

.mobile-title-row .map-title-input {
  width: 100%;
}

.title { font-size: 1.2rem; font-weight: 900; color: #00ffff; margin: 0; }
.version { font-size: 0.6rem; color: #666; vertical-align: middle; }

.map-title-input {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.transport-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.control-btn {
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  font-weight: 900;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 0.8rem;
}

.control-btn.test { background: #00ffaa; color: #000; }
.control-btn.tutorial { background: #ff00ff; color: #fff; }
.control-btn.save { background: #4d94ff; color: #fff; }
.control-btn.active { background: #00ffff; color: #000; box-shadow: 0 0 10px #00ffff; }
.control-btn.exit { background: transparent; border: 1px solid #444; color: #888; }

.main-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 240px 1fr 280px;
  gap: 10px;
  padding: 0 10px 10px 10px;
  overflow: hidden;
  min-height: 0; /* Important for flex child with grid */
}

/* Desktop-only stats display */
.config-summary {
  display: flex;
  gap: 1rem;
}

.stat {
  font-size: 0.75rem;
  color: #666;
  font-weight: bold;
}

.sidebar {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  overflow-y: auto;
  min-width: 0;
}

.object-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.palette-item:hover, .palette-item.selected {
  background: rgba(0, 255, 255, 0.1);
  border-color: #00ffff;
}

.palette-item.portal.selected {
  background: rgba(255, 0, 255, 0.1);
  border-color: #ff00ff;
}

.symbol { font-size: 1.2rem; width: 30px; text-align: center; }
.name { font-size: 0.75rem; font-weight: bold; color: #aaa; }

.workspace {
  position: relative;
  border: 2px solid rgba(0, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-canvas {
  flex: 1;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  touch-action: none;
}

.grid-info {
  position: absolute;
  top: 10px; right: 10px;
  font-size: 0.7rem; color: #666;
  background: rgba(0,0,0,0.5); padding: 5px 10px; border-radius: 4px;
  display: flex; gap: 1rem;
}

.timeline-container {
  height: 40px;
  background: rgba(0,0,0,0.3);
  padding: 0 20px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.timeline-slider {
  width: 100%;
  accent-color: #00ffff;
}

.properties-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.prop-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prop-group label {
  font-size: 0.7rem;
  font-weight: 900;
  color: #666;
  letter-spacing: 1px;
}

input, select {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  padding: 8px;
  border-radius: 4px;
  width: 100%;
  box-sizing: border-box;
}

.input-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.delete-btn {
  margin-top: 1rem;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff4444;
  color: #ff4444;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.glass-panel {
  background: rgba(15, 15, 25, 0.8);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
}

.separator {
  margin: 1.5rem 0 0.5rem 0;
  font-size: 0.6rem;
  font-weight: 900;
  color: #444;
  text-align: center;
  letter-spacing: 2px;
}

.rotation-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.rot-btn {
  flex: 1;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.3);
  color: #00ffff;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.rot-btn:hover {
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.audio-upload {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 255, 136, 0.05);
  border-radius: 8px;
  border: 1px dashed rgba(0, 255, 136, 0.3);
}

.upload-btn {
  width: 100%;
  padding: 0.8rem;
  background: #00ff88;
  color: #000;
  border: none;
  font-weight: 900;
  cursor: pointer;
  border-radius: 4px;
}

.audio-hint {
  font-size: 0.6rem;
  color: #00ff88;
  margin-top: 5px;
  text-align: center;
}

.empty-selection {
  text-align: center;
  padding: 3rem 1rem;
  color: #444;
  font-style: italic;
  font-size: 0.9rem;
}

/* --- Mobile Responsiveness (Drawer System) --- */
.mobile-toggle {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1rem;
  padding: 0.4rem 0.6rem;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-layout.is-mobile {
  display: block;
  position: relative;
}

.main-layout.is-mobile .workspace {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0;
}

.sidebar.mobile-drawer {
  position: fixed;
  top: 0;
  bottom: 0;
  width: min(280px, 85vw);
  z-index: 200;
  background: rgba(10, 10, 20, 0.98);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding-top: 0;
  padding: 1rem;
}

.sidebar.mobile-drawer.left-sidebar {
  left: 0;
  transform: translateX(-100%);
}

.sidebar.mobile-drawer.left-sidebar.open {
  transform: translateX(0);
}

.sidebar.mobile-drawer.right-sidebar {
  right: 0;
  left: auto;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-right: none;
  transform: translateX(100%);
}

.sidebar.mobile-drawer.right-sidebar.open {
  transform: translateX(0);
}

/* Backdrop overlay when drawer is open */
.editor-page.is-mobile .sidebar.mobile-drawer.open::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
  position: sticky;
  top: 0;
  background: rgba(10, 10, 20, 0.98);
  z-index: 1;
}

.drawer-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #00ffff;
}

.close-drawer {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Mobile: Hide desktop sidebars */
@media (max-width: 768px) {
  .editor-page.is-mobile .main-layout {
    display: block;
    padding: 0;
  }
  
  .editor-page.is-mobile .editor-header {
    margin: 5px;
    padding: 0.5rem;
  }
  
  .editor-page.is-mobile .title {
    font-size: 1rem;
  }
  
  .editor-page.is-mobile .transport-controls {
    gap: 0.3rem;
  }
  
  .editor-page.is-mobile .control-btn {
    padding: 0.4rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .editor-page.is-mobile .workspace {
    border-radius: 0;
    margin: 0;
  }
  
  .editor-page.is-mobile .grid-info {
    font-size: 0.6rem;
    padding: 3px 6px;
  }
  
  .editor-page.is-mobile .timeline-container {
    height: 32px;
    padding: 0 10px;
  }
  
  /* Palette items smaller on mobile */
  .sidebar.mobile-drawer .palette-item {
    padding: 8px;
    gap: 8px;
  }
  
  .sidebar.mobile-drawer .symbol {
    font-size: 1rem;
    width: 24px;
  }
  
  .sidebar.mobile-drawer .name {
    font-size: 0.65rem;
  }
  
  /* Properties panel adjustments */
  .sidebar.mobile-drawer .prop-group label {
    font-size: 0.6rem;
  }
  
  .sidebar.mobile-drawer input,
  .sidebar.mobile-drawer select {
    padding: 6px;
    font-size: 0.85rem;
  }
  
  .sidebar.mobile-drawer .rot-btn {
    padding: 6px;
    font-size: 0.75rem;
  }
  
  .sidebar.mobile-drawer .delete-btn {
    padding: 8px;
    font-size: 0.8rem;
  }
}

/* Tablet adjustments */
@media (min-width: 769px) and (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 200px 1fr 240px;
  }
  
  .sidebar {
    padding: 1rem;
  }
  
  .palette-item {
    padding: 8px;
  }
  
  .symbol {
    font-size: 1rem;
  }
  
  .name {
    font-size: 0.65rem;
  }
}

/* Large desktop */
@media (min-width: 1400px) {
  .main-layout {
    grid-template-columns: 300px 1fr 350px;
  }
  
  .control-btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}

@import '@/assets/css/smart_gen_ui.css';
</style>
