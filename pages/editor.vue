<template>
  <div class="editor-page">
    <div class="background-anim"></div>
    
    <!-- Top Header -->
    <header class="editor-header glass-panel">
      <div class="left">
        <h1 class="title">MAP_ARCHITECT <span class="version">v2.0</span></h1>
        <div class="map-meta">
          <input v-model="mapData.title" placeholder="Map Title" class="map-title-input" />
          <span class="creator">BY: {{ user?.username || 'Guest' }}</span>
        </div>
      </div>
      <div class="center">
        <div class="transport-controls">
          <button @click="testMap" class="control-btn test" :disabled="isTesting">
            <span class="icon">▶</span> {{ isTesting ? 'TESTING...' : 'TEST' }}
          </button>
          <button @click="togglePreview" class="control-btn tutorial" :class="{ active: isPreviewing }">
            <span class="icon">🎓</span> {{ isPreviewing ? 'STOP' : 'TUTORIAL' }}
          </button>
          <button @click="saveMap" class="control-btn save" :disabled="isSaving">
            <span class="icon">💾</span> {{ isSaving ? 'SAVING...' : 'SAVE' }}
          </button>

          <button @click="showHitboxes = !showHitboxes" class="control-btn" :class="{ active: showHitboxes }">
            <span class="icon">⛶</span> HITBOX
          </button>
          <button @click="router.push('/maps')" class="control-btn exit">EXIT</button>
        </div>
      </div>
      <div class="right">
        <div class="config-summary">
          <span class="stat">OBJ: {{ mapData.engineObstacles.length }}</span>
          <span class="stat">PORT: {{ mapData.enginePortals.length }}</span>
        </div>
      </div>
    </header>

    <div class="main-layout">
      <!-- Left Sidebar: Object Types -->
      <aside class="sidebar left-sidebar glass-panel">
        <h3>PALETTE</h3>
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
            @wheel="onWorkspaceWheel"
            @contextmenu.prevent>
        
        <canvas ref="canvasRef" width="1200" height="600" class="editor-canvas"></canvas>
        
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
      <aside class="sidebar right-sidebar glass-panel">
        <h3>PROPERTIES</h3>
        
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

          <div class="prop-group" v-if="'movement' in selectedObjects[0]">
             <label>MOVEMENT</label>
             <select v-model="selectedObjects[0].movement.type" v-if="selectedObjects[0].movement">
               <option value="none">NONE</option>
               <option value="updown">UP-DOWN BOUNCE</option>
               <option value="rotate">CONTINUOUS ROTATE</option>
             </select>
             <div v-if="selectedObjects[0].movement && selectedObjects[0].movement.type !== 'none'" class="movement-details">
                <label>SPEED</label>
                <input type="number" step="0.1" v-model.number="selectedObjects[0].movement.speed" />
                <label>RANGE</label>
                <input type="number" v-model.number="selectedObjects[0].movement.range" />
                <label>PHASE OFFSET</label>
                <input type="number" step="0.1" v-model.number="selectedObjects[0].movement.phase" />
             </div>
          </div>

          <template v-if="['planet', 'star'].includes(selectedObjects[0].type)">
              <label>ORBIT COUNT ({{ensureCustomData(selectedObjects[0]).orbitCount || (selectedObjects[0].type==='star'?0:2)}})</label>
              <input type="number" v-model.number="ensureCustomData(selectedObjects[0]).orbitCount" placeholder="0 or 2" />
              <label>ORBIT SPEED</label>
              <input type="number" step="0.1" v-model.number="ensureCustomData(selectedObjects[0]).orbitSpeed" placeholder="Speed" />
              <label>ORBIT DISTANCE</label>
              <input type="number" v-model.number="ensureCustomData(selectedObjects[0]).orbitDistance" placeholder="Distance" />
              
              <div v-if="selectedObjects[0].type === 'star'" class="hint-text">
                 Drag a Planet onto this Star to attach it!
              </div>

              <!-- Show attached children info -->
              <div v-if="selectedObjects[0].children && selectedObjects[0].children.length > 0" class="children-list">
                 <label>ATTACHED PLANETS: {{ selectedObjects[0].children.length }}</label>
                 <div v-for="(child, idx) in selectedObjects[0].children" :key="idx" class="child-item">
                    <span>Planet {{ idx + 1 }}</span>
                    <!-- Could add mini config here, but selecting child directly is hard since they are attached. 
                         For now, users configure planets BEFORE dragging them. -->
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

           <label>DIFFICULTY</label>
           <input type="number" v-model.number="mapData.difficulty" />
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
import { GameEngine, type Obstacle, type Portal, type ObstacleType, type PortalType } from '@/utils/game-engine';
import { CHUNK_SIZE, splitBase64ToChunks } from '@/utils/audioUtils';

const router = useRouter();
const { user } = useAuth();
const engine = new GameEngine();

// State
const mapData = ref<any>({
  title: 'NEW UNTITLED MAP',
  duration: 60,
  difficulty: 10,
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

const obstacleTypes: ObstacleType[] = ['spike', 'block', 'saw', 'mini_spike', 'laser', 'spike_ball', 'v_laser', 'mine', 'orb', 'slope', 'triangle', 'steep_triangle', 'piston_v', 'falling_spike', 'hammer', 'rotor', 'cannon', 'spark_mine', 'laser_beam', 'crusher_jaw', 'swing_blade', 'growing_spike', 'planet', 'star'];
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
    if (selectedObjects.value.length === 1) {
      const draggedObj = selectedObjects.value[0];
      
      // Check if dragged object is a Planet
      if (draggedObj.type === 'planet') {
        // Find if dropping onto a Star
        // Simple collision check with center point
        const cx = draggedObj.x + draggedObj.width / 2;
        const cy = draggedObj.y + draggedObj.height / 2;
        
        let targetStar: any = null;
        for (const obs of mapData.value.engineObstacles) {
           if (obs === draggedObj) continue;
           if (obs.type === 'star') {
              if (cx >= obs.x && cx <= obs.x + obs.width && cy >= obs.y && cy <= obs.y + obs.height) {
                 targetStar = obs;
                 break;
              }
           }
        }

        if (targetStar) {
           // Attach to Star
           console.log("Attaching Planet to Star");
           if (!targetStar.children) targetStar.children = [];
           // Remove from main list
           mapData.value.engineObstacles = mapData.value.engineObstacles.filter((o: any) => o !== draggedObj);
           // Add to children
           targetStar.children.push(draggedObj);
           draggedObj.parentId = 'attached'; // Mark as attached
           // Reset offset relative to parent? Or just keep data?
           // For now, let's just add it. The rendering logic needs to know it's a child.
           // Actually, the rendering/collision logic expects children to be abstract params OR objects.
           // Our game-engine logic previously assumed `orbitCount`.
           // We need to update game-engine to use `children` if present.
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
  totalLength.value = mapData.value.duration * 350 + 500;
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
   
   // Buffer: ~4-5 seconds (1500px)
   // Minimum: 20 seconds
   const buffer = 1500;
   const targetLength = Math.max(2000, maxX + buffer);
   
   // Calculate duration (duration * 350 + 500 = totalLength)
   // duration = (totalLength - 500) / 350
   const newDuration = Math.max(10, Math.ceil((targetLength - 500) / 350));
   
   if (mapData.value.duration !== newDuration) {
      mapData.value.duration = newDuration;
      updateTotalLength();
   }
};

watch(
  [
    () => mapData.value.engineObstacles,
    () => mapData.value.enginePortals
  ],
  () => {
    updateMapDurationIndices();
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
  const tempEngine = new GameEngine();
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

const testMap = async () => {
  if (isTesting.value) return;
  isTesting.value = true;
  console.log("Starting map test simulation...");

  try {
    // Generate autoplay for safety if possible
    const tempEngine = new GameEngine();
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
    // Show more detailed error from server if available
    const msg = e.response?._data?.statusMessage || e.message || 'Unknown error';
    alert(`Failed to save map: ${msg}`);
  } finally {
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
    
    // 전역 회전 지원 (모든 오브젝트)
    const hasAngle = obs.angle !== undefined && obs.angle !== 0;
    if (hasAngle) {
      ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
      ctx.rotate(obs.angle! * Math.PI / 180);
      ctx.translate(-(obs.x + obs.width / 2), -(obs.y + obs.height / 2));
    }
    
    // Draw Movement Path (Ghost/Reference)
    if (obs.movement && obs.movement.type === 'updown') {
       ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
       ctx.beginPath();
       ctx.moveTo(obs.x + obs.width/2, (obs.initialY || obs.y) - obs.movement.range);
       ctx.lineTo(obs.x + obs.width/2, (obs.initialY || obs.y) + obs.movement.range);
       ctx.stroke();
    }

    // Get current animated state
    const state = engine.getObstacleStateAt(obs, time);
    const drawX = obs.x;
    const drawY = state.y;
    const drawAngle = state.angle;

    if (obs.type === 'spike' || obs.type === 'mini_spike') {
      ctx.fillStyle = '#ff4d4d';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff0000';
      ctx.beginPath();
      if (drawY > 300) { // Bottom
        ctx.moveTo(drawX, drawY + obs.height);
        ctx.lineTo(drawX + obs.width / 2, drawY);
        ctx.lineTo(drawX + obs.width, drawY + obs.height);
      } else { // Top
        ctx.moveTo(drawX, drawY);
        ctx.lineTo(drawX + obs.width / 2, drawY + obs.height);
        ctx.lineTo(drawX + obs.width, drawY);
      }
      ctx.closePath();
      ctx.fill();
    } else if (obs.type === 'block') {
      ctx.fillStyle = '#444';
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#666';
      ctx.fillRect(drawX, drawY, obs.width, obs.height);
      ctx.fillStyle = '#555';
      ctx.fillRect(drawX + 2, drawY + 2, obs.width - 4, obs.height - 4);
    } else if (obs.type === 'mine') {
       ctx.fillStyle = '#222';
       ctx.strokeStyle = '#ff3333';
       
       // Pulsation Visual (Editor: use time for preview)
       let sizeScale = 1.0;
       if (obs.customData?.pulseSpeed) {
          const speed = obs.customData.pulseSpeed || 2;
          const amount = obs.customData.pulseAmount || 0.2;
          sizeScale = 1 + Math.sin(time * speed) * amount;
       }

       const radius = (obs.width / 2) * sizeScale;
       const cx = drawX + obs.width / 2;
       const cy = drawY + obs.height / 2;

       ctx.beginPath();
       ctx.arc(cx, cy, radius, 0, Math.PI * 2);
       ctx.fill();
       ctx.stroke();

       // Spikes
       const spikeCount = 8;
       ctx.beginPath();
       for(let k=0; k<spikeCount; k++) {
         const angle = (Math.PI * 2 * k) / spikeCount;
         const rIn = radius;
         const rOut = radius + 6;
         ctx.moveTo(cx + Math.cos(angle)*rIn, cy + Math.sin(angle)*rIn);
         ctx.lineTo(cx + Math.cos(angle)*rOut, cy + Math.sin(angle)*rOut);
       }
       ctx.stroke();
    }
    else if (obs.type === 'planet') {
       const cx = drawX + obs.width / 2;
       const cy = drawY + obs.height / 2;
       const radius = obs.width / 2;

       const grad = ctx.createRadialGradient(cx, cy - radius*0.3, radius*0.1, cx, cy, radius);
       grad.addColorStop(0, '#4488ff');
       grad.addColorStop(1, '#002266');
       ctx.fillStyle = grad;
       ctx.beginPath();
       ctx.arc(cx, cy, radius, 0, Math.PI*2);
       ctx.fill();

       const count = obs.customData?.orbitCount ?? 2;
       const speed = obs.customData?.orbitSpeed ?? 1.0;
       const dist = obs.customData?.orbitDistance ?? (obs.width * 0.8);
      
       for (let i = 0; i < count; i++) {
         const theta = time * speed + (i * ((Math.PI * 2) / count));
         const mx = cx + Math.cos(theta) * dist;
         const my = cy + Math.sin(theta) * dist;
         
         ctx.fillStyle = '#88ccff';
         ctx.beginPath();
         ctx.arc(mx, my, 8, 0, Math.PI*2);
         ctx.fill();
       }
    }
    else if (obs.type === 'star') {
       const cx = drawX + obs.width / 2;
       const cy = drawY + obs.height / 2;
       const radius = obs.width / 2;

       const pulse = 1 + Math.sin(time * 5) * 0.05;
       const grad = ctx.createRadialGradient(cx, cy, radius*0.2, cx, cy, radius * pulse);
       grad.addColorStop(0, '#ffff88');
       grad.addColorStop(0.5, '#ffaa00');
       grad.addColorStop(1, 'rgba(255, 68, 0, 0)');
       ctx.fillStyle = grad;
       ctx.beginPath();
       ctx.arc(cx, cy, radius * 1.2 * pulse, 0, Math.PI*2);
       ctx.fill();
       
       ctx.fillStyle = '#fff';
       ctx.beginPath();
       ctx.arc(cx, cy, radius * 0.6, 0, Math.PI*2);
       ctx.fill();

       const hasChildren = obs.children && obs.children.length > 0;
       
       if (hasChildren) {
         const children = obs.children!;
         const speed = obs.customData?.orbitSpeed ?? 1.0;
         
         children.forEach((child: any, i: number) => {
            const theta = time * speed + (i * ((Math.PI * 2) / children.length));
            const dist = obs.customData?.orbitDistance ?? (obs.width * 0.85);

            const px = cx + Math.cos(theta) * dist;
            const py = cy + Math.sin(theta) * dist;
            
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(px, py, 14, 0, Math.PI*2);
            ctx.fill();

            if (child.type === 'planet') {
                const moonCount = child.customData?.orbitCount ?? 2;
                const moonSpeed = child.customData?.orbitSpeed ?? 2.0;
                const moonDist = child.customData?.orbitDistance ?? (child.width * 0.8);

                for (let j = 0; j < moonCount; j++) {
                  const mTheta = time * moonSpeed + (j * ((Math.PI * 2) / moonCount));
                  const mx = px + Math.cos(mTheta) * moonDist;
                  const my = py + Math.sin(mTheta) * moonDist;
                  
                  ctx.fillStyle = '#fff';
                  ctx.beginPath();
                  ctx.arc(mx, my, 4, 0, Math.PI*2);
                  ctx.fill();
                }
            }
         });
       } else {
           const count = obs.customData?.orbitCount ?? 3;
           if (count > 0) {
               const speed = obs.customData?.orbitSpeed ?? 1.0;
               const dist = obs.customData?.orbitDistance ?? (obs.width * 0.85);

               for (let i = 0; i < count; i++) {
                 const theta = time * speed + (i * ((Math.PI * 2) / count));
                 const px = cx + Math.cos(theta) * dist;
                 const py = cy + Math.sin(theta) * dist;
                 
                 ctx.fillStyle = '#00ff88';
                 ctx.beginPath();
                 ctx.arc(px, py, 14, 0, Math.PI*2);
                 ctx.fill();
               }
           }
       }
    }
    else if (['piston_v', 'hammer', 'rotor', 'cannon', 'spark_mine', 'laser_beam', 'crusher_jaw', 'swing_blade', 'falling_spike', 'growing_spike'].includes(obs.type)) {
       // Generic new obstacle handler for editor preview
       // Ideally copy exact drawing logic from GameCanvas, but for now simple distinct shapes
       ctx.fillStyle = '#ff8800'; 
       if (obs.type === 'hammer') {
          ctx.fillRect(drawX, drawY, obs.width, obs.height * 0.3); // Handle
          ctx.fillRect(drawX - 10, drawY, obs.width + 20, obs.height * 0.4); // Head
       } else if (obs.type === 'rotor') {
          ctx.beginPath(); ctx.arc(drawX + obs.width/2, drawY + obs.height/2, obs.width/2, 0, Math.PI*2); ctx.stroke();
          ctx.moveTo(drawX, drawY); ctx.lineTo(drawX + obs.width, drawY + obs.height); ctx.stroke();
          ctx.moveTo(drawX + obs.width, drawY); ctx.lineTo(drawX, drawY + obs.height); ctx.stroke();
       } else {
          // Fallback distinct block
          ctx.strokeStyle = '#ff8800';
          ctx.strokeRect(drawX, drawY, obs.width, obs.height);
          ctx.fillText(obs.type, drawX, drawY + 10);
       }
    }
    else if (obs.type === 'slope') {
      // 코리도 형성 삼각형
      ctx.fillStyle = '#222';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#000';
      ctx.beginPath();
      if (obs.angle! > 0) {
        // 왼쪽 하단 직각
        ctx.moveTo(drawX, drawY + obs.height);
        ctx.lineTo(drawX + obs.width, drawY);
        ctx.lineTo(drawX, drawY);
      } else {
        // 오른쪽 하단 직각
        ctx.moveTo(drawX + obs.width, drawY + obs.height);
        ctx.lineTo(drawX, drawY);
        ctx.lineTo(drawX + obs.width, drawY);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(100,200,255,0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (obs.type === 'saw') {
      const cx = drawX + obs.width / 2;
      const cy = drawY + obs.height / 2;
      
      ctx.save();
      ctx.translate(cx, cy);
      // Support non-uniform scaling (Ellipse)
      ctx.scale(obs.width / 2, obs.height / 2);

      ctx.fillStyle = '#ffaa00';
      ctx.shadowBlur = 40 / Math.max(obs.width, obs.height) * 10; // Adjust shadow for scale
      ctx.shadowColor = '#ffaa00';
      
      // Draw Body (Unit Circle -> Ellipse)
      ctx.beginPath(); ctx.arc(0, 0, 1, 0, Math.PI * 2); ctx.fill();
      
      // Draw Teeth
      ctx.fillStyle = '#ff6600';
      const teeth = 10;
      const rotation = time * 8;
      
      for (let i = 0; i < teeth; i++) {
        const angle = (Math.PI * 2 * i / teeth) + rotation;
        ctx.beginPath();
        // Teeth on the edge of unit circle
        const tx = Math.cos(angle) * 0.75;
        const ty = Math.sin(angle) * 0.75;
        const tr = 0.15;
        ctx.arc(tx, ty, tr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

    } else if (obs.type === 'spike_ball') {
      const cx = drawX + obs.width / 2;
      const cy = drawY + obs.height / 2;
      const rotation = time * 3;
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(obs.width / 2, obs.height / 2);

      ctx.fillStyle = '#444';
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i / 8) + rotation;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle - 0.2) * 0.8, Math.sin(angle - 0.2) * 0.8);
        ctx.lineTo(Math.cos(angle) * 1.2, Math.sin(angle) * 1.2);
        ctx.lineTo(Math.cos(angle + 0.2) * 0.8, Math.sin(angle + 0.2) * 0.8);
        ctx.fill();
      }
      
      const grad = ctx.createRadialGradient(-0.3, -0.3, 0.1, 0, 0, 1);
      grad.addColorStop(0, '#888'); grad.addColorStop(1, '#222');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(0, 0, 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

    } else if (obs.type === 'laser' || obs.type === 'v_laser') {
      const isV = obs.type === 'v_laser';
      const glow = Math.sin(time * 15) * 5 + 10;
      ctx.strokeStyle = '#ff3333';
      ctx.lineWidth = 2;
      ctx.shadowBlur = Math.max(0, glow);
      ctx.shadowColor = '#ff0000';
      ctx.beginPath();
      if (isV) {
        ctx.moveTo(drawX + obs.width/2, drawY); ctx.lineTo(drawX + obs.width/2, drawY + obs.height);
      } else {
        ctx.moveTo(drawX, drawY + obs.height/2); ctx.lineTo(drawX + obs.width, drawY + obs.height/2);
      }
      ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.shadowBlur = 0; ctx.stroke();
    } else if (obs.type === 'mine') {
       const cx = drawX + obs.width/2; const cy = drawY + obs.height/2;
       
       ctx.save();
       ctx.translate(cx, cy);
       ctx.scale(obs.width / 2, obs.height / 2);

       const pulse = Math.sin(time * 10) * 0.1 + 0.9;
       ctx.fillStyle = '#ff3333'; 
       // Adjusted shadow and scale
       ctx.shadowBlur = 10 / Math.max(1, (obs.width+obs.height)/100); 
       ctx.shadowColor = '#ff0000';
       
       ctx.beginPath();
       for(let i=0; i<6; i++){
         const a = (Math.PI/3)*i + time*2;
         ctx.lineTo(Math.cos(a)*pulse, Math.sin(a)*pulse);
       }
       ctx.closePath(); ctx.fill();
       ctx.restore();

    } else if (obs.type === 'orb') {
       const cx = drawX + obs.width/2; const cy = drawY + obs.height/2;
       ctx.save();
       ctx.translate(cx, cy);
       ctx.scale(obs.width/2, obs.height/2);

       const radius = (Math.sin(time*5)*0.1+1); // Base radius is 1.0 logic
       const grad = ctx.createRadialGradient(0, 0, radius*0.1, 0, 0, radius);
       grad.addColorStop(0, '#fff'); grad.addColorStop(0.4, '#aa44ff'); grad.addColorStop(1, 'rgba(68,0,204,0)');
       ctx.fillStyle = grad; ctx.globalCompositeOperation = 'lighter';
       ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI*2); ctx.fill();
       ctx.globalCompositeOperation = 'source-over';
       ctx.restore();
    }

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

      // Advance preview time strictly at 1.0x
      previewTime.value += dt;
      
      // Calculate where player SHOULD be based on time
      const targetX = 200 + previewTime.value * 350; 
      
      // Find current position in autoplay log efficiently
      let currentPoint = log[0];
      // Autoplay log is sorted by X. We can find the segment.
      for (let i = 0; i < log.length; i++) {
        if (log[i].x >= targetX) {
          if (i > 0) {
            const p1 = log[i-1];
            const p2 = log[i];
            const t = (targetX - p1.x) / (p2.x - p1.x);
            currentPoint = {
              x: targetX,
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
  });
});
</script>

<style scoped>
.editor-page {
  width: 100%;
  height: 100vh;
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
  height: 80px;
  margin: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  z-index: 10;
  flex-shrink: 0;
}

.title { font-size: 1.5rem; font-weight: 900; color: #00ffff; margin: 0; }
.version { font-size: 0.7rem; color: #666; vertical-align: middle; }

.map-title-input {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 4px;
}

.transport-controls {
  display: flex;
  gap: 1rem;
}

.control-btn {
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 900;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  white-space: nowrap;
}

.control-btn.test { background: #00ffaa; color: #000; }
.control-btn.tutorial { background: #ff00ff; color: #fff; }
.control-btn.save { background: #4d94ff; color: #fff; }
.control-btn.active { background: #00ffff; color: #000; box-shadow: 0 0 10px #00ffff; }
.control-btn.exit { background: transparent; border: 1px solid #444; color: #888; }

.main-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 10px;
  padding: 0 10px 10px 10px;
  overflow: hidden;
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

/* --- Mobile Responsiveness --- */
@media (max-width: 1024px) {
  .editor-page {
    height: 100vh;
    overflow: hidden;
  }

  .editor-header {
    height: auto;
    padding: 0.5rem 1rem;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .editor-header .left {
    width: 100%;
    margin-bottom: 5px;
  }
  
  .editor-header .center {
    width: 100%;
    overflow-x: auto;
  }
  
  .transport-controls {
    justify-content: flex-start;
  }

  .main-layout {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    gap: 10px;
  }
  
  .workspace {
    order: 1;
    min-height: 50vh;
    flex-shrink: 0;
  }
  
  .left-sidebar {
    order: 2;
    height: auto;
    max-height: 250px;
  }
  
  .right-sidebar {
    order: 3;
    height: auto;
    margin-bottom: 50px; /* Space for content */
  }

  .object-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .palette-item {
    flex: 1 1 calc(33.33% - 8px);
    min-width: 100px;
  }
  
  .input-pair {
    grid-template-columns: 1fr 1fr;
  }
}

@import '@/assets/css/smart_gen_ui.css';
</style>
