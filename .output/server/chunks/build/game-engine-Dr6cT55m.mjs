class MapGenerator {
  /**
   * Difficulty based gap calculation
   * 난이도가 높을수록 좁아짐
   */
  /**
   * Difficulty based gap calculation
   * 난이도가 높을수록 좁아짐
   */
  calculateGap(difficulty, isMini, safetyMultiplier = 1) {
    let baseGap;
    if (difficulty <= 7) {
      baseGap = 580 - (difficulty - 1) * 20;
    } else if (difficulty <= 15) {
      baseGap = 460 - (difficulty - 8) * 17.5;
    } else if (difficulty <= 23) {
      baseGap = 320 - (difficulty - 16) * 17.5;
    } else {
      baseGap = 180 - (difficulty - 24) * 15;
    }
    const minGap = difficulty >= 24 ? 120 : 160;
    baseGap = Math.max(minGap / safetyMultiplier, baseGap) * safetyMultiplier;
    return isMini ? baseGap * 1.5 : baseGap;
  }
  /**
   * 주어진 경로(path)를 따라 Geometry Dash Wave 스타일 맵 생성
   * - Grid Snapped Slopes (45도 경사 연결성 보장)
   * - Saw-filled Walls (Nine Circles)
   * - Rhythm-synced Decorations
   */
  generateFromPath(path, difficulty, beatTimes, stateEvents = [], safetyMultiplier = 1) {
    if (!path || path.length < 2) return [];
    const objects = [];
    const blockSize = 50;
    const baseGapVal = this.calculateGap(difficulty, false, safetyMultiplier);
    const startX = Math.floor(path[0].x / blockSize) * blockSize;
    const endX = path[path.length - 1].x;
    if (isNaN(startX) || isNaN(endX) || endX <= startX) return [];
    const poolFloor = ["spike", "piston_v", "hammer", "growing_spike", "cannon", "crusher_jaw"];
    const poolCeil = ["spike", "falling_spike", "hammer", "swing_blade", "piston_v", "crusher_jaw"];
    const poolFloat = ["mine", "rotor", "spark_mine", "laser_beam", "planet", "star"];
    const createBag = (pool) => {
      let bag = [...pool];
      let idx = 0;
      const shuffle = () => {
        for (let i = bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        idx = 0;
      };
      shuffle();
      return {
        next: () => {
          const val = bag[idx];
          idx++;
          if (idx >= bag.length) shuffle();
          return val;
        }
      };
    };
    const floorBag = createBag(poolFloor);
    const ceilBag = createBag(poolCeil);
    const floatBag = createBag(poolFloat);
    let currentFloorY = Math.floor((path[0].y + baseGapVal / 2) / blockSize) * blockSize;
    let currentCeilY = Math.floor((path[0].y - baseGapVal / 2) / blockSize) * blockSize;
    const boundaryMap = /* @__PURE__ */ new Map();
    let pathIdx = 0;
    let beatIdx = 0;
    beatTimes.sort((a, b) => a - b);
    let eventIdx = 0;
    let isMini = false;
    let currentGap = baseGapVal * (1 / 1.4);
    for (let currentX = startX; currentX < endX; currentX += blockSize) {
      const centerX = currentX + blockSize / 2;
      while (pathIdx < path.length - 1 && path[pathIdx + 1].x < centerX) {
        pathIdx++;
      }
      const currentPoint = path[pathIdx];
      if (!currentPoint) continue;
      const nextPoint = pathIdx < path.length - 1 ? path[pathIdx + 1] : currentPoint;
      const currentTime = currentPoint.time;
      while (eventIdx < stateEvents.length && stateEvents[eventIdx].time <= currentTime) {
        isMini = stateEvents[eventIdx].isMini;
        eventIdx++;
      }
      if (isMini) {
        currentGap = baseGapVal * 1.3;
      } else {
        currentGap = baseGapVal;
      }
      const halfGap = currentGap / 2;
      const nextX = currentX + blockSize;
      let nextPathIdx = pathIdx;
      while (nextPathIdx < path.length - 1 && path[nextPathIdx + 1].x < nextX) {
        nextPathIdx++;
      }
      const np = path[nextPathIdx];
      const targetFloorY = np.y + halfGap;
      const targetCeilY = np.y - halfGap;
      let stepY = 0;
      let ceilStepY = 0;
      let segMinY = Infinity;
      let segMaxY = -Infinity;
      for (let i = pathIdx; i <= nextPathIdx; i++) {
        const py = path[i].y;
        if (py < segMinY) segMinY = py;
        if (py > segMaxY) segMaxY = py;
      }
      const pSize = isMini ? 7.5 : 15;
      const genSafety = 5;
      const floorBoundary = segMaxY + pSize + genSafety;
      const ceilBoundary = segMinY - pSize - genSafety;
      const floorExpandThreshold = 10;
      const ceilExpandThreshold = 10;
      const floorDiff = targetFloorY - currentFloorY;
      const maxStep = blockSize * 5;
      if (Math.abs(floorDiff) > floorExpandThreshold) {
        stepY = Math.sign(floorDiff) * Math.min(maxStep, Math.abs(floorDiff));
        if (Math.abs(stepY) < blockSize * 1.5) stepY = Math.sign(stepY) * blockSize;
      }
      const ceilDiff = targetCeilY - currentCeilY;
      if (Math.abs(ceilDiff) > ceilExpandThreshold) {
        ceilStepY = Math.sign(ceilDiff) * Math.min(maxStep, Math.abs(ceilDiff));
        if (Math.abs(ceilStepY) < blockSize * 1.5) ceilStepY = Math.sign(ceilStepY) * blockSize;
      }
      if (stepY < 0 && currentFloorY + stepY < floorBoundary) {
        stepY = floorBoundary - currentFloorY;
        if (stepY > 0) stepY = 0;
      }
      if (ceilStepY > 0 && currentCeilY + ceilStepY > ceilBoundary) {
        ceilStepY = ceilBoundary - currentCeilY;
        if (ceilStepY < 0) ceilStepY = 0;
      }
      boundaryMap.set(currentX, { floorY: currentFloorY, ceilY: currentCeilY });
      if (stepY < 0) {
        const isSteep = stepY === -blockSize * 2;
        const slopeType = isSteep ? "steep_triangle" : "triangle";
        const slopeHeight = Math.abs(stepY);
        currentFloorY += stepY;
        const blockY = currentFloorY;
        objects.push({ type: slopeType, x: currentX, y: blockY, width: blockSize, height: slopeHeight, rotation: 0 });
        this.fillBelow(objects, currentX, blockY + slopeHeight, blockSize);
      } else if (stepY > 0) {
        const isSteep = stepY === blockSize * 2;
        const slopeType = isSteep ? "steep_triangle" : "triangle";
        const slopeHeight = Math.abs(stepY);
        const blockY = currentFloorY;
        objects.push({ type: slopeType, x: currentX, y: blockY, width: blockSize, height: slopeHeight, rotation: 90 });
        this.fillBelow(objects, currentX, blockY + slopeHeight, blockSize);
        currentFloorY += stepY;
      } else {
        const blockY = currentFloorY;
        objects.push({ type: "block", x: currentX, y: blockY, width: blockSize, height: blockSize });
        this.fillBelow(objects, currentX, blockY + blockSize, blockSize);
      }
      if (ceilStepY < 0) {
        const isSteep = ceilStepY === -blockSize * 2;
        const slopeType = isSteep ? "steep_triangle" : "triangle";
        const slopeHeight = Math.abs(ceilStepY);
        currentCeilY += ceilStepY;
        const blockY = currentCeilY;
        objects.push({ type: slopeType, x: currentX, y: blockY, width: blockSize, height: slopeHeight, rotation: 180 });
        this.fillAbove(objects, currentX, blockY, blockSize);
      } else if (ceilStepY > 0) {
        const isSteep = ceilStepY === blockSize * 2;
        const slopeType = isSteep ? "steep_triangle" : "triangle";
        const slopeHeight = Math.abs(ceilStepY);
        const blockY = currentCeilY;
        objects.push({ type: slopeType, x: currentX, y: blockY, width: blockSize, height: slopeHeight, rotation: -90 });
        this.fillAbove(objects, currentX, blockY, blockSize);
        currentCeilY += ceilStepY;
      } else {
        const blockY = currentCeilY - blockSize;
        objects.push({ type: "block", x: currentX, y: blockY, width: blockSize, height: blockSize });
        this.fillAbove(objects, currentX, blockY, blockSize);
      }
      const rand = Math.abs(Math.sin(currentX * 0.123 + currentFloorY * 0.456));
      const hazardThreshold = 0.2 + difficulty / 30 * 0.35;
      let forceFloorSpike = false;
      let forceCeilSpike = false;
      let antiStickChance = 0;
      if (difficulty >= 3) antiStickChance = 0.3;
      if (difficulty >= 10) antiStickChance = 0.5;
      if (difficulty >= 20) antiStickChance = 0.7;
      const isFlatFloor = stepY === 0;
      const isFlatCeil = ceilStepY === 0;
      if (currentGap > 120) {
        if (isFlatFloor && Math.random() < antiStickChance) {
          forceFloorSpike = true;
        }
        if (isFlatCeil && Math.random() < antiStickChance) {
          if (!forceFloorSpike || difficulty > 15) {
            forceCeilSpike = true;
          }
        }
      }
      const hasHazard = stepY === 0 && ceilStepY === 0 && rand < hazardThreshold;
      if (hasHazard || forceFloorSpike || forceCeilSpike) {
        const sizeVariance = 0.8 + Math.random() * 0.4;
        let baseH = 40;
        if (difficulty <= 5) baseH = 25;
        else if (difficulty > 20) baseH = 50;
        const spikeH = baseH * sizeVariance;
        let placeOnFloor = currentX / blockSize % 2 === 0;
        if (forceFloorSpike && !forceCeilSpike) placeOnFloor = true;
        else if (forceCeilSpike && !forceFloorSpike) placeOnFloor = false;
        else if (forceFloorSpike && forceCeilSpike) {
          placeOnFloor = Math.random() < 0.5;
        }
        if (placeOnFloor) {
          const type = floorBag.next();
          if (currentPoint.y < currentFloorY - spikeH - 20) {
            objects.push({
              type: type === "spike" && difficulty <= 8 ? "mini_spike" : type,
              x: currentX,
              y: currentFloorY - spikeH,
              width: blockSize,
              height: spikeH,
              movement: this.getRandomMovement(type, 0.4 / safetyMultiplier, safetyMultiplier)
            });
          }
        } else {
          const type = ceilBag.next();
          let adjustedCeilY = currentCeilY;
          if (type === "falling_spike") {
            const dist = currentPoint.y - currentCeilY;
            if (dist > 250) adjustedCeilY = currentPoint.y - 250;
          }
          if (currentPoint.y > adjustedCeilY + spikeH + 20) {
            objects.push({
              type: type === "spike" && difficulty <= 8 ? "mini_spike" : type,
              x: currentX,
              y: adjustedCeilY,
              width: blockSize,
              height: spikeH,
              rotation: 180,
              movement: this.getRandomMovement(type, 0.4 / safetyMultiplier, safetyMultiplier)
            });
          }
        }
      }
      if (rand > 0.94 && currentGap > 220) {
        const mineSize = (difficulty <= 7 ? 20 : 35) * (0.9 + Math.random() * 0.2);
        const midY = (currentFloorY + currentCeilY) / 2;
        let pY = currentPoint.y < midY ? midY + (currentFloorY - midY) * 0.5 : midY - (midY - currentCeilY) * 0.5;
        const obsType = floatBag.next();
        let children = void 0;
        let customData = void 0;
        if (obsType === "planet" || obsType === "star") {
          const count = obsType === "planet" ? 2 : 3;
          customData = { orbitSpeed: 1 + Math.random(), orbitDistance: mineSize * 0.8, orbitCount: count };
          children = Array(count).fill(0).map(() => ({ type: "moon", x: 0, y: 0, width: mineSize * 0.4, height: mineSize * 0.4, isHitbox: true }));
        }
        objects.push({
          type: obsType,
          x: currentX + 10,
          y: pY - mineSize / 2,
          width: mineSize,
          height: mineSize,
          isHitbox: true,
          rotation: obsType === "laser_beam" ? 90 : 0,
          children,
          customData,
          movement: this.getRandomMovement(obsType, 0.6 / safetyMultiplier, safetyMultiplier)
        });
      }
      while (beatIdx < beatTimes.length && beatTimes[beatIdx] < currentPoint.time) beatIdx++;
      while (beatIdx < beatTimes.length && beatTimes[beatIdx] <= nextPoint.time) {
        const beatY = (currentFloorY + currentCeilY) / 2 - 40;
        if (beatY >= currentCeilY && beatY + 80 <= currentFloorY) {
          objects.push({ type: "orb", x: currentX + 25, y: beatY, width: 80, height: 80, isHitbox: false });
        }
        beatIdx++;
      }
    }
    const filtered = objects.filter((obj) => {
      if (["block", "triangle", "steep_triangle"].includes(obj.type)) return true;
      if (["gravity_yellow", "gravity_blue", "speed_0.25", "speed_0.5", "speed_1", "speed_2", "speed_3", "speed_4", "mini_pink", "mini_green", "teleport_in", "teleport_out"].includes(obj.type)) return true;
      if (obj.type === "orb") return true;
      const bounds = boundaryMap.get(Math.floor(obj.x / blockSize) * blockSize);
      if (!bounds) return true;
      const top = obj.y;
      const bottom = obj.y + (obj.height || 0);
      if (bottom <= bounds.ceilY - 5) return false;
      if (top >= bounds.floorY + 5) return false;
      return true;
    });
    return this.consolidateBlocks(filtered);
  }
  /**
   * Merges adjacent blocks with same Y and Height into single wide blocks
   */
  consolidateBlocks(objects) {
    const terrain = objects.filter((o) => o.type === "block");
    const others = objects.filter((o) => o.type !== "block");
    if (terrain.length < 2) return objects;
    const mergedTerrain = [];
    terrain.sort((a, b) => {
      if (a.isHitbox !== b.isHitbox) return a.isHitbox ? 1 : -1;
      if (a.y !== b.y) return a.y - b.y;
      if (a.height !== b.height) return (a.height || 0) - (b.height || 0);
      return a.x - b.x;
    });
    let current = terrain[0];
    for (let i = 1; i < terrain.length; i++) {
      const next = terrain[i];
      const isAdjacent = Math.abs(current.x + (current.width || 0) - next.x) < 0.1;
      const sameY = current.y === next.y;
      const sameH = current.height === next.height;
      const sameMeta = current.isHitbox === next.isHitbox;
      if (isAdjacent && sameY && sameH && sameMeta) {
        current.width = (current.width || 0) + (next.width || 0);
      } else {
        mergedTerrain.push(current);
        current = next;
      }
    }
    mergedTerrain.push(current);
    return [...mergedTerrain, ...others];
  }
  fillBelow(objects, x, startY, size) {
    const mapBottom = 1e3;
    const height = mapBottom - startY;
    if (height > 0) {
      objects.push({
        type: "block",
        x,
        y: startY,
        width: size,
        height,
        isHitbox: true
      });
    }
  }
  fillAbove(objects, x, startY, size) {
    const mapTop = -500;
    const topY = mapTop;
    const height = startY - mapTop;
    if (height > 0) {
      objects.push({
        type: "block",
        x,
        y: topY,
        width: size,
        height,
        isHitbox: true
      });
    }
  }
  getRandomMovement(type, prob, safetyMultiplier = 1) {
    if (Math.random() > prob) return void 0;
    const useRotate = ["saw", "mine", "spike_ball", "rotor", "cannon", "spark_mine", "planet", "star"].includes(type);
    const useUpDown = !useRotate || Math.random() < 0.3;
    const rangeFactor = 1 / safetyMultiplier;
    const speedFactor = 1 / safetyMultiplier;
    if (useRotate && !useUpDown) {
      return {
        type: "rotate",
        speed: (1 + Math.random() * 2) * speedFactor,
        range: 360,
        phase: Math.random() * Math.PI * 2
      };
    } else {
      return {
        type: "updown",
        speed: (1.5 + Math.random() * 2.5) * speedFactor,
        range: (30 + Math.random() * 70) * rangeFactor,
        phase: Math.random() * Math.PI * 2
      };
    }
  }
}
class GameEngine {
  // Player state
  playerX = 200;
  playerY = 360;
  playerSize = 12;
  basePlayerSize = 12;
  miniPlayerSize = 12;
  // 미니 모드 히트박스 (일반과 동일)
  // Wave movement
  baseSpeed = 350;
  waveSpeed = 350;
  waveAmplitude = 350;
  isHolding = false;
  waveAngle = 45;
  // 기본 45도
  miniWaveAngle = 60;
  // 미니 모드 60도
  // Get dynamic base speed based on difficulty
  getDynamicBaseSpeed() {
    const diff = this.mapConfig.difficulty;
    if (diff <= 2) return 260;
    if (diff <= 7) return 300;
    if (diff <= 12) return 330;
    return 350;
  }
  // Gravity system
  isGravityInverted = false;
  speedMultiplier = 1;
  isMini = false;
  // Game boundaries
  minY = 140;
  maxY = 580;
  // Map elements
  obstacles = [];
  portals = [];
  // Pattern library
  patterns = [];
  // Map config
  mapConfig = {
    density: 1,
    portalFrequency: 0.15,
    difficulty: 5
  };
  // Camera
  cameraX = 0;
  // Game state
  isPlaying = false;
  isDead = false;
  failReason = "";
  startTime = 0;
  // Hitbox mode
  showHitboxes = false;
  // Score & Progress
  score = 0;
  progress = 0;
  totalLength = 0;
  // Track data
  // Validation feedback
  validationFailureInfo = null;
  trackDuration = 0;
  // Visual effects
  trail = [];
  particles = [];
  // AI state persistence
  aiStateTimer = 0;
  // 현재 입력을 유지한 시간 (초)
  aiPredictedPath = [];
  beatTimes = [];
  // Store beat times for effect synchronization
  // Boss System
  boss = {
    active: false,
    x: 0,
    y: 0,
    health: 100,
    maxHealth: 100,
    state: "idle",
    attackTimer: 0,
    projectiles: []
  };
  // Generation State Persistence
  lastStateEvents = [];
  lastBeatActions = [];
  // Measure Highlights
  lastMeasureIndex = -1;
  isMeasureHighlight = false;
  onPortalActivation = null;
  constructor(config) {
    if (config) {
      this.mapConfig = { ...this.mapConfig, ...config };
    }
    this.baseSpeed = this.getDynamicBaseSpeed();
    this.reset();
  }
  /**
   * 100개의 미리 정의된 패턴 초기화 (난이도 반영)
   */
  initPatterns() {
    this.patterns = [];
    const playH = this.maxY - this.minY;
    const diff = this.mapConfig.difficulty;
    const MIN_GAP = this.basePlayerSize * 4;
    let gapMultiplier = 1;
    if (diff < 8) {
      gapMultiplier = 2.5 - (diff - 1) / 7 * 0.7;
    } else if (diff < 16) {
      gapMultiplier = 1.3 - (diff - 8) / 8 * 0.5;
    } else if (diff < 24) {
      gapMultiplier = 0.8 - (diff - 16) / 8 * 0.35;
    } else {
      gapMultiplier = 0.45 - (diff - 24) / 7 * 0.3;
    }
    let blockGapFactor = 1;
    if (diff < 8) blockGapFactor = 4;
    else if (diff < 16) blockGapFactor = 1.5;
    else if (diff < 24) blockGapFactor = 1.2;
    else blockGapFactor = 1;
    const SPIKE_H = 40;
    for (let i = 0; i < 10; i++) {
      const h = 80 + i * 12;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;
      const obs = [];
      if (bh > 0) obs.push({ dx: 0, dy: playH - bh, w: 50, h: bh, type: "block" });
      obs.push({ dx: 0, dy: playH - h, w: 50, h: sh, type: "spike" });
      this.patterns.push({
        obstacles: obs,
        requiredY: "top",
        width: 60
      });
    }
    for (let i = 0; i < 10; i++) {
      const h = 80 + i * 12;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;
      const obs = [];
      obs.push({ dx: 0, dy: 0, w: 50, h: sh, type: "spike" });
      if (bh > 0) obs.push({ dx: 0, dy: sh, w: 50, h: bh, type: "block" });
      this.patterns.push({
        obstacles: obs,
        requiredY: "bottom",
        width: 60
      });
    }
    for (let i = 0; i < 10; i++) {
      const size = 120 + i * 15;
      const centerY = playH / 2 - size / 2;
      this.patterns.push({
        obstacles: [{ dx: 0, dy: centerY, w: size, h: size, type: "block" }],
        requiredY: i % 2 === 0 ? "top" : "bottom",
        width: size + 20,
        type: "square_block"
      });
    }
    for (let i = 0; i < 10; i++) {
      const baseGap = (160 - i * 8) * blockGapFactor;
      const gapSize = Math.max(MIN_GAP, baseGap * gapMultiplier);
      const topH = (playH - gapSize) / 2;
      const bottomY = topH + gapSize;
      const bottomH = playH - bottomY;
      const sh_top = Math.min(topH, SPIKE_H);
      const sh_bot = Math.min(bottomH, SPIKE_H);
      const obs = [
        { dx: 0, dy: Math.max(0, topH - sh_top), w: 40, h: Math.max(0, sh_top), type: "spike" },
        { dx: 0, dy: bottomY, w: 40, h: Math.max(0, sh_bot), type: "spike" }
      ];
      if (topH > sh_top) {
        obs.push({ dx: 0, dy: 0, w: 40, h: topH - sh_top, type: "block" });
      }
      if (bottomH > sh_bot) {
        obs.push({ dx: 0, dy: bottomY + sh_bot, w: 40, h: bottomH - sh_bot, type: "block" });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        width: 50
      });
    }
    for (let i = 0; i < 10; i++) {
      const size = 80 + i * 10;
      const positions = ["top", "middle", "bottom"];
      const pos = positions[i % 3];
      let dy = playH / 2 - size / 2;
      if (pos === "top") dy = size / 2 + 20;
      if (pos === "bottom") dy = playH - size - 20;
      this.patterns.push({
        obstacles: [{ dx: 0, dy, w: size, h: size, type: "saw" }],
        requiredY: pos === "top" ? "bottom" : pos === "bottom" ? "top" : i % 2 === 0 ? "top" : "bottom",
        width: size + 30
      });
    }
    for (let i = 0; i < 10; i++) {
      const count = 2 + Math.floor(i / 3);
      const obs = [];
      const h = 50;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;
      for (let j = 0; j < count; j++) {
        if (bh > 0) obs.push({ dx: j * 40, dy: playH - bh, w: 35, h: bh, type: "block" });
        obs.push({ dx: j * 40, dy: playH - h, w: 35, h: sh, type: "spike" });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "top",
        width: count * 40 + 20
      });
    }
    for (let i = 0; i < 10; i++) {
      const count = 2 + Math.floor(i / 3);
      const obs = [];
      const h = 50;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;
      for (let j = 0; j < count; j++) {
        obs.push({ dx: j * 40, dy: 0, w: 35, h: sh, type: "spike" });
        if (bh > 0) obs.push({ dx: j * 40, dy: sh, w: 35, h: bh, type: "block" });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "bottom",
        width: count * 40 + 20
      });
    }
    for (let i = 0; i < 10; i++) {
      const obs = [];
      const h = 100 + i * 12;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;
      obs.push({ dx: 0, dy: playH - h, w: 45, h: sh, type: "spike" });
      if (bh > 0) obs.push({ dx: 0, dy: playH - bh, w: 45, h: bh, type: "block" });
      obs.push({ dx: 60, dy: 0, w: 45, h: sh, type: "spike" });
      if (bh > 0) obs.push({ dx: 60, dy: sh, w: 45, h: bh, type: "block" });
      if (i >= 5) {
        obs.push({ dx: 120, dy: playH - h, w: 45, h: sh, type: "spike" });
        if (bh > 0) obs.push({ dx: 120, dy: playH - bh, w: 45, h: bh, type: "block" });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        width: i >= 5 ? 180 : 120
      });
    }
    for (let i = 0; i < 10; i++) {
      const gapY = 40 + i * 35;
      const baseGapH = (100 - i * 4) * blockGapFactor;
      const gapH = Math.max(MIN_GAP, baseGapH * gapMultiplier);
      this.patterns.push({
        obstacles: [
          { dx: 0, dy: 0, w: 40, h: gapY, type: "block" },
          { dx: 0, dy: gapY + gapH, w: 40, h: Math.max(0, playH - gapY - gapH), type: "block" }
        ],
        requiredY: gapY < playH / 3 ? "top" : gapY > playH * 2 / 3 - gapH ? "bottom" : "middle",
        width: 50,
        type: "corridor"
      });
    }
    for (let i = 0; i < 10; i++) {
      const obs = [];
      const h = 70;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;
      if (i % 2 === 0) {
        obs.push({ dx: 0, dy: playH - h, w: 50, h: sh, type: "spike" });
        if (bh > 0) obs.push({ dx: 0, dy: playH - bh, w: 50, h: bh, type: "block" });
        obs.push({ dx: -20, dy: 0, w: 15, h: 20, type: "mini_spike" });
        obs.push({ dx: 55, dy: 0, w: 15, h: 20, type: "mini_spike" });
      } else {
        obs.push({ dx: 0, dy: 0, w: 50, h: sh, type: "spike" });
        if (bh > 0) obs.push({ dx: 0, dy: sh, w: 50, h: bh, type: "block" });
        obs.push({ dx: -20, dy: playH - 20, w: 15, h: 20, type: "mini_spike" });
        obs.push({ dx: 55, dy: playH - 20, w: 15, h: 20, type: "mini_spike" });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: i % 2 === 0 ? "top" : "bottom",
        width: 80
      });
    }
    for (let i = 0; i < 10; i++) {
      const h = 15;
      const w = 200;
      const positions = ["top", "middle", "bottom"];
      const pos = positions[i % 3];
      let dy = playH / 2 - h / 2;
      if (pos === "top") dy = 60;
      if (pos === "bottom") dy = playH - 60 - h;
      this.patterns.push({
        obstacles: [{ dx: 0, dy, w, h, type: "laser" }],
        requiredY: pos === "top" ? "bottom" : pos === "bottom" ? "top" : i % 2 === 0 ? "top" : "bottom",
        width: w + 50,
        type: "laser_pattern"
      });
    }
    for (let i = 0; i < 10; i++) {
      const size = 60;
      const type = i % 2 === 0 ? "saw" : "spike_ball";
      const dy = playH / 2 - size / 2;
      this.patterns.push({
        obstacles: [{
          dx: 0,
          dy,
          w: size,
          h: size,
          type,
          movement: {
            type: "updown",
            range: 100 + i * 10,
            speed: 1 + i * 0.25,
            phase: i * Math.PI / 4
          }
        }],
        requiredY: "middle",
        width: 100,
        type: "moving_hazard"
      });
    }
    for (let i = 0; i < 10; i++) {
      const count = 3 + Math.floor(i / 3);
      const obs = [];
      for (let j = 0; j < count; j++) {
        const dy = 50 + j * 120 % (playH - 100);
        obs.push({ dx: j * 80, dy, w: 40, h: 40, type: "spike_ball" });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        width: count * 80,
        type: "spike_ball_field"
      });
    }
    for (let i = 0; i < 10; i++) {
      const w = 15;
      const xOffset = 0;
      const gapY = 100 + i * 100 % (playH - 200);
      const gapH = 150;
      this.patterns.push({
        obstacles: [
          { dx: xOffset, dy: 0, w, h: gapY, type: "v_laser" },
          { dx: xOffset, dy: gapY + gapH, w, h: playH - (gapY + gapH), type: "v_laser" }
        ],
        requiredY: gapY < playH / 3 ? "top" : gapY > playH * 2 / 3 - gapH ? "bottom" : "middle",
        width: 100,
        type: "vertical_laser_pattern"
      });
    }
    for (let i = 0; i < 10; i++) {
      const count = 2 + Math.floor(i / 2);
      const obs = [];
      for (let j = 0; j < count; j++) {
        const dy = 100 + Math.random() * (playH - 200);
        const dx = j * 60;
        obs.push({
          dx,
          dy,
          w: 30,
          h: 30,
          type: "mine",
          movement: { type: "updown", range: 30, speed: 2 + Math.random(), phase: j }
        });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        width: count * 60 + 50,
        type: "mine_field"
      });
    }
    for (let i = 0; i < 10; i++) {
      const size = 120;
      const cy = playH / 2 - size / 2;
      const obs = [];
      obs.push({
        dx: 0,
        dy: cy,
        w: 200,
        h: 30,
        type: "block",
        angle: 0,
        movement: { type: "rotate", range: 360, speed: 1.5 + i * 0.1, phase: 0 }
      });
      this.patterns.push({
        obstacles: obs,
        requiredY: i % 2 === 0 ? "top" : "bottom",
        width: 250,
        type: "spinning_bar"
      });
    }
    for (let i = 0; i < 10; i++) {
      const obs = [];
      const cy = playH / 2 - 25;
      obs.push({ dx: 50, dy: cy, w: 50, h: 50, type: "orb" });
      obs.push({ dx: 50, dy: 0, w: 50, h: 60, type: "spike" });
      obs.push({ dx: 50, dy: playH - 60, w: 50, h: 60, type: "spike" });
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        // 오브와 가시 사이 틈으로 지나가야 함? 
        // 사실 오브는 죽는거니까 오브 위나 아래로 지나가야 하는데 위아래 가시가 있음.
        // 오브가 작으니까(50) 틈이 있음.
        width: 150
      });
    }
    for (let i = 0; i < 10; i++) {
      const obs = [];
      const cy = playH / 2 - 20;
      obs.push({
        dx: 0,
        dy: cy,
        w: 240,
        h: 40,
        type: "block",
        movement: { type: "rotate", range: 360, speed: 2, phase: 0 }
      });
      obs.push({
        dx: 0,
        dy: cy,
        w: 240,
        h: 40,
        type: "block",
        movement: { type: "rotate", range: 360, speed: 2, phase: Math.PI / 2 }
      });
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        width: 300,
        type: "windmill"
      });
    }
    for (let i = 0; i < 10; i++) {
      const obs = [];
      const count = 3 + i % 3;
      for (let j = 0; j < count; j++) {
        obs.push({
          dx: j * 40,
          dy: 100 + j * 80 % (playH - 200),
          w: 25,
          h: 25,
          type: "mine"
        });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        width: count * 40,
        type: "mine_cluster"
      });
    }
    for (let i = 0; i < 10; i++) {
      const obs = [];
      const count = 4;
      for (let j = 0; j < count; j++) {
        obs.push({
          dx: j * 50,
          dy: 50 + j * 150 % (playH - 100),
          w: 30,
          h: 30,
          type: "orb"
        });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: "middle",
        width: count * 50,
        type: "orb_field"
      });
    }
  }
  reset() {
    this.playerX = 200;
    this.playerY = 360;
    this.cameraX = 0;
    this.isHolding = false;
    this.isPlaying = false;
    this.isDead = false;
    this.failReason = "";
    this.score = 0;
    this.progress = 0;
    this.trail = [];
    this.particles = [];
    this.obstacles = [];
    this.portals = [];
    this.isGravityInverted = false;
    this.baseSpeed = this.getDynamicBaseSpeed();
    this.waveSpeed = this.baseSpeed * this.speedMultiplier;
    this.waveAmplitude = this.baseSpeed;
    this.showHitboxes = false;
    this.isMini = false;
    this.waveAngle = 45;
    this.playerSize = this.basePlayerSize;
    this.aiStateTimer = 0;
    this.aiPredictedPath = [];
    this.lastAutoplayIndex = 0;
  }
  setMapConfig(config) {
    this.mapConfig = { ...this.mapConfig, ...config };
  }
  loadMapData(mapData) {
    if (!mapData) return;
    const restoreObjects = (list) => {
      if (!list || !Array.isArray(list)) return [];
      return list.map((o) => ({
        ...o,
        width: o.width ?? 50,
        height: o.height ?? 50,
        angle: o.angle ?? 0,
        initialY: o.initialY ?? o.y,
        movement: o.movement ?? { type: "none", range: 0, speed: 0, phase: 0 },
        children: o.children ? restoreObjects(o.children) : []
      }));
    };
    this.obstacles = restoreObjects(mapData.engineObstacles || []);
    this.portals = restoreObjects(mapData.enginePortals || []).map((p) => ({ ...p, activated: false }));
    if (mapData.autoplayLog && Array.isArray(mapData.autoplayLog) && mapData.autoplayLog.length > 0 && typeof mapData.autoplayLog[0] === "number") {
      const unpacked = [];
      for (let i = 0; i < mapData.autoplayLog.length; i += 4) {
        unpacked.push({
          x: mapData.autoplayLog[i],
          y: mapData.autoplayLog[i + 1],
          holding: mapData.autoplayLog[i + 2] === 1,
          time: mapData.autoplayLog[i + 3]
        });
      }
      this.autoplayLog = unpacked;
    } else {
      this.autoplayLog = mapData.autoplayLog ? [...mapData.autoplayLog] : [];
    }
    this.totalLength = (mapData.duration || 60) * this.getDynamicBaseSpeed() + 500;
    this.lastAutoplayIndex = 0;
    console.log(`[loadMapData] Restored ${this.obstacles.length} obstacles, ${this.portals.length} portals, ${this.autoplayLog.length} points.`);
  }
  // Autoplay data
  isAutoplay = false;
  autoplayLog = [];
  lastAutoplayIndex = 0;
  // 패턴 간격 배율 (재생성 시 증가)
  patternGapMultiplier = 1;
  // BPM 및 마디 길이 (음악 동기화용)
  bpm = 120;
  measureLength = 2;
  // 한 마디 길이 (초)
  /**
   * patterns.
   * @param offsetAttempt 외부에서 재시도를 관리할 때 사용하는 시도 횟수 오프셋
   * @param bpm 노래의 BPM (분당 박자 수)
   * @param measureLength 한 마디 길이 (초)
   */
  /**
   * 새로운 맵 생성 로직: 동선 우선 생성 방식
   * 1. 비트 타이밍에 맞춰 클릭/릴리즈를 번갈아가며 동선(autoplayLog)을 먼저 계산
   * 2. 마디마다 포탈을 배치  
   * 3. 동선을 따라가다가 동선에서 벗어나면 충돌하도록 장애물 배치
   * 4. AI 경로 검증 불필요 - 동선이 이미 안전하게 설계됨
   * @param resumeOptions (Optional) 이전 생성 결과에서 특정 지점까지 유지하고 그 이후부터 재생성
   */
  generateMap(beatTimes, sections, duration, fixedSeed, verify = true, offsetAttempt = 0, bpm = 120, measureLength = 2, volumeProfile, resumeOptions) {
    this.bpm = bpm;
    this.measureLength = measureLength;
    const seed = fixedSeed || beatTimes.length * 777 + Math.floor(duration * 100);
    const prevLog = [...this.autoplayLog];
    this.obstacles = [];
    this.portals = [];
    this.beatTimes = beatTimes || [];
    this.trackDuration = duration;
    this.totalLength = duration * this.baseSpeed + 2e3;
    this.autoplayLog = [];
    const generator = new MapGenerator();
    const difficulty = this.mapConfig.difficulty;
    const safetyMultiplier = 1 + Math.min(0.5, offsetAttempt * 0.05);
    const hazardMultiplier = Math.max(0.1, 1 - offsetAttempt * 0.1);
    console.log(`[MapGen] Seed: ${seed}, Attempt: ${offsetAttempt}, Safety: ${safetyMultiplier.toFixed(2)}, Hazard: ${hazardMultiplier.toFixed(2)}`);
    const rng = this.seededRandom(seed + offsetAttempt);
    let resumeState = null;
    if (resumeOptions) {
      const point = prevLog.find((p) => p.time >= resumeOptions.time);
      if (point) {
        resumeState = {
          time: resumeOptions.time,
          x: point.x,
          y: point.y,
          stateEvents: resumeOptions.stateEvents,
          beatActions: resumeOptions.beatActions
        };
      }
    }
    const stateEvents = this.generatePathBasedMap(beatTimes, sections, rng, volumeProfile, resumeState);
    this.lastStateEvents = stateEvents;
    let startX = 0;
    if (resumeState) {
      startX = resumeState.x;
      const oldObstacles = resumeOptions.obstacles.filter((o) => o.x + o.width <= startX);
      const oldPortals = resumeOptions.portals.filter((p) => p.x + p.width <= startX);
      this.obstacles = [...oldObstacles, ...this.obstacles];
      this.portals = [...oldPortals, ...this.portals];
    }
    let pathForGen = this.autoplayLog;
    if (startX > 0) {
      pathForGen = this.autoplayLog.filter((p) => p.x >= startX);
    }
    const mapObjects = generator.generateFromPath(pathForGen, difficulty, beatTimes, stateEvents, safetyMultiplier);
    for (const obj of mapObjects) {
      if (["gravity_yellow", "gravity_blue", "speed_0.25", "speed_0.5", "speed_1", "speed_2", "speed_3", "speed_4", "mini_pink", "mini_green"].includes(obj.type)) {
        this.portals.push({
          x: obj.x,
          y: this.minY,
          width: obj.width || 50,
          height: this.maxY - this.minY,
          type: obj.type,
          activated: false
        });
      } else {
        if (!["block", "triangle", "steep_triangle"].includes(obj.type)) {
          if (rng() > hazardMultiplier) continue;
        }
        this.obstacles.push({
          x: obj.x,
          y: obj.y,
          width: obj.width || 50,
          height: obj.height || 50,
          type: obj.type,
          angle: obj.rotation || 0,
          movement: obj.movement,
          initialY: obj.y,
          children: obj.children,
          customData: obj.customData
        });
      }
    }
    this.obstacles.sort((a, b) => a.x - b.x);
    this.portals.sort((a, b) => a.x - b.x);
    console.log(`[MapGen] Generated ${this.obstacles.length} obstacles, ${this.portals.length} portals total`);
  }
  /**
   * 동선 기반 맵 생성
   * 핵심: 비트에 맞춰 클릭/릴리즈를 번갈아가며 동선을 먼저 계산하고,
   * 그 동선에 맞춰 포탈과 장애물을 배치
   */
  generatePathBasedMap(beatTimes, sections, rng, volumeProfile, resumeOptions) {
    const diff = this.mapConfig.difficulty;
    this.maxY - this.minY;
    const dt = 1 / 60;
    const beatLength = 60 / this.bpm;
    const measureDuration = beatLength * 4;
    const measureTimes = [];
    const firstBeat = beatTimes.length > 0 ? Math.max(0.5, beatTimes[0]) : 0.5;
    for (let t = firstBeat; t < this.trackDuration; t += measureDuration) {
      measureTimes.push(t);
    }
    const resumeTime = resumeOptions?.time || 0;
    console.log(`[MapGen] BPM: ${this.bpm}, Measure Duration: ${measureDuration.toFixed(3)}s, Total Measures: ${measureTimes.length}`);
    const stateEvents = [];
    let currentSpeedType = "speed_1";
    let currentInverted = false;
    let currentMini = false;
    const initialEvents = [{
      time: 0.5,
      // 첫 비트 근처
      speedType: "speed_1",
      // 기본값
      isInverted: false,
      isMini: false
    }];
    const initialEvent = initialEvents[0];
    if (diff >= 5 && initialEvent) {
      const r = rng();
      if (r < 0.3) initialEvent.speedType = "speed_0.5";
      else if (r < 0.6) initialEvent.speedType = "speed_2";
    }
    stateEvents.push(...initialEvents);
    if (initialEvents[0]) {
      currentSpeedType = initialEvents[0].speedType;
    }
    if (resumeOptions) {
      const keptEvents = resumeOptions.stateEvents.filter((e) => e.time < resumeTime);
      stateEvents.length = 0;
      stateEvents.push(...keptEvents);
      if (stateEvents.length > 0) {
        const last = stateEvents[stateEvents.length - 1];
        if (last) {
          currentSpeedType = last.speedType;
          currentInverted = last.isInverted;
          currentMini = last.isMini;
        }
      }
    }
    for (const measureTime of measureTimes) {
      if (measureTime < 1) continue;
      if (measureTime < resumeTime) continue;
      const section = sections?.find((s) => measureTime >= s.startTime && measureTime < s.endTime);
      section?.intensity || 0.5;
      let newSpeedType;
      if (diff < 8) {
        const r = rng();
        if (r < 0.8) newSpeedType = "speed_1";
        else if (r < 0.9) newSpeedType = "speed_0.5";
        else newSpeedType = "speed_2";
      } else if (diff < 16) {
        const r = rng();
        if (r < 0.1) newSpeedType = "speed_0.5";
        else if (r < 0.6) newSpeedType = "speed_1";
        else newSpeedType = "speed_2";
      } else if (diff < 24) {
        const r = rng();
        if (r < 0.15) newSpeedType = "speed_0.5";
        else if (r < 0.4) newSpeedType = "speed_1";
        else if (r < 0.8) newSpeedType = "speed_2";
        else newSpeedType = "speed_3";
      } else {
        const r = rng();
        if (r < 0.1) newSpeedType = "speed_0.25";
        else if (r < 0.25) newSpeedType = "speed_0.5";
        else if (r < 0.4) newSpeedType = "speed_1";
        else if (r < 0.5) newSpeedType = "speed_2";
        else if (r < 0.8) newSpeedType = "speed_3";
        else newSpeedType = "speed_4";
      }
      const gravityChance = diff >= 24 ? 0.9 : diff < 8 ? 0.25 : 0.5;
      let newInverted = currentInverted;
      if (rng() < gravityChance && diff >= 3) {
        newInverted = rng() > 0.5;
      }
      let newMini = currentMini;
      if (diff >= 5) {
        if (!currentMini) {
          const miniEntryChance = diff >= 24 ? 0.08 : 0.04;
          if (rng() < miniEntryChance) newMini = true;
        } else {
          const miniExitChance = 0.6;
          if (rng() < miniExitChance) newMini = false;
        }
      } else {
        newMini = false;
      }
      if (newSpeedType !== currentSpeedType || newInverted !== currentInverted || newMini !== currentMini) {
        stateEvents.push({
          time: measureTime,
          speedType: newSpeedType,
          isInverted: newInverted,
          isMini: newMini
        });
        currentSpeedType = newSpeedType;
        currentInverted = newInverted;
        currentMini = newMini;
      }
    }
    const beatActions = [];
    if (resumeOptions) {
      beatActions.push(...resumeOptions.beatActions.filter((b) => b.time < resumeTime));
    }
    const sortedBeats = [...beatTimes].filter((t) => t >= 0.3 && t >= resumeTime).sort((a, b) => a - b);
    let isHolding = false;
    if (resumeOptions && resumeOptions.beatActions.length > 0) {
      const lastAction = resumeOptions.beatActions[resumeOptions.beatActions.length - 1];
      if (lastAction.action === "click") {
        isHolding = true;
      }
    }
    const fastThreshold = 0.25;
    for (let i = 0; i < sortedBeats.length; i++) {
      const beatTime = sortedBeats[i];
      const nextBeatTime = i + 1 < sortedBeats.length ? sortedBeats[i + 1] : beatTime + 1;
      const interval = nextBeatTime - beatTime;
      if (interval < fastThreshold) {
        beatActions.push({ time: beatTime, action: isHolding ? "release" : "click" });
        isHolding = !isHolding;
      } else {
        if (isHolding) {
          const baseFactor = 0.5;
          const variance = (rng() - 0.5) * 0.3;
          const holdFactor = Math.max(0.3, Math.min(0.8, baseFactor + variance));
          beatActions.push({ time: beatTime, action: "click" });
          beatActions.push({ time: beatTime + interval * holdFactor, action: "release" });
          isHolding = false;
        } else {
          const baseFactor = 0.5;
          const variance = (rng() - 0.5) * 0.3;
          const holdFactor = Math.max(0.3, Math.min(0.8, baseFactor + variance));
          beatActions.push({ time: beatTime, action: "click" });
          beatActions.push({ time: beatTime + interval * holdFactor, action: "release" });
          isHolding = false;
        }
      }
    }
    beatActions.sort((a, b) => a.time - b.time);
    const cleanedActions = [];
    for (const act of beatActions) {
      if (cleanedActions.length > 0) {
        const last = cleanedActions[cleanedActions.length - 1];
        if (act.time - last.time < 0.01) {
          cleanedActions.pop();
        }
      }
      cleanedActions.push(act);
    }
    beatActions.length = 0;
    beatActions.push(...cleanedActions);
    beatActions.sort((a, b) => a.time - b.time);
    const dedupedActions = [];
    for (const action of beatActions) {
      const last = dedupedActions[dedupedActions.length - 1];
      if (!last || Math.abs(last.time - action.time) > 0.03 || last.action !== action.action) {
        dedupedActions.push(action);
      }
    }
    beatActions.length = 0;
    beatActions.push(...dedupedActions);
    this.autoplayLog = [];
    let simX = 200;
    let simY = 360;
    let simTime = 0;
    let simHolding = false;
    let simGravity = false;
    let simSpeed = 1;
    let simMini = false;
    let simAngle = 45;
    let beatActionIdx = 0;
    let stateEventIdx = 0;
    if (resumeOptions && resumeOptions.time > 0) {
      simTime = resumeOptions.time;
      simX = resumeOptions.x || 200;
      simY = resumeOptions.y || 360;
    }
    while (stateEventIdx < stateEvents.length && stateEvents[stateEventIdx].time <= simTime) {
      const se = stateEvents[stateEventIdx];
      simSpeed = this.getSpeedMultiplierFromType(se.speedType);
      simGravity = se.isInverted;
      simMini = se.isMini;
      simAngle = this.getEffectiveAngle(simMini, simSpeed);
      stateEventIdx++;
    }
    while (beatActionIdx < beatActions.length && beatActions[beatActionIdx].time <= simTime) {
      const ba = beatActions[beatActionIdx];
      simHolding = ba.action === "click";
      beatActionIdx++;
    }
    if (resumeOptions && resumeOptions.time > 0) ;
    while (simTime < this.trackDuration + 1) {
      const spd = this.baseSpeed * simSpeed;
      const amp = spd * Math.tan(simAngle * Math.PI / 180);
      let vy;
      if (simGravity) {
        vy = simHolding ? 1 : -1;
      } else {
        vy = simHolding ? -1 : 1;
      }
      simY += amp * vy * dt;
      const margin = 70;
      if (simY < this.minY + margin) simY = this.minY + margin;
      if (simY > this.maxY - margin) simY = this.maxY - margin;
      simX += spd * dt;
      this.autoplayLog.push({
        x: simX,
        y: simY,
        holding: simHolding,
        time: simTime
      });
      simTime += dt;
    }
    this.lastBeatActions = beatActions;
    this.totalLength = simX + 500;
    for (const se of stateEvents) {
      const pathPoint = this.autoplayLog.find((p) => Math.abs(p.time - se.time) < 0.02);
      if (!pathPoint) continue;
      const portalTypes = [];
      const prevEvent = stateEvents[stateEvents.indexOf(se) - 1];
      const prevSpeed = prevEvent?.speedType || "speed_1";
      const prevInverted = prevEvent?.isInverted || false;
      const prevMini = prevEvent?.isMini || false;
      if (se.speedType !== prevSpeed) {
        portalTypes.push(se.speedType);
      }
      if (se.isInverted !== prevInverted) {
        portalTypes.push(se.isInverted ? "gravity_yellow" : "gravity_blue");
      }
      if (se.isMini !== prevMini) {
        portalTypes.push(se.isMini ? "mini_pink" : "mini_green");
      }
      if (portalTypes.length > 0) {
        this.generatePathAlignedPortals(pathPoint.x, pathPoint.y, portalTypes);
      }
    }
    return stateEvents;
  }
  /**
   * 동선에 맞춰 포탈 배치 (정상 크기, 경로 사이에 배치)
   */
  generatePathAlignedPortals(xPos, pathY, types) {
    const portalWidth = 64;
    const portalHeight = 240;
    const horizontalSpacing = 80;
    const diff = this.mapConfig.difficulty;
    const safetyMargin = diff >= 24 ? 40 : 20;
    types.forEach((type, horizontalIndex) => {
      const currentX = xPos + horizontalIndex * (portalWidth + horizontalSpacing);
      const portalY = pathY - portalHeight / 2;
      this.portals.push({
        x: currentX,
        y: this.minY,
        width: portalWidth,
        height: this.maxY - this.minY,
        type,
        activated: false
      });
      if (this.mapConfig.difficulty <= 2) return;
      const topWallHeight = portalY - this.minY - safetyMargin;
      if (topWallHeight > 20) {
        this.obstacles.push({
          x: currentX - 5,
          y: this.minY,
          width: portalWidth + 10,
          height: topWallHeight,
          type: "block",
          initialY: this.minY
        });
      }
      const bottomWallStart = portalY + portalHeight + safetyMargin;
      const bottomWallHeight = this.maxY - bottomWallStart;
      if (bottomWallHeight > 20) {
        this.obstacles.push({
          x: currentX - 5,
          y: bottomWallStart,
          width: portalWidth + 10,
          height: bottomWallHeight,
          type: "block",
          initialY: bottomWallStart
        });
      }
    });
  }
  /**
   * 장애물이 동선과 충돌하는지 검사
   * @returns true if safe (no collision), false if collides with path
   */
  /**
   * 장애물이 동선과 충돌하는지 검사 (Binary Search Optimized)
   * @returns true if safe (no collision), false if collides with path
   */
  isObstacleSafe(obsX, obsY, obsW, obsH, margin = 0) {
    const playerSize = this.basePlayerSize + margin;
    const checkMinX = obsX - playerSize;
    const checkMaxX = obsX + obsW + playerSize;
    let l = 0, r = this.autoplayLog.length;
    while (l < r) {
      const mid = l + r >>> 1;
      if (this.autoplayLog[mid].x < checkMinX) l = mid + 1;
      else r = mid;
    }
    const startIndex = l;
    for (let i = startIndex; i < this.autoplayLog.length; i++) {
      const point = this.autoplayLog[i];
      if (point.x > checkMaxX) break;
      if (point.y >= obsY - playerSize && point.y <= obsY + obsH + playerSize) {
        return false;
      }
    }
    return true;
  }
  /**
   * 동선 강제를 위한 장애물 배치 (체계적인 패턴 사용)
   * 패턴: 블록/레이저 벽, 기울어진 블록, 이동 장애물
   * 미니 상태: 60도 기울어진 블록만 사용
   */
  placeObstaclesForPath(beatActions, stateEvents, rng, diff) {
    const normDiff = Math.max(0.1, diff / 30);
    const pRadius = this.basePlayerSize;
    let currentSpeed = 1;
    let isMini = false;
    const portalStates = [];
    this.portals.forEach((p) => {
      if (p.type === "mini_pink") {
        portalStates.push({ x: p.x, isMini: true, speed: currentSpeed });
      } else if (p.type === "mini_green") {
        portalStates.push({ x: p.x, isMini: false, speed: currentSpeed });
      } else if (p.type.startsWith("speed_")) {
        const speedVal = parseFloat(p.type.replace("speed_", ""));
        portalStates.push({ x: p.x, isMini, speed: speedVal });
      }
    });
    portalStates.sort((a, b) => a.x - b.x);
    const getSpacingMultiplier = (speed) => {
      if (speed <= 0.5) return 0.4;
      if (speed <= 1) return 1;
      if (speed <= 2) return 1.5;
      return 2;
    };
    const getSafeMargin = () => {
      const baseMargin = Math.max(pRadius + 5, 50 - normDiff * 35);
      return isMini ? baseMargin * 0.5 : baseMargin;
    };
    const sectionLength = 800;
    let lastPatternX = 400;
    console.log(`[MapGen] Starting path obstacle placement - Diff: ${diff}`);
    for (let x = 500; x < this.totalLength - 300; x += 100) {
      const pathPoint = this.autoplayLog.find((p) => Math.abs(p.x - x) < 50);
      if (!pathPoint) continue;
      const simTime = pathPoint.time;
      const currentEvent = [...stateEvents].reverse().find((e) => e.time <= simTime);
      if (currentEvent) {
        isMini = currentEvent.isMini;
        currentSpeed = this.getSpeedMultiplierFromType(currentEvent.speedType);
      }
      const pathY = pathPoint.y;
      const safeMargin = getSafeMargin();
      const spacingMult = getSpacingMultiplier(currentSpeed);
      if (x - lastPatternX < 150 * spacingMult) continue;
      if (isMini) {
        this.placeTiltedBlock(x, pathY, safeMargin, 60, rng);
        lastPatternX = x;
        continue;
      }
      const patternType = Math.floor((x - 500) / sectionLength) % 4;
      if (patternType === 0) {
        this.placeBlockWall(x, pathY, safeMargin, rng);
        lastPatternX = x;
      } else if (patternType === 1) {
        this.placeTiltedBlock(x, pathY, safeMargin, 45, rng);
        lastPatternX = x;
      } else if (patternType === 2) {
        this.placeLaserWall(x, pathY, safeMargin, rng);
        lastPatternX = x;
      } else {
        if (diff >= 10) {
          this.placeMovingObstacle(x, pathY, safeMargin, pathPoint.time, rng);
          lastPatternX = x;
        } else {
          this.placeBlockWall(x, pathY, safeMargin, rng);
          lastPatternX = x;
        }
      }
      const nearBeat = beatActions.find((b) => Math.abs(b.time * this.baseSpeed + 200 - x) < 100);
      if (nearBeat && rng() < 0.3 + normDiff * 0.3) {
        this.placeRapidBlocks(x, pathY, safeMargin, 3, rng);
      }
    }
  }
  // Override or Disable internal obstacle placement in generatePathBasedMap
  // Actually, generatePathBasedMap is called BY generateMap.
  // We can just comment out the call to placeObstaclesForPath inside generatePathBasedMap.
  // But wait, generatePathBasedMap definition is below. Let's find where it calls placeObstaclesForPath.
  /**
   * 블록 벽 배치 (위/아래)
   */
  placeBlockWall(x, pathY, safeMargin, rng) {
    const wallWidth = 50 + Math.floor(rng() * 30);
    const topHeight = pathY - safeMargin - this.minY;
    if (topHeight > 30 && this.isObstacleSafe(x, this.minY, wallWidth, topHeight, 3)) {
      this.obstacles.push({
        x,
        y: this.minY,
        width: wallWidth,
        height: topHeight,
        type: "block",
        initialY: this.minY
      });
    }
    const bottomStart = pathY + safeMargin;
    const bottomHeight = this.maxY - bottomStart;
    if (bottomHeight > 30 && this.isObstacleSafe(x, bottomStart, wallWidth, bottomHeight, 3)) {
      this.obstacles.push({
        x,
        y: bottomStart,
        width: wallWidth,
        height: bottomHeight,
        type: "block",
        initialY: bottomStart
      });
    }
  }
  /**
   * 기울어진 블록 배치 - 웨이브 방향에 맞춘 코리도(통로) 형성
   * 이미지 참조: 위로 올라갈 때와 아래로 내려갈 때 다른 방향의 슬로프
   */
  placeTiltedBlock(x, pathY, safeMargin, angle, rng) {
    const blockSize = 100 + Math.floor(rng() * 50);
    const prevPoint = this.autoplayLog.find((p) => Math.abs(p.x - (x - 100)) < 60);
    const nextPoint = this.autoplayLog.find((p) => Math.abs(p.x - (x + 100)) < 60);
    let goingUp = true;
    if (prevPoint && nextPoint) {
      goingUp = nextPoint.y < prevPoint.y;
    } else if (prevPoint) {
      goingUp = pathY < prevPoint.y;
    }
    const topY = pathY - safeMargin - blockSize;
    if (topY > this.minY && this.isObstacleSafe(x, topY, blockSize, blockSize, 3)) {
      this.obstacles.push({
        x,
        y: topY,
        width: blockSize,
        height: blockSize,
        type: "slope",
        initialY: topY,
        angle: goingUp ? angle : -angle
        // 올라갈 때: 양수(왼쪽 하단), 내려갈 때: 음수(오른쪽 하단)
      });
    }
    const bottomY = pathY + safeMargin;
    if (bottomY + blockSize < this.maxY && this.isObstacleSafe(x, bottomY, blockSize, blockSize, 3)) {
      this.obstacles.push({
        x,
        y: bottomY,
        width: blockSize,
        height: blockSize,
        type: "slope",
        initialY: bottomY,
        angle: goingUp ? -angle : angle
        // 올라갈 때: 음수(오른쪽 상단), 내려갈 때: 양수(왼쪽 상단)
      });
    }
    if (rng() < 0.3) {
      const sawSize = 40 + Math.floor(rng() * 30);
      const sawX = x + blockSize + 30;
      const sawY = pathY - sawSize / 2;
      if (this.isObstacleSafe(sawX, sawY, sawSize, sawSize, 3)) {
        this.obstacles.push({
          x: sawX,
          y: sawY,
          width: sawSize,
          height: sawSize,
          type: "spike_ball",
          initialY: sawY
        });
      }
    }
  }
  /**
   * 레이저 벽 배치
   */
  placeLaserWall(x, pathY, safeMargin, rng) {
    const laserWidth = 30;
    const topHeight = pathY - safeMargin - this.minY - 20;
    if (topHeight > 50) {
      this.obstacles.push({
        x: x + 10,
        y: this.minY,
        width: laserWidth,
        height: topHeight,
        type: "v_laser",
        initialY: this.minY
      });
    }
    const bottomStart = pathY + safeMargin + 20;
    const bottomHeight = this.maxY - bottomStart;
    if (bottomHeight > 50) {
      this.obstacles.push({
        x: x + 10,
        y: bottomStart,
        width: laserWidth,
        height: bottomHeight,
        type: "v_laser",
        initialY: bottomStart
      });
    }
  }
  /**
   * 이동하는 장애물 배치 (사전 계산된 위치)
   */
  placeMovingObstacle(x, pathY, safeMargin, time, rng) {
    const obsSize = 40 + Math.floor(rng() * 20);
    const moveRange = 80 + Math.floor(rng() * 60);
    const moveSpeed = 1.5 + rng() * 1.5;
    const topBaseY = pathY - safeMargin - obsSize - 30;
    if (topBaseY > this.minY + moveRange) {
      this.obstacles.push({
        x,
        y: topBaseY,
        width: obsSize,
        height: obsSize,
        type: "saw",
        initialY: topBaseY,
        moveY: { range: moveRange, speed: moveSpeed }
      });
    }
    const bottomBaseY = pathY + safeMargin + 30;
    if (bottomBaseY + obsSize + moveRange < this.maxY) {
      this.obstacles.push({
        x,
        y: bottomBaseY,
        width: obsSize,
        height: obsSize,
        type: "spike_ball",
        initialY: bottomBaseY,
        moveY: { range: moveRange, speed: moveSpeed }
      });
    }
  }
  /**
   * 연타 블록 배치 (빠른 비트용)
   */
  placeRapidBlocks(startX, pathY, safeMargin, count, rng) {
    const blockWidth = 30;
    const gap = 60;
    for (let i = 0; i < count; i++) {
      const x = startX + i * gap;
      const isTop = i % 2 === 0;
      if (isTop) {
        const topHeight = pathY - safeMargin - this.minY;
        if (topHeight > 20 && this.isObstacleSafe(x, this.minY, blockWidth, topHeight, 2)) {
          this.obstacles.push({
            x,
            y: this.minY,
            width: blockWidth,
            height: topHeight,
            type: "block",
            initialY: this.minY
          });
        }
      } else {
        const bottomStart = pathY + safeMargin;
        const bottomHeight = this.maxY - bottomStart;
        if (bottomHeight > 20 && this.isObstacleSafe(x, bottomStart, blockWidth, bottomHeight, 2)) {
          this.obstacles.push({
            x,
            y: bottomStart,
            width: blockWidth,
            height: bottomHeight,
            type: "block",
            initialY: bottomStart
          });
        }
      }
    }
  }
  /**
   * 작은 장애물 타입 (동선 강제용) - 다양한 타입 사용
   */
  getSmallObstacleType(rng, diff) {
    const r = rng();
    if (diff < 8) {
      if (r < 0.4) return "spike";
      if (r < 0.7) return "mini_spike";
      return "orb";
    } else if (diff < 16) {
      if (r < 0.25) return "spike";
      if (r < 0.4) return "saw";
      if (r < 0.55) return "orb";
      if (r < 0.7) return "mini_spike";
      if (r < 0.85) return "spike_ball";
      return "mine";
    } else if (diff < 24) {
      if (r < 0.2) return "spike";
      if (r < 0.35) return "saw";
      if (r < 0.5) return "spike_ball";
      if (r < 0.65) return "mine";
      if (r < 0.8) return "orb";
      return "laser";
    } else {
      if (r < 0.15) return "spike";
      if (r < 0.25) return "saw";
      if (r < 0.4) return "spike_ball";
      if (r < 0.55) return "mine";
      if (r < 0.7) return "orb";
      if (r < 0.85) return "laser";
      return "v_laser";
    }
  }
  /**
   * 난이도에 따른 랜덤 장애물 타입
   */
  getRandomObstacleType(rng, diff) {
    if (diff < 8) {
      return rng() > 0.5 ? "block" : "spike";
    } else if (diff < 16) {
      const types = ["block", "spike", "saw", "mini_spike"];
      return types[Math.floor(rng() * types.length)];
    } else if (diff < 24) {
      const types = ["block", "spike", "saw", "laser", "spike_ball"];
      return types[Math.floor(rng() * types.length)];
    } else {
      const types = ["block", "spike", "saw", "laser", "spike_ball", "mine", "orb", "v_laser"];
      return types[Math.floor(rng() * types.length)];
    }
  }
  /**
   * 난이도에 따른 장식 장애물 타입
   */
  getRandomDecorationType(rng, diff) {
    if (diff < 16) {
      const types = ["mini_spike", "orb"];
      return types[Math.floor(rng() * types.length)];
    } else {
      const types = ["mine", "spike_ball", "saw", "orb"];
      return types[Math.floor(rng() * types.length)];
    }
  }
  getSpeedMultiplierFromType(type) {
    if (type === "speed_0.25") return Math.sqrt(0.25);
    if (type === "speed_0.5") return Math.sqrt(0.5);
    if (type === "speed_1") return 1;
    if (type === "speed_2") return Math.sqrt(2);
    if (type === "speed_3") return Math.sqrt(3);
    if (type === "speed_4") return Math.sqrt(4);
    return 1;
  }
  getEffectiveAngle(isMini, speedMultiplier) {
    if (!isMini) return 45;
    if (speedMultiplier >= 1.9) return 78;
    if (speedMultiplier >= 1.7) return 72;
    return 60;
  }
  getValidPatterns(lastPos, rng, lastType) {
    const transitions = {
      "top": ["top", "middle"],
      "middle": ["top", "middle", "bottom"],
      "bottom": ["middle", "bottom"]
    };
    const validPositions = transitions[lastPos] || ["middle"];
    let filtered = this.patterns.filter((p) => validPositions.includes(p.requiredY));
    if (lastType === "corridor") {
      filtered = filtered.filter((p) => p.type !== "corridor");
    }
    return filtered;
  }
  placePattern(pattern, xPos) {
    const baseY = this.minY;
    for (const obs of pattern.obstacles) {
      this.obstacles.push({
        x: xPos + obs.dx,
        y: baseY + obs.dy,
        width: obs.w,
        height: obs.h,
        type: obs.type,
        initialY: baseY + obs.dy
      });
    }
  }
  /**
   * 속도/미니 상태에 따라 크기 조절된 패턴 배치
   * @param gapScale 외부에서 계산된 간격 스케일
   */
  placePatternWithScale(pattern, xPos, speed, isMini, gapScale) {
    const baseY = this.minY;
    const playH = this.maxY - this.minY;
    let sizeScale = 1;
    if (speed > 1.2) sizeScale *= 0.85;
    if (speed < 0.8) sizeScale *= 1.15;
    if (isMini) sizeScale *= 0.75;
    for (const obs of pattern.obstacles) {
      let h = obs.h * sizeScale;
      let w = obs.w * sizeScale;
      let dy = obs.dy;
      const isTopAnchored = obs.dy < playH / 2;
      if (isTopAnchored) {
        dy = obs.dy * sizeScale;
      } else {
        const distFromBottom = playH - (obs.dy + obs.h);
        dy = playH - distFromBottom * sizeScale - h;
      }
      this.obstacles.push({
        x: xPos + obs.dx * gapScale,
        y: baseY + dy,
        width: w,
        height: h,
        type: obs.type,
        angle: obs.angle,
        movement: obs.movement ? { ...obs.movement } : void 0,
        initialY: baseY + dy
      });
    }
  }
  /**
   * 지정된 타입들로 포탈 생성 (비트/섹션에 맞춤)
   * 여러 타입이 올 경우 하나의 블록 세트 안에 나란히 배치
   */
  generatePortalWithType(xPos, firstType, rng, extraTypes = []) {
    const portalHeight = 100;
    const portalWidth = 50;
    const spacing = 40;
    const playH = this.maxY - this.minY;
    const centerY = this.minY + 80 + rng() * (playH - 160);
    const allTypes = [firstType, ...extraTypes];
    const totalWidth = allTypes.length * portalWidth + (allTypes.length - 1) * spacing;
    allTypes.forEach((type, i) => {
      this.portals.push({
        x: xPos + i * (portalWidth + spacing),
        y: centerY - portalHeight / 2,
        width: portalWidth,
        height: portalHeight,
        type,
        activated: false
      });
    });
    const entryMargin = this.basePlayerSize * 2.2;
    const portalTop = centerY - portalHeight / 2;
    const portalBottom = centerY + portalHeight / 2;
    if (portalTop > this.minY + entryMargin) {
      this.obstacles.push({
        x: xPos - 10,
        y: this.minY,
        width: totalWidth + 20,
        height: portalTop - this.minY - entryMargin,
        type: "block",
        initialY: this.minY
      });
    }
    if (portalBottom < this.maxY - entryMargin) {
      this.obstacles.push({
        x: xPos - 10,
        y: portalBottom + entryMargin,
        width: totalWidth + 20,
        height: this.maxY - (portalBottom + entryMargin),
        type: "block",
        initialY: portalBottom + entryMargin
      });
    }
  }
  /**
   * 랜덤 타입으로 포탈 생성 (기존 호환)
   * 난이도에 따라 빠른 속도 포탈 제한
   */
  generatePortal(xPos, rng) {
    let portalTypes = [
      "gravity_yellow",
      "gravity_blue",
      "speed_0.5",
      "speed_1",
      "speed_2",
      "speed_3",
      "speed_4"
    ];
    const diff = this.mapConfig.difficulty;
    if (diff < 8) {
      portalTypes = portalTypes.filter((t) => !["speed_2", "speed_3", "speed_4"].includes(t));
    } else if (diff < 16) {
      portalTypes = portalTypes.filter((t) => !["speed_3", "speed_4"].includes(t));
    } else if (diff < 24) {
      portalTypes = portalTypes.filter((t) => t !== "speed_4");
    }
    const availableTypes = portalTypes.filter((t) => {
      if (t === "gravity_blue") return this.portals.some((p) => p.type === "gravity_yellow");
      return true;
    });
    const type = availableTypes[Math.floor(rng() * availableTypes.length)] || "speed_1";
    this.generatePortalWithType(xPos, type, rng);
  }
  /**
   * 전역 AI 통과 경로 및 오토플레이 로그 생성
   */
  /**
   * 전역 AI 통과 경로 및 오토플레이 로그 생성 (시뮬레이션 기반)
   * 240프레임(약 4초) 앞을 미리 보고 생존과 중앙 유지를 최적화하는 경로를 찾습니다.
   */
  *computeAutoplayLogGen(startX, startY) {
    this.autoplayLog = [];
    this.validationFailureInfo = null;
    const dt = 1 / 30;
    const sortedObs = [...this.obstacles].sort((a, b) => a.x - b.x);
    const sortedPortals = [...this.portals].sort((a, b) => a.x - b.x);
    const findStartIndex = (minX) => {
      let l = 0, r = sortedObs.length;
      while (l < r) {
        const mid = l + r >>> 1;
        if (sortedObs[mid].x < minX) l = mid + 1;
        else r = mid;
      }
      return l;
    };
    const initialState = {
      x: startX,
      y: startY,
      time: 0,
      g: this.isGravityInverted,
      sm: this.speedMultiplier,
      m: this.isMini,
      wa: this.waveAngle,
      h: false,
      pIdx: 0,
      lastSwitchTime: -1,
      prev: null
    };
    const visited = /* @__PURE__ */ new Set();
    const getVisitedKey = (s) => {
      const xi = Math.floor(s.x / 5);
      const yi = Math.floor(s.y / 2);
      return `${xi}_${yi}_${s.g ? 1 : 0}_${Math.round(s.sm * 10)}_${s.m ? 1 : 0}`;
    };
    const checkColl = (tx, ty, sz, tm, sm, margin = 0) => {
      const startI = findStartIndex(tx - 1e3);
      for (let i = startI; i < sortedObs.length; i++) {
        const o = sortedObs[i];
        if (o.x + o.width < tx - 50) continue;
        if (o.x > tx + 100) break;
        const moveMargin = o.movement ? 2 : 0;
        if (this.checkObstacleCollision(o, tx, ty, sz + margin + moveMargin, tm, sm)) return true;
      }
      return false;
    };
    const checkSurvival = (baseState, testH, frames) => {
      let sx = baseState.x;
      let sy = baseState.y;
      let sg = baseState.g;
      let ssm = baseState.sm;
      let swa = baseState.wa;
      let sm = baseState.m;
      let spIdx = baseState.pIdx;
      let sTime = baseState.time;
      for (let i = 0; i < frames; i++) {
        while (spIdx < sortedPortals.length && sx >= sortedPortals[spIdx].x) {
          const p = sortedPortals[spIdx];
          if (sy >= p.y && sy <= p.y + p.height) {
            if (p.type === "gravity_yellow") sg = true;
            if (p.type === "gravity_blue") sg = false;
            if (p.type.startsWith("speed_")) ssm = this.getSpeedMultiplierFromType(p.type);
            if (p.type === "mini_pink") sm = true;
            if (p.type === "mini_green") sm = false;
            swa = this.getEffectiveAngle(sm, ssm);
          }
          spIdx++;
        }
        const spd = this.baseSpeed * ssm;
        const amp = spd * Math.tan(swa * Math.PI / 180);
        const sz = sm ? this.miniPlayerSize : this.basePlayerSize;
        sx += spd * dt;
        sTime += dt;
        const vy = sg ? testH ? 1 : -1 : testH ? -1 : 1;
        sy += amp * vy * dt;
        if (sy < this.minY + sz) sy = this.minY + sz;
        if (sy > this.maxY - sz) sy = this.maxY - sz;
        if (checkColl(sx, sy, sz, sTime, ssm, 0.1)) return false;
      }
      return true;
    };
    const stack = [initialState];
    let maxX = startX;
    let loops = 0;
    const maxLoops = 1e6;
    let bestState = null;
    let furthestFailX = startX;
    let failY = startY;
    while (stack.length > 0) {
      loops++;
      const curr = stack.pop();
      if (curr.x > maxX) {
        maxX = curr.x;
      }
      if (loops % 1e3 === 0) yield maxX / this.totalLength;
      if (curr.x >= this.totalLength) {
        bestState = curr;
        break;
      }
      const vkey = getVisitedKey(curr);
      if (visited.has(vkey)) continue;
      visited.add(vkey);
      let nG = curr.g;
      let nSM = curr.sm;
      let nM = curr.m;
      let nWA = curr.wa;
      let npIdx = curr.pIdx;
      while (npIdx < sortedPortals.length && curr.x >= sortedPortals[npIdx].x) {
        const p = sortedPortals[npIdx];
        if (curr.y >= p.y && curr.y <= p.y + p.height) {
          if (p.type === "gravity_yellow") nG = true;
          if (p.type === "gravity_blue") nG = false;
          if (p.type.startsWith("speed_")) nSM = this.getSpeedMultiplierFromType(p.type);
          if (p.type === "mini_pink") nM = true;
          if (p.type === "mini_green") nM = false;
          if (p.type === "teleport_in") {
            const target = this.portals.find((tp) => tp.type === "teleport_out" && (p.linkId ? tp.linkId === p.linkId : tp.x > p.x));
            if (target) {
              curr.x = target.x + target.width + 20;
              curr.y = target.y + target.height / 2;
              npIdx = sortedPortals.findIndex((sp) => sp.x >= curr.x);
              if (npIdx === -1) npIdx = sortedPortals.length;
              break;
            }
          }
          nWA = this.getEffectiveAngle(nM, nSM);
        }
        npIdx++;
      }
      const spd = this.baseSpeed * nSM;
      const amp = spd * Math.tan(nWA * Math.PI / 180);
      const sz = nM ? this.miniPlayerSize : this.basePlayerSize;
      const nT = curr.time + dt;
      const nX = curr.x + spd * dt;
      let nYH = curr.y + amp * (nG ? 1 : -1) * dt;
      let nYR = curr.y + amp * (nG ? -1 : 1) * dt;
      if (nYH < this.minY + sz) nYH = this.minY + sz;
      if (nYH > this.maxY - sz) nYH = this.maxY - sz;
      if (nYR < this.minY + sz) nYR = this.minY + sz;
      if (nYR > this.maxY - sz) nYR = this.maxY - sz;
      let dH = checkColl(nX, nYH, sz, nT, nSM, 0.1);
      let dR = checkColl(nX, nYR, sz, nT, nSM, 0.1);
      const vDist = sz * 0.8;
      if (!dH && Math.abs(nYH - curr.y) > vDist) {
        if (checkColl((curr.x + nX) / 2, (curr.y + nYH) / 2, sz, curr.time + dt / 2, nSM, 0.1)) dH = true;
      }
      if (!dR && Math.abs(nYR - curr.y) > vDist) {
        if (checkColl((curr.x + nX) / 2, (curr.y + nYR) / 2, sz, curr.time + dt / 2, nSM, 0.1)) dR = true;
      }
      if (dH && dR && nX > furthestFailX) {
        furthestFailX = nX;
        failY = curr.y;
      }
      const prevH = curr.h;
      const lookaheadFrames = 60;
      const MIN_SWITCH_INTERVAL = 0.05 / Math.pow(curr.sm, 0.7);
      const timeSinceLastSwitch = curr.time - curr.lastSwitchTime;
      let isSwitchRestricted = timeSinceLastSwitch < MIN_SWITCH_INTERVAL;
      if (isSwitchRestricted) {
        const currentY = curr.y;
        const distFromCenter = Math.abs(currentY - 360);
        if (distFromCenter > 25) {
          const isGravityInv = curr.g;
          const isHolding = prevH;
          const vy = isGravityInv ? isHolding ? 1 : -1 : isHolding ? -1 : 1;
          const movingAway = currentY > 360 && vy > 0 || currentY < 360 && vy < 0;
          if (movingAway) {
            isSwitchRestricted = false;
          }
        }
      }
      let preferHold = false;
      const isHoldSafe = !dH && checkSurvival({ ...curr, x: nX, y: nYH, time: nT, g: nG, sm: nSM, m: nM, wa: nWA, pIdx: npIdx, lastSwitchTime: prevH ? curr.lastSwitchTime : nT }, true, lookaheadFrames);
      const isReleaseSafe = !dR && checkSurvival({ ...curr, x: nX, y: nYR, time: nT, g: nG, sm: nSM, m: nM, wa: nWA, pIdx: npIdx, lastSwitchTime: !prevH ? curr.lastSwitchTime : nT }, false, lookaheadFrames);
      if (prevH) {
        if (isHoldSafe) preferHold = true;
        else preferHold = false;
      } else {
        if (isReleaseSafe) preferHold = false;
        else preferHold = true;
      }
      if (isHoldSafe && isReleaseSafe) {
        const barriers = [
          { top: -Infinity, bottom: this.minY },
          // 천장 위
          { top: this.maxY, bottom: Infinity }
          // 바닥 아래
        ];
        for (let oi = findStartIndex(nX - 1e3); oi < sortedObs.length; oi++) {
          const o = sortedObs[oi];
          if (o.x + o.width < nX) continue;
          if (o.x > nX) break;
          const range = this.getObstacleYRangeAt(o, nX, nT);
          if (range) {
            barriers.push(range);
          }
        }
        barriers.sort((a, b) => a.top - b.top);
        const merged = [];
        if (barriers.length > 0) {
          let current = { ...barriers[0] };
          for (let i = 1; i < barriers.length; i++) {
            const next = barriers[i];
            if (next.top <= current.bottom) {
              current.bottom = Math.max(current.bottom, next.bottom);
            } else {
              merged.push(current);
              current = { ...next };
            }
          }
          merged.push(current);
        }
        const gaps = [];
        for (let i = 0; i < merged.length - 1; i++) {
          gaps.push({
            top: merged[i].bottom,
            bottom: merged[i + 1].top
          });
        }
        let targetGap = gaps[0];
        let minDist = Infinity;
        for (const gap of gaps) {
          const mid = (gap.top + gap.bottom) / 2;
          const dist = Math.abs(curr.y - mid);
          if (curr.y >= gap.top && curr.y <= gap.bottom) {
            targetGap = gap;
            break;
          }
          if (dist < minDist) {
            minDist = dist;
            targetGap = gap;
          }
        }
        const targetY = (targetGap.top + targetGap.bottom) / 2;
        const distH = Math.abs(nYH - targetY);
        const distR = Math.abs(nYR - targetY);
        if (distH < distR) {
          preferHold = true;
        } else if (distR < distH) {
          preferHold = false;
        } else {
          preferHold = prevH;
        }
      }
      const scanEnd = nX + 400;
      let fallingSpikeAhead = false;
      for (let i = findStartIndex(nX); i < sortedObs.length; i++) {
        const o = sortedObs[i];
        if (o.x > scanEnd) break;
        if (o.type === "falling_spike") {
          fallingSpikeAhead = true;
          break;
        }
      }
      if (fallingSpikeAhead) {
        preferHold = !nG;
      }
      if (isSwitchRestricted) {
        if (prevH && isHoldSafe) preferHold = true;
        if (!prevH && isReleaseSafe) preferHold = false;
      }
      const nextActions = preferHold ? [true, false] : [false, true];
      for (const h of nextActions) {
        if (h ? !dH : !dR) {
          if (h !== prevH) {
            if (isSwitchRestricted) {
              const maintenanceSafe = prevH ? isHoldSafe : isReleaseSafe;
              if (maintenanceSafe) continue;
            }
          }
          const newLastSwitchTime = h !== prevH ? nT : curr.lastSwitchTime;
          stack.push({ x: nX, y: h ? nYH : nYR, time: nT, g: nG, sm: nSM, m: nM, wa: nWA, h, pIdx: npIdx, lastSwitchTime: newLastSwitchTime, prev: curr });
        }
      }
      if (loops > maxLoops) break;
    }
    if (bestState) {
      const path = [];
      let t = bestState;
      while (t) {
        path.push({ x: t.x, y: t.y, holding: t.h, time: t.time });
        t = t.prev;
      }
      this.autoplayLog = path.reverse();
      return true;
    } else {
      this.validationFailureInfo = {
        x: furthestFailX,
        y: failY,
        nearObstacles: sortedObs.filter((o) => o.x > furthestFailX - 400 && o.x < furthestFailX + 600)
      };
      return false;
    }
  }
  computeAutoplayLog(startX = 200, startY = 360) {
    const gen = this.computeAutoplayLogGen(startX, startY);
    let res = gen.next();
    while (!res.done) res = gen.next();
    return res.value;
  }
  async computeAutoplayLogAsync(startX, startY, onProgress) {
    const gen = this.computeAutoplayLogGen(startX, startY);
    let res = gen.next();
    let lastTime = performance.now();
    while (!res.done) {
      if (typeof res.value === "number") {
        const now = performance.now();
        if (now - lastTime > 16) {
          onProgress(res.value);
          await new Promise((resolve) => setTimeout(resolve, 0));
          lastTime = performance.now();
        }
      }
      res = gen.next();
    }
    onProgress(1);
    return res.value;
  }
  validateMap() {
    return this.computeAutoplayLog(200, 360);
  }
  seededRandom(seed) {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
  /**
   * 프레임마다 호출되는 업데이트 함수
   */
  update(dt, currentTime) {
    if (this.isDead || !this.isPlaying) return;
    if (dt > 0.1) dt = 0.1;
    if (dt < 0) dt = 0;
    const currentSpeed = this.baseSpeed * this.speedMultiplier;
    this.waveSpeed = currentSpeed;
    const effectiveAngle = this.getEffectiveAngle(this.isMini, this.speedMultiplier);
    const angleRad = effectiveAngle * Math.PI / 180;
    this.waveAmplitude = currentSpeed * Math.tan(angleRad);
    this.playerX += this.waveSpeed * dt;
    let simTime = null;
    if (this.isAutoplay && this.autoplayLog.length > 0) {
      const targetX = this.playerX;
      let foundEntry = null;
      for (let i = this.lastAutoplayIndex; i < this.autoplayLog.length; i++) {
        const entry = this.autoplayLog[i];
        if (entry && entry.x >= targetX) {
          foundEntry = entry;
          this.lastAutoplayIndex = i;
          break;
        }
      }
      if (foundEntry) {
        this.isHolding = foundEntry.holding;
        const prevEntry = this.lastAutoplayIndex > 0 ? this.autoplayLog[this.lastAutoplayIndex - 1] : null;
        if (prevEntry) {
          const ratio = (targetX - prevEntry.x) / (foundEntry.x - prevEntry.x);
          this.playerY = prevEntry.y + (foundEntry.y - prevEntry.y) * Math.max(0, Math.min(1, ratio));
          simTime = prevEntry.time + (foundEntry.time - prevEntry.time) * Math.max(0, Math.min(1, ratio));
        } else {
          this.playerY = foundEntry.y;
          simTime = foundEntry.time;
        }
        const visualPortion = this.autoplayLog.slice(this.lastAutoplayIndex, this.lastAutoplayIndex + 300);
        this.aiPredictedPath = visualPortion.map((p) => ({ x: p.x, y: p.y }));
      }
    } else {
      this.aiPredictedPath = [];
      const direction = this.isHolding ? -1 : 1;
      const gravityDirection = this.isGravityInverted ? -direction : direction;
      this.playerY += this.waveAmplitude * gravityDirection * dt;
    }
    if (this.playerY < this.minY + this.playerSize) {
      this.playerY = this.minY + this.playerSize;
    }
    if (this.playerY > this.maxY - this.playerSize) {
      this.playerY = this.maxY - this.playerSize;
    }
    this.cameraX = this.playerX - 280;
    this.progress = Math.min(100, this.playerX / this.totalLength * 100);
    this.score = Math.floor(this.progress * 10);
    this.trail.push({ x: this.playerX, y: this.playerY, time: Date.now() });
    if (this.trail.length > 80) this.trail.shift();
    this.updateParticles(dt);
    const effectiveTime = simTime !== null ? simTime : currentTime;
    this.updateMovingObstacles(dt, effectiveTime);
    this.updateBoss(dt, effectiveTime);
    this.checkPortalCollisions();
    this.checkCollisions(effectiveTime);
    if (this.beatTimes.length > 0) {
      const currentBeatIdx = this.beatTimes.findIndex((t) => t >= currentTime);
      if (currentBeatIdx !== -1 && currentBeatIdx !== this.lastMeasureIndex) {
        if (Math.abs(this.beatTimes[currentBeatIdx] - currentTime) < 0.1) {
          this.isMeasureHighlight = true;
          this.lastMeasureIndex = currentBeatIdx;
          setTimeout(() => this.isMeasureHighlight = false, 150);
        }
      }
    }
    if (this.playerX >= this.totalLength) {
      this.isPlaying = false;
    }
  }
  checkPortalCollisions() {
    for (const portal of this.portals) {
      if (portal.activated) continue;
      if (portal.x + portal.width < this.playerX - 50) continue;
      if (portal.x > this.playerX + 100) break;
      const pSize = this.playerSize;
      const points = [
        { x: this.playerX - pSize, y: this.playerY - pSize },
        { x: this.playerX + pSize, y: this.playerY - pSize },
        { x: this.playerX - pSize, y: this.playerY + pSize },
        { x: this.playerX + pSize, y: this.playerY + pSize },
        { x: this.playerX, y: this.playerY }
      ];
      const isRotated = portal.angle && portal.angle !== 0;
      if (isRotated) {
        const cx = portal.x + portal.width / 2;
        const cy = portal.y + portal.height / 2;
        const rad = -portal.angle * Math.PI / 180;
        points.forEach((p) => {
          const dx = p.x - cx;
          const dy = p.y - cy;
          p.x = cx + dx * Math.cos(rad) - dy * Math.sin(rad);
          p.y = cy + dx * Math.sin(rad) + dy * Math.cos(rad);
        });
      }
      const isColliding = points.some(
        (p) => p && p.x >= portal.x && p.x <= portal.x + portal.width && p.y >= portal.y && p.y <= portal.y + portal.height
      );
      if (isColliding) {
        portal.activated = true;
        this.activatePortal(portal.type);
        this.spawnPortalParticles(portal);
        if (this.onPortalActivation) {
          this.onPortalActivation(portal.type);
        }
      }
    }
  }
  activatePortal(type) {
    switch (type) {
      case "gravity_yellow":
        this.isGravityInverted = true;
        break;
      case "gravity_blue":
        this.isGravityInverted = false;
        break;
      case "speed_0.25":
      case "speed_0.5":
      case "speed_1":
      case "speed_2":
      case "speed_3":
      case "speed_4":
        this.speedMultiplier = this.getSpeedMultiplierFromType(type);
        break;
      case "mini_pink":
        this.isMini = true;
        this.playerSize = this.miniPlayerSize;
        this.waveAngle = this.miniWaveAngle;
        break;
      case "mini_green":
        this.isMini = false;
        this.playerSize = this.basePlayerSize;
        this.waveAngle = 45;
        break;
      case "teleport_in":
        const currentPortal = this.portals.find((p) => p.type === "teleport_in" && p.activated && Math.abs(p.x - this.playerX) < 100);
        if (currentPortal) {
          let target = null;
          if (currentPortal.linkId) {
            target = this.portals.find((p) => p.type === "teleport_out" && p.linkId === currentPortal.linkId);
          } else {
            target = this.portals.find((p) => p.type === "teleport_out" && p.x > this.playerX);
          }
          if (target) {
            this.playerX = target.x + target.width + 20;
            this.playerY = target.y + target.height / 2;
            this.cameraX = this.playerX - 280;
            this.trail = [];
            this.spawnPortalParticles(target);
          }
        }
        break;
    }
  }
  updateBoss(dt, time) {
    if (!this.boss.active) return;
    this.boss.attackTimer += dt;
    this.boss.x = this.cameraX + 1e3;
    this.boss.y = 360 + Math.sin(time * 0.5) * 100;
    for (let i = this.boss.projectiles.length - 1; i >= 0; i--) {
      const p = this.boss.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const dist = Math.hypot(p.x - this.playerX, p.y - this.playerY);
      if (dist < 20 + this.playerSize) {
        this.die("보스 공격에 당했습니다!");
      }
      if (p.x < this.cameraX - 100) this.boss.projectiles.splice(i, 1);
    }
    if (this.boss.attackTimer > 3) {
      this.boss.projectiles.push({
        x: this.boss.x,
        y: this.boss.y,
        vx: -600,
        vy: (this.playerY - this.boss.y) * 2,
        type: "missile"
      });
      this.boss.attackTimer = 0;
    }
  }
  spawnPortalParticles(portal) {
    const color = this.getPortalColor(portal.type);
    for (let i = 0; i < 10; i++) {
      const angle = Math.PI * 2 * i / 10;
      const speed = 50 + Math.random() * 60;
      this.particles.push({
        x: portal.x + portal.width / 2,
        y: portal.y + portal.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.3,
        color
      });
    }
  }
  getPortalColor(type) {
    switch (type) {
      case "gravity_yellow":
        return "#ffff00";
      case "gravity_blue":
        return "#4488ff";
      case "speed_0.25":
        return "#aa5500";
      // Dark orange/brown
      case "speed_0.5":
        return "#ff8800";
      case "speed_1":
        return "#4488ff";
      case "speed_2":
        return "#44ff44";
      case "speed_3":
        return "#ff44ff";
      case "speed_4":
        return "#ff4444";
      case "mini_pink":
        return "#ff66cc";
      // 분홍색 뿨족뿨족
      case "mini_green":
        return "#66ff66";
      case "teleport_in":
        return "#00ffff";
      case "teleport_out":
        return "#ff00ff";
      default:
        return "#ffffff";
    }
  }
  getPortalSymbol(type) {
    switch (type) {
      case "gravity_yellow":
        return "⟲";
      case "gravity_blue":
        return "⟳";
      case "speed_0.25":
        return "<<";
      case "speed_0.5":
        return "<";
      case "speed_1":
        return ">";
      case "speed_2":
        return ">>";
      case "speed_3":
        return ">>>";
      case "speed_4":
        return ">>>>";
      case "mini_pink":
        return "◆";
      case "mini_green":
        return "◇";
      case "teleport_in":
        return "IN";
      case "teleport_out":
        return "OUT";
      default:
        return "?";
    }
  }
  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 150 * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  /**
   * 특정 X 좌표에서 장애물의 Y 범위(최상단, 최하단)를 계산
   */
  getObstacleYRangeAt(obs, x, time) {
    if (x < obs.x || x > obs.x + obs.width) return null;
    let obsY = obs.y;
    let obsAngle = obs.angle || 0;
    if (time !== void 0 && obs.movement) {
      const state = this.getObstacleStateAt(obs, time);
      obsY = state.y;
      obsAngle = state.angle;
    }
    if (obs.type === "block") {
      if (obsAngle) {
        const angleRad = obsAngle * Math.PI / 180;
        const cx = obs.x + obs.width / 2;
        const cy = obsY + obs.height / 2;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        const hw = obs.width / 2;
        const hh = obs.height / 2;
        const corners = [
          { dx: -hw, dy: -hh },
          { dx: hw, dy: -hh },
          { dx: hw, dy: hh },
          { dx: -hw, dy: hh }
        ].map((p) => ({
          x: cx + p.dx * cos - p.dy * sin,
          y: cy + p.dx * sin + p.dy * cos
        }));
        let minY = Infinity, maxY = -Infinity;
        let intersects = false;
        for (let i = 0; i < 4; i++) {
          const p1 = corners[i], p2 = corners[(i + 1) % 4];
          if (p1.x <= x && x <= p2.x || p2.x <= x && x <= p1.x) {
            if (Math.abs(p1.x - p2.x) < 0.1) {
              minY = Math.min(minY, p1.y, p2.y);
              maxY = Math.max(maxY, p1.y, p2.y);
            } else {
              const t = (x - p1.x) / (p2.x - p1.x);
              const intersectY = p1.y + t * (p2.y - p1.y);
              minY = Math.min(minY, intersectY);
              maxY = Math.max(maxY, intersectY);
            }
            intersects = true;
          }
        }
        return intersects ? { top: minY, bottom: maxY } : null;
      }
      return { top: obsY, bottom: obsY + obs.height };
    }
    if (obs.type === "spike" || obs.type === "mini_spike") {
      const isBottomSpike = obsY > 330;
      const centerX = obs.x + obs.width / 2;
      let tipY;
      if (x <= centerX) {
        const t = (x - obs.x) / (centerX - obs.x);
        tipY = isBottomSpike ? obsY + obs.height - t * obs.height : obsY + t * obs.height;
      } else {
        const t = (x - centerX) / (obs.x + obs.width - centerX);
        tipY = isBottomSpike ? obsY + (1 - t) * 0 + t * obs.height : obsY + obs.height - (1 - t) * 0 - t * obs.height;
        tipY = isBottomSpike ? obsY + t * obs.height : obsY + obs.height - t * obs.height;
      }
      if (isBottomSpike) return { top: tipY, bottom: obsY + obs.height };
      return { top: obsY, bottom: tipY };
    }
    if (obs.type === "slope") {
      const t = (x - obs.x) / obs.width;
      if (obsAngle > 0) {
        const hypotenuseY = obsY + obs.height * (1 - t);
        return { top: obsY, bottom: hypotenuseY };
      } else {
        const hypotenuseY = obsY + obs.height * t;
        return { top: obsY, bottom: hypotenuseY };
      }
    }
    if (obs.type === "triangle" || obs.type === "steep_triangle") {
      const t = (x - obs.x) / obs.width;
      const hypotenuseY = obsY + obs.height * (1 - t);
      return { top: hypotenuseY, bottom: obsY + obs.height };
    }
    return { top: obsY, bottom: obsY + obs.height };
  }
  checkCollisions(time) {
    for (const obs of this.obstacles) {
      if (obs.x + obs.width < this.playerX - 80) continue;
      if (obs.x > this.playerX + 100) break;
      if (this.checkObstacleCollision(obs, this.playerX, this.playerY, this.playerSize, time)) {
        this.die("장애물과 충돌!");
        this.spawnDeathParticles();
        return;
      }
    }
  }
  /**
   * 세밀한 충돌 체크 (가시는 세모, 기울어진 블록은 OBB 적용)
   * 전역 회전 지원: 플레이어 점들을 역회전시켜 AABB와 체크
   */
  checkObstacleCollision(obs, px, py, pSize, simTime, simSpeedMultiplier) {
    let obsY = obs.y;
    let obsAngle = obs.angle || 0;
    if (simTime !== void 0 && obs.movement) {
      const state = this.getObstacleStateAt(obs, simTime);
      obsY = state.y;
      obsAngle = state.angle;
    }
    let effectiveWidth = obs.width;
    let effectiveHeight = obs.height;
    if (obs.type === "mine" && obs.customData?.pulseSpeed) {
      const time = simTime || performance.now() / 1e3;
      const speed = obs.customData.pulseSpeed || 2;
      const amount = obs.customData.pulseAmount || 0.2;
      const pulse = 1 + Math.sin(time * speed) * amount;
      effectiveWidth *= pulse;
      effectiveHeight *= pulse;
    }
    const minHitboxSize = 10;
    effectiveWidth = Math.max(effectiveWidth, minHitboxSize);
    effectiveHeight = Math.max(effectiveHeight, minHitboxSize);
    const hitboxReduction = 0;
    const planetReduction = 0;
    let reduction = hitboxReduction;
    if (obs.type === "planet" || obs.type === "star") reduction = planetReduction;
    effectiveWidth = Math.max(10, effectiveWidth - reduction);
    effectiveHeight = Math.max(10, effectiveHeight - reduction);
    const effectiveX = obs.x - (effectiveWidth - obs.width) / 2;
    const effectiveY = obsY - (effectiveHeight - obs.height) / 2;
    const isRotated = obsAngle !== 0;
    const points = [
      { x: px - pSize, y: py - pSize },
      { x: px + pSize, y: py - pSize },
      { x: px - pSize, y: py + pSize },
      { x: px + pSize, y: py + pSize },
      { x: px, y: py }
    ];
    if (obs.type === "falling_spike" && simTime !== void 0) {
      const triggerX = obs.x - 150;
      if (px > triggerX) {
        const estimatedSpeed = this.baseSpeed * (simSpeedMultiplier !== void 0 ? simSpeedMultiplier : this.speedMultiplier || 1);
        const dist = Math.max(0, px - triggerX);
        const t = dist / estimatedSpeed;
        const drop = 0.5 * 2500 * t * t;
        obsY = (obs.initialY !== void 0 ? obs.initialY : obs.y) + drop;
        if (obsY > this.maxY + 100) return false;
      } else {
        obsY = obs.initialY !== void 0 ? obs.initialY : obs.y;
      }
    }
    if (obs.type === "planet" || obs.type === "star") {
      const time = simTime || performance.now() / 1e3;
      const cx = obs.x + obs.width / 2;
      const cy = obsY + obs.height / 2;
      const rx = effectiveWidth / 2;
      const ry = effectiveHeight / 2;
      const dx = px - cx;
      const dy = py - cy;
      if (dx * dx / ((rx - 2) * (rx - 2)) + dy * dy / ((ry - 2) * (ry - 2)) < 1) return true;
      const hasChildren = obs.children && obs.children.length > 0;
      if (hasChildren) {
        const children = obs.children;
        const speed = obs.customData?.orbitSpeed ?? 1;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (!child) continue;
          const theta = time * speed + i * (Math.PI * 2 / children.length);
          const dist = obs.customData?.orbitDistance ?? obs.width * 0.85;
          const childX = cx + Math.cos(theta) * dist;
          const childY = cy + Math.sin(theta) * dist;
          const childSize = child.width ? child.width / 2 : 14;
          const distToChildSq = (points[4]?.x - childX) ** 2 + (points[4]?.y - childY) ** 2;
          if (distToChildSq < (childSize + pSize - 2) ** 2) return true;
          if (child.type === "planet") {
            const moonCount = child.customData?.orbitCount ?? 2;
            const moonSpeed = child.customData?.orbitSpeed ?? 2;
            const moonDist = child.customData?.orbitDistance ?? child.width * 0.8;
            for (let j = 0; j < moonCount; j++) {
              const mTheta = time * moonSpeed + j * (Math.PI * 2 / moonCount);
              const mx = childX + Math.cos(mTheta) * moonDist;
              const my = childY + Math.sin(mTheta) * moonDist;
              const distToMoonSq = (points[4]?.x - mx) ** 2 + (points[4]?.y - my) ** 2;
              if (distToMoonSq < (8 + pSize - 2) ** 2) return true;
            }
          }
        }
      } else {
        const count = obs.customData?.orbitCount ?? (obs.type === "star" ? 0 : 2);
        if (count === 0 && obs.type === "star") ;
        else {
          const speed = obs.customData?.orbitSpeed ?? 1;
          const dist = obs.customData?.orbitDistance ?? obs.width * 0.8;
          for (let i = 0; i < count; i++) {
            const theta = time * speed + i * (Math.PI * 2 / count);
            const mx = cx + Math.cos(theta) * dist;
            const my = cy + Math.sin(theta) * dist;
            const moonRadius = obs.type === "star" ? 20 : 10;
            const mDistSq = (points[4].x - mx) ** 2 + (points[4].y - my) ** 2;
            if (mDistSq < (moonRadius + pSize - 2) ** 2) return true;
            if (obs.type === "star" && obs.customData?.nestedOrbit) {
              const subMoonCount = 2;
              const subDist = 25;
              const subSpeed = speed * 2.5;
              for (let j = 0; j < subMoonCount; j++) {
                const subTheta = time * subSpeed + j * (Math.PI * 2 / subMoonCount);
                const smx = mx + Math.cos(subTheta) * subDist;
                const smy = my + Math.sin(subTheta) * subDist;
                const smDistSq = (points[4].x - smx) ** 2 + (points[4].y - smy) ** 2;
                if (smDistSq < (8 + pSize - 2) ** 2) return true;
              }
            }
          }
        }
      }
      return false;
    }
    if (isRotated) {
      const cx = effectiveX + effectiveWidth / 2;
      const cy = effectiveY + effectiveHeight / 2;
      const rad = -obsAngle * Math.PI / 180;
      points.forEach((p) => {
        const dx = p.x - cx;
        const dy = p.y - cy;
        p.x = cx + dx * Math.cos(rad) - dy * Math.sin(rad);
        p.y = cy + dx * Math.sin(rad) + dy * Math.cos(rad);
      });
    }
    const isInsideAABB = points.some(
      (p) => p.x >= effectiveX && p.x <= effectiveX + effectiveWidth && p.y >= effectiveY && p.y <= effectiveY + effectiveHeight
    );
    if (!isInsideAABB && obs.type !== "slope" && obs.type !== "spike" && obs.type !== "mini_spike") return false;
    if (obs.type === "block") {
      return isInsideAABB;
    }
    if (obs.type === "slope") {
      let tri;
      if (obs.angle > 0) {
        tri = [
          { x: effectiveX, y: effectiveY + effectiveHeight },
          { x: effectiveX + effectiveWidth, y: effectiveY },
          { x: effectiveX, y: effectiveY }
        ];
      } else {
        tri = [
          { x: effectiveX + effectiveWidth, y: effectiveY + effectiveHeight },
          { x: effectiveX, y: effectiveY },
          { x: effectiveX + effectiveWidth, y: effectiveY }
        ];
      }
      for (const p of points) {
        if (this.isPointInTriangle(p.x, p.y, tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y)) return true;
      }
      return false;
    }
    if (obs.type === "triangle" || obs.type === "steep_triangle") {
      const tri = [
        { x: effectiveX, y: effectiveY + effectiveHeight },
        { x: effectiveX + effectiveWidth, y: effectiveY + effectiveHeight },
        { x: effectiveX + effectiveWidth, y: effectiveY }
      ];
      for (const p of points) {
        if (this.isPointInTriangle(p.x, p.y, tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y)) return true;
      }
      return false;
    }
    if (obs.type === "spike" || obs.type === "mini_spike") {
      const isBottom = effectiveY > 300;
      const tri = isBottom ? [
        { x: effectiveX, y: effectiveY + effectiveHeight },
        { x: effectiveX + effectiveWidth / 2, y: effectiveY },
        { x: effectiveX + effectiveWidth, y: effectiveY + effectiveHeight }
      ] : [
        { x: effectiveX, y: effectiveY },
        { x: effectiveX + effectiveWidth / 2, y: effectiveY + effectiveHeight },
        { x: effectiveX + effectiveWidth, y: effectiveY }
      ];
      for (const p of points) {
        if (tri[0] && tri[1] && tri[2] && this.isPointInTriangle(p.x, p.y, tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y)) return true;
      }
      return false;
    }
    if (obs.type === "saw" || obs.type === "spike_ball" || obs.type === "mine" || obs.type === "orb") {
      const cx = effectiveX + effectiveWidth / 2;
      const cy = effectiveY + effectiveHeight / 2;
      const rx = effectiveWidth / 2 * 0.9;
      const ry = effectiveHeight / 2 * 0.9;
      for (const p of points) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        if (dx * dx / (rx * rx) + dy * dy / (ry * ry) < 1) return true;
      }
      return false;
    }
    if (obs.type === "laser") {
      const h = effectiveHeight * 0.4;
      const cy = effectiveY + effectiveHeight / 2;
      return points.some((p) => p.x >= effectiveX && p.x <= effectiveX + effectiveWidth && p.y >= cy - h && p.y <= cy + h);
    }
    if (obs.type === "v_laser" || obs.type === "laser_beam") {
      const w = effectiveWidth * 0.4;
      const cx = effectiveX + effectiveWidth / 2;
      return points.some((p) => p.y >= effectiveY && p.y <= effectiveY + effectiveHeight && p.x >= cx - w && p.x <= cx + w);
    }
    if (obs.type === "hammer") {
      const cx = effectiveX + effectiveWidth / 2;
      const cy = effectiveY + effectiveHeight / 2;
      return points.some((p) => (p.x - cx) ** 2 + (p.y - cy) ** 2 < (effectiveWidth / 2) ** 2);
    }
    if (obs.type === "falling_spike") {
      const tri = [
        { x: effectiveX, y: effectiveY },
        { x: effectiveX + effectiveWidth / 2, y: effectiveY + effectiveHeight },
        { x: effectiveX + effectiveWidth, y: effectiveY }
      ];
      for (const p of points) {
        if (tri[0] && tri[1] && tri[2] && this.isPointInTriangle(p.x, p.y, tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y)) return true;
      }
      return false;
    }
    if (["rotor", "cannon", "spark_mine", "crusher_jaw", "swing_blade"].includes(obs.type)) {
      const cx = effectiveX + effectiveWidth / 2;
      const cy = effectiveY + effectiveHeight / 2;
      const rx = effectiveWidth / 2 * 0.8;
      const ry = effectiveHeight / 2 * 0.8;
      for (const p of points) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        if (dx * dx / (rx * rx) + dy * dy / (ry * ry) < 1) return true;
      }
      return false;
    }
    if (obs.type === "piston_v") {
      return isInsideAABB;
    }
    if (obs.type === "growing_spike") {
      const tri = [
        { x: effectiveX, y: effectiveY + effectiveHeight },
        { x: effectiveX + effectiveWidth / 2, y: effectiveY },
        { x: effectiveX + effectiveWidth, y: effectiveY + effectiveHeight }
      ];
      for (const p of points) {
        if (tri[0] && tri[1] && tri[2] && this.isPointInTriangle(p.x, p.y, tri[0].x, tri[0].y, tri[1].x, tri[1].y, tri[2].x, tri[2].y)) return true;
      }
      return false;
    }
    return false;
  }
  isPointInRotatedRect(px, py, obs) {
    const angleRad = (obs.angle || 0) * Math.PI / 180;
    const cx = obs.x + obs.width / 2;
    const cy = obs.y + obs.height / 2;
    const tx = px - cx;
    const ty = py - cy;
    const cos = Math.cos(-angleRad);
    const sin = Math.sin(-angleRad);
    const rx = tx * cos - ty * sin;
    const ry = tx * sin + ty * cos;
    return Math.abs(rx) <= obs.width / 2 && Math.abs(ry) <= obs.height / 2;
  }
  /**
   * 장애물 중복 제거: 다른 장애물에 완전히 포함된 장애물을 삭제합니다.
   */
  removeRedundantObstacles() {
    const toRemove = /* @__PURE__ */ new Set();
    const n = this.obstacles.length;
    for (let i = 0; i < n; i++) {
      const a = this.obstacles[i];
      if (a.movement) continue;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const b = this.obstacles[j];
        if (b.movement) continue;
        const margin = b.angle ? Math.max(b.width, b.height) : 0;
        if (b.x - margin > a.x || b.x + b.width + margin < a.x + a.width) continue;
        if (this.isObstacleContained(a, b)) {
          toRemove.add(i);
          break;
        }
      }
    }
    if (toRemove.size > 0) {
      console.log(`[MapGen] Removing ${toRemove.size} redundant obstacles.`);
      this.obstacles = this.obstacles.filter((_, idx) => !toRemove.has(idx));
    }
  }
  isObstacleContained(a, b) {
    if (b.type !== "block" && b.type !== "spike" && b.type !== "mini_spike") return false;
    const corners = this.getObstacleCorners(a);
    for (const p of corners) {
      if (!this.isPointInStaticObstacle(p.x, p.y, b)) return false;
    }
    return true;
  }
  isPointInStaticObstacle(px, py, obs) {
    if (obs.type === "block") {
      return this.isPointInRotatedRect(px, py, obs);
    }
    if (obs.type === "spike" || obs.type === "mini_spike") {
      const isBottomSpike = obs.y > 300;
      const centerX = obs.x + obs.width / 2;
      if (isBottomSpike) {
        return this.isPointInTriangle(
          px,
          py,
          obs.x,
          obs.y + obs.height,
          centerX,
          obs.y,
          obs.x + obs.width,
          obs.y + obs.height
        );
      } else {
        return this.isPointInTriangle(
          px,
          py,
          obs.x,
          obs.y,
          centerX,
          obs.y + obs.height,
          obs.x + obs.width,
          obs.y
        );
      }
    }
    return false;
  }
  getObstacleCorners(obs) {
    if (obs.type === "spike" || obs.type === "mini_spike") {
      const isBottomSpike = obs.y > 300;
      const centerX = obs.x + obs.width / 2;
      if (isBottomSpike) {
        return [
          { x: obs.x, y: obs.y + obs.height },
          { x: centerX, y: obs.y },
          { x: obs.x + obs.width, y: obs.y + obs.height }
        ];
      } else {
        return [
          { x: obs.x, y: obs.y },
          { x: centerX, y: obs.y + obs.height },
          { x: obs.x + obs.width, y: obs.y }
        ];
      }
    }
    if (obs.angle) {
      const angleRad = obs.angle * Math.PI / 180;
      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const hw = obs.width / 2;
      const hh = obs.height / 2;
      return [
        { dx: -hw, dy: -hh },
        { dx: hw, dy: -hh },
        { dx: hw, dy: hh },
        { dx: -hw, dy: hh }
      ].map((p) => ({
        x: cx + p.dx * cos - p.dy * sin,
        y: cy + p.dx * sin + p.dy * cos
      }));
    }
    if (obs.type === "triangle" || obs.type === "steep_triangle") {
      return [
        { x: obs.x, y: obs.y + obs.height },
        // BL
        { x: obs.x + obs.width, y: obs.y + obs.height },
        // BR
        { x: obs.x + obs.width, y: obs.y }
        // TR
      ];
    }
    return [
      { x: obs.x, y: obs.y },
      { x: obs.x + obs.width, y: obs.y },
      { x: obs.x, y: obs.y + obs.height },
      { x: obs.x + obs.width, y: obs.y + obs.height }
    ];
  }
  isPointInTriangle(px, py, x1, y1, x2, y2, x3, y3) {
    const area = Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2);
    const area1 = Math.abs((px * (y1 - y2) + x1 * (y2 - py) + x2 * (py - y1)) / 2);
    const area2 = Math.abs((px * (y2 - y3) + x2 * (y3 - py) + x3 * (py - y2)) / 2);
    const area3 = Math.abs((px * (y3 - y1) + x3 * (y1 - py) + x1 * (py - y3)) / 2);
    return Math.abs(area - (area1 + area2 + area3)) < 0.1;
  }
  spawnDeathParticles() {
    const colors = ["#ff4444", "#ff8844", "#ffaa00", "#ffffff"];
    for (let i = 0; i < 15; i++) {
      const angle = Math.PI * 2 * i / 15;
      const speed = 100 + Math.random() * 150;
      this.particles.push({
        x: this.playerX,
        y: this.playerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)] || "#ffffff"
      });
    }
  }
  getObstacleStateAt(obs, time) {
    let y = obs.y;
    let angle = obs.angle || 0;
    if (obs.movement) {
      if (obs.movement.type === "updown" && obs.initialY !== void 0) {
        const { range, speed, phase } = obs.movement;
        y = obs.initialY + Math.sin(time * speed + phase) * range;
      } else if (obs.movement.type === "rotate") {
        const { speed, phase } = obs.movement;
        const rad = time * speed + phase;
        angle = rad * 180 / Math.PI % 360;
      }
    } else {
      if (["saw", "rotor", "spike_ball"].includes(obs.type)) {
        const speed = 3;
        angle = time * speed * 180 / Math.PI % 360;
      } else if (["hammer", "swing_blade"].includes(obs.type)) {
        const speed = 3;
        const range = 60;
        angle = Math.sin(time * speed) * range;
      } else if (["piston_v", "crusher_jaw"].includes(obs.type)) {
        if (obs.initialY !== void 0) {
          const speed = 2;
          const range = 50;
          y = obs.initialY + Math.sin(time * speed) * range;
        }
      }
    }
    return { y, angle };
  }
  updateMovingObstacles(dt, time) {
    for (const obs of this.obstacles) {
      const hasImplicit = ["saw", "rotor", "spike_ball", "hammer", "swing_blade", "piston_v", "crusher_jaw"].includes(obs.type);
      if (obs.movement || hasImplicit) {
        const state = this.getObstacleStateAt(obs, time);
        if ((hasImplicit || obs.movement?.type === "updown") && obs.initialY === void 0) {
          obs.initialY = obs.y;
        }
        obs.y = state.y;
        obs.angle = state.angle;
      }
      if (obs.type === "falling_spike") {
        if (!obs.customData) obs.customData = {};
        if (obs.customData.isFalling === void 0) {
          obs.customData.isFalling = false;
          obs.customData.vy = 0;
          if (obs.initialY === void 0) obs.initialY = obs.y;
        }
        const isFalling = obs.customData.isFalling;
        if (isFalling) {
          const gravity = 2500;
          obs.customData.vy = (obs.customData.vy || 0) + gravity * dt;
          obs.y += obs.customData.vy * dt;
        } else {
          const dist = obs.x - this.playerX;
          if (dist < 150 && dist > -50) {
            obs.customData.isFalling = true;
            obs.customData.vy = 0;
          }
          if (obs.initialY !== void 0) obs.y = obs.initialY;
        }
      }
    }
  }
  die(reason) {
    this.isDead = true;
    this.failReason = reason;
    this.isPlaying = false;
    this.showHitboxes = true;
    this.isAutoplay = false;
  }
  setHolding(holding) {
    this.isHolding = holding;
  }
  getProgress() {
    return Math.floor(this.progress);
  }
  getState() {
    return {
      playerX: this.playerX,
      playerY: this.playerY,
      velocity: this.isHolding ? -this.waveAmplitude : this.waveAmplitude,
      isHolding: this.isHolding,
      progress: this.progress,
      isGravityInverted: this.isGravityInverted,
      speedMultiplier: this.speedMultiplier,
      isMini: this.isMini,
      waveAngle: this.waveAngle
    };
  }
}

export { GameEngine as G };
//# sourceMappingURL=game-engine-Dr6cT55m.mjs.map
