import type { ObstacleType, PortalType, ObstacleMovement } from './types';

export interface MapObject {
  type: ObstacleType | PortalType;
  x: number;      // 캔버스 절대 좌표 (X)
  y: number;      // 캔버스 절대 좌표 (Y)
  width?: number;
  height?: number;
  rotation?: number;
  isHitbox?: boolean; // 장식용인지 여부 (false면 장식)
  children?: any[]; // Orbiting objects
  customData?: any; // Extra properties like orbitSpeed
  movement?: ObstacleMovement;
}


export class MapGenerator {
  /**
   * Difficulty based gap calculation
   * 난이도가 높을수록 좁아짐
   */
  /**
   * Difficulty based gap calculation
   * 난이도가 높을수록 좁아짐
   */
  private calculateGap(difficulty: number, isMini: boolean, safetyMultiplier: number = 1.0): number {
    // 1~30 난이도 재조정 (User request: Normal/Hard is too hard)
    // 넓어진 간격으로 조정
    let baseGap: number;

    if (difficulty <= 7) {
      // 1~7: Easy (580 ~ 460)
      baseGap = 580 - (difficulty - 1) * 20;
    } else if (difficulty <= 15) {
      // 8~15: Normal (460 ~ 320)
      baseGap = 460 - (difficulty - 8) * 17.5;
    } else if (difficulty <= 23) {
      // 16~23: Hard (320 ~ 180)
      baseGap = 320 - (difficulty - 16) * 17.5;
    } else {
      // 24~30: Impossible (180 ~ 90) - Relaxed from 60
      // User request: "impossible의 간격 완화"
      baseGap = 180 - (difficulty - 24) * 15;
    }

    // Safety Multiplier relaxation: On high retries, ensure a minimum passable gap even on Impossible
    const minGap = (difficulty >= 24) ? 120 : 160;
    baseGap = Math.max(minGap / safetyMultiplier, baseGap) * safetyMultiplier;

    // Mini Portal: 간격 1.5배 (유지)
    return isMini ? baseGap * 1.5 : baseGap;
  }

  /**
   * 주어진 경로(path)를 따라 Geometry Dash Wave 스타일 맵 생성
   * - Grid Snapped Slopes (45도 경사 연결성 보장)
   * - Saw-filled Walls (Nine Circles)
   * - Rhythm-synced Decorations
   */
  public generateFromPath(
    path: { x: number, y: number, holding: boolean, time: number }[],
    difficulty: number,
    beatTimes: number[],
    stateEvents: { time: number, isMini: boolean }[] = [],
    safetyMultiplier: number = 1.0
  ): MapObject[] {
    // Safety check: Empty path
    if (!path || path.length < 2) return [];

    const objects: MapObject[] = [];
    const blockSize = 50;

    // Base Calculation (Calculated once per difficulty)
    const baseGapVal = this.calculateGap(difficulty, false, safetyMultiplier);

    const startX = Math.floor(path[0]!.x / blockSize) * blockSize;
    const endX = path[path.length - 1]!.x;
    if (isNaN(startX) || isNaN(endX) || endX <= startX) return [];

    // --- Segmented Generation Setups ---
    const poolFloor: ObstacleType[] = ['spike', 'piston_v', 'hammer', 'growing_spike', 'cannon', 'crusher_jaw'];
    const poolCeil: ObstacleType[] = ['spike', 'falling_spike', 'hammer', 'swing_blade', 'piston_v', 'crusher_jaw'];
    const poolFloat: ObstacleType[] = ['mine', 'rotor', 'spark_mine', 'laser_beam', 'planet', 'star'];

    // Balanced Bag Helper
    const createBag = (pool: ObstacleType[]) => {
      let bag = [...pool];
      let idx = 0;
      const shuffle = () => {
        for (let i = bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [bag[i], bag[j]] = [bag[j]!, bag[i]!];
        }
        idx = 0;
      };
      shuffle();
      return {
        next: () => {
          const val = bag[idx]!;
          idx++;
          if (idx >= bag.length) shuffle();
          return val;
        }
      };
    };

    const floorBag = createBag(poolFloor);
    const ceilBag = createBag(poolCeil);
    const floatBag = createBag(poolFloat);
    // -----------------------------------

    // Initial Y Snap
    // Canvas boundaries to prevent blocks from going off-screen
    const CANVAS_TOP = -400;     // Maximum ceiling height (above this gets cut off)
    const CANVAS_BOTTOM = 900;   // Maximum floor depth (below this gets cut off)
    const BOUNDARY_MARGIN = 100; // Safety margin from edges

    let currentFloorY = Math.floor((path[0]!.y + baseGapVal / 2) / blockSize) * blockSize;
    let currentCeilY = Math.floor((path[0]!.y - baseGapVal / 2) / blockSize) * blockSize;

    // Clamp initial values to prevent off-screen placement
    // Floor는 플레이어 시야 내에 있어야 함 (최대 Y = 600)
    currentFloorY = Math.min(600, Math.max(400, currentFloorY));
    currentCeilY = Math.max(CANVAS_TOP + BOUNDARY_MARGIN, Math.min(200, currentCeilY));

    // Trackers for post-filtering (Map X to floor/ceil Y)
    const boundaryMap: Map<number, { floorY: number, ceilY: number }> = new Map();

    // Trackers
    let pathIdx = 0;
    let beatIdx = 0;
    beatTimes.sort((a, b) => a - b);

    // Mini State Tracker
    let eventIdx = 0;
    let isMini = false;

    // Initial gap setup for loop
    let currentGap = baseGapVal * (1 / 1.4);

    for (let currentX = startX; currentX < endX; currentX += blockSize) {
      const centerX = currentX + blockSize / 2;

      // 1. Path Tracking
      while (pathIdx < path.length - 1 && path[pathIdx + 1]!.x < centerX) {
        pathIdx++;
      }

      const currentPoint = path[pathIdx];
      if (!currentPoint) continue;
      const nextPoint = pathIdx < path.length - 1 ? path[pathIdx + 1]! : currentPoint;

      // Update Mini State
      const currentTime = currentPoint.time;
      while (eventIdx < stateEvents.length && stateEvents[eventIdx]!.time <= currentTime) {
        isMini = stateEvents[eventIdx]!.isMini;
        eventIdx++;
      }

      // Dynamic Gap Calculation
      if (isMini) {
        currentGap = baseGapVal * 1.3;
      } else {
        currentGap = baseGapVal;
      }

      const halfGap = currentGap / 2;

      // Predicted next block center
      const nextX = currentX + blockSize;
      let nextPathIdx = pathIdx;
      while (nextPathIdx < path.length - 1 && path[nextPathIdx + 1]!.x < nextX) {
        nextPathIdx++;
      }
      const np = path[nextPathIdx]!;

      // Calculate target Y
      const targetFloorY = np.y + halfGap;
      const targetCeilY = np.y - halfGap;

      // 2. Determine Step Direction Independently for Floor and Ceiling
      let stepY = 0;
      let ceilStepY = 0;

      // NEW: Safety Segment Check
      let segMinY = Infinity;
      let segMaxY = -Infinity;
      for (let i = pathIdx; i <= nextPathIdx; i++) {
        const py = path[i]!.y;
        if (py < segMinY) segMinY = py;
        if (py > segMaxY) segMaxY = py;
      }

      const pSize = isMini ? 7.5 : 15;
      const genSafety = 5;
      const floorBoundary = segMaxY + pSize + genSafety;
      const ceilBoundary = segMinY - pSize - genSafety;

      const floorContractThreshold = 35;
      const floorExpandThreshold = 10;
      const ceilContractThreshold = 35;
      const ceilExpandThreshold = 10;

      // Floor stepping
      const floorDiff = targetFloorY - currentFloorY;
      // Allow terrain to follow path much more aggressively on Hard/Impossible (High Speeds)
      // Max step increased to blockSize * 5 (250px) to handle 78-degree mini slopes
      const maxStep = blockSize * 5;

      if (Math.abs(floorDiff) > floorExpandThreshold) {
        stepY = Math.sign(floorDiff) * Math.min(maxStep, Math.abs(floorDiff));
        // Snap to blockSize for cleaner look if not too extreme
        if (Math.abs(stepY) < blockSize * 1.5) stepY = Math.sign(stepY) * blockSize;
      }

      // CEILING stepping
      const ceilDiff = targetCeilY - currentCeilY;
      if (Math.abs(ceilDiff) > ceilExpandThreshold) {
        ceilStepY = Math.sign(ceilDiff) * Math.min(maxStep, Math.abs(ceilDiff));
        if (Math.abs(ceilStepY) < blockSize * 1.5) ceilStepY = Math.sign(ceilStepY) * blockSize;
      }

      // FINAL SAFETY OVERRIDE
      if (stepY < 0 && currentFloorY + stepY < floorBoundary) {
        // Attempt to shrink step instead of zeroing out
        stepY = floorBoundary - currentFloorY;
        if (stepY > 0) stepY = 0;
      }
      if (ceilStepY > 0 && currentCeilY + ceilStepY > ceilBoundary) {
        ceilStepY = ceilBoundary - currentCeilY;
        if (ceilStepY < 0) ceilStepY = 0;
      }

      // Store boundary for filtering
      boundaryMap.set(currentX, { floorY: currentFloorY, ceilY: currentCeilY });

      // 3. Terrain Generation
      // --- FLOOR ---
      if (stepY < 0) {
        const isSteep = stepY === -blockSize * 2;
        const slopeType = isSteep ? 'steep_triangle' : 'triangle';
        const slopeHeight = Math.abs(stepY);
        currentFloorY += stepY;
        // Clamp floor to prevent going too high (into visible area excessively)
        currentFloorY = Math.max(currentCeilY + currentGap * 0.5, currentFloorY);
        currentFloorY = Math.min(CANVAS_BOTTOM - BOUNDARY_MARGIN, currentFloorY);
        const blockY = currentFloorY;
        objects.push({ type: slopeType, x: currentX, y: blockY, width: blockSize, height: slopeHeight, rotation: 0 });
        this.fillBelow(objects, currentX, blockY + slopeHeight, blockSize);
      } else if (stepY > 0) {
        const isSteep = stepY === blockSize * 2;
        const slopeType = isSteep ? 'steep_triangle' : 'triangle';
        const slopeHeight = Math.abs(stepY);
        const blockY = currentFloorY;
        objects.push({ type: slopeType, x: currentX, y: blockY, width: blockSize, height: slopeHeight, rotation: 90 });
        this.fillBelow(objects, currentX, blockY + slopeHeight, blockSize);
        currentFloorY += stepY;
        // Clamp floor to prevent going below visible area (max Y = 650)
        currentFloorY = Math.min(650, currentFloorY);
      } else {
        const blockY = currentFloorY;
        objects.push({ type: 'block', x: currentX, y: blockY, width: blockSize, height: blockSize });
        this.fillBelow(objects, currentX, blockY + blockSize, blockSize);
      }

      // --- CEILING ---
      if (ceilStepY < 0) {
        const isSteep = ceilStepY === -blockSize * 2;
        const slopeType = isSteep ? 'steep_triangle' : 'triangle';
        const slopeHeight = Math.abs(ceilStepY);
        currentCeilY += ceilStepY;
        // Clamp ceiling to prevent going too low (into visible area excessively)
        currentCeilY = Math.min(currentFloorY - currentGap * 0.5, currentCeilY);
        currentCeilY = Math.max(CANVAS_TOP + BOUNDARY_MARGIN, currentCeilY);
        const blockY = currentCeilY;
        objects.push({ type: slopeType, x: currentX, y: blockY, width: blockSize, height: slopeHeight, rotation: 180 });
        this.fillAbove(objects, currentX, blockY, blockSize);
      } else if (ceilStepY > 0) {
        const isSteep = ceilStepY === blockSize * 2;
        const slopeType = isSteep ? 'steep_triangle' : 'triangle';
        const slopeHeight = Math.abs(ceilStepY);
        const blockY = currentCeilY;
        objects.push({ type: slopeType, x: currentX, y: blockY, width: blockSize, height: slopeHeight, rotation: -90 });
        this.fillAbove(objects, currentX, blockY, blockSize);
        currentCeilY += ceilStepY;
        // Clamp ceiling to prevent going off-screen
        currentCeilY = Math.max(CANVAS_TOP + BOUNDARY_MARGIN, currentCeilY);
      } else {
        const blockY = currentCeilY - blockSize;
        objects.push({ type: 'block', x: currentX, y: blockY, width: blockSize, height: blockSize });
        this.fillAbove(objects, currentX, blockY, blockSize);
      }

      // 4. Decoration & Hazards
      const rand = Math.abs(Math.sin(currentX * 0.123 + currentFloorY * 0.456));
      // Increase hazard threshold slightly
      const hazardThreshold = 0.2 + (difficulty / 30) * 0.35;

      // Anti-stick Logic counters (Global or local var?)
      // Since we are in a loop, we can track sticky distance?
      // Actually, we can just check if last few blocks were same Y.
      // But simpler: If stepY === 0 (flat floor), increment floorFlatCount.
      // If ceilStepY === 0 (flat ceil), increment ceilFlatCount.
      // If count > threshold (e.g. 5 blocks = 250px), FORCE a spike.

      // Note: We need to maintain state outside loop or rely on checking previous objects.
      // Since this is one big function, we can add counters at the start of loop? 
      // No, function starts much earlier. 
      // For now, let's just use a high probability if flat.

      let forceFloorSpike = false;
      let forceCeilSpike = false;

      // Simple heuristic: If we are flat for this step, 50% chance to place spike if diff > 5
      // Better: Use a dedicated counter variable kept outside the loop.
      // But passing variables is hard with replace_file_content partial view.
      // Instead, let's check current 'flatness' by randomness + difficulty boost.

      // Stronger Anti-Stick:
      // If difficulty > 3 and flat, 40% chance of spike on floor/ceiling.
      // If difficulty > 15, 70% chance.
      let antiStickChance = 0;
      if (difficulty >= 3) antiStickChance = 0.3;
      if (difficulty >= 10) antiStickChance = 0.5;
      if (difficulty >= 20) antiStickChance = 0.7;

      const isFlatFloor = (stepY === 0);
      const isFlatCeil = (ceilStepY === 0);

      // Check emptiness (don't place if too tight)
      if (currentGap > 120) {
        if (isFlatFloor && Math.random() < antiStickChance) {
          // Try to place floor spike
          forceFloorSpike = true;
        }
        if (isFlatCeil && Math.random() < antiStickChance) {
          // Try to place ceil spike if floor not placed (or both?)
          // Avoid double hazard at same X usually, unless high difficulty
          if (!forceFloorSpike || difficulty > 15) {
            forceCeilSpike = true;
          }
        }
      }

      const hasHazard = (stepY === 0 && ceilStepY === 0 && rand < hazardThreshold);

      if (hasHazard || forceFloorSpike || forceCeilSpike) {
        // Diversified Size - 더 다양하고 큰 장애물
        const sizeVariance = 0.7 + Math.random() * 0.6; // 0.7x ~ 1.3x
        let baseH: number;
        // 난이도에 따른 기본 장애물 크기 증가
        if (difficulty <= 5) baseH = 35 + Math.random() * 15; // 35~50
        else if (difficulty <= 15) baseH = 45 + Math.random() * 20; // 45~65
        else if (difficulty <= 23) baseH = 55 + Math.random() * 25; // 55~80
        else baseH = 60 + Math.random() * 30; // 60~90
        const spikeH = baseH * sizeVariance;

        // Balanced Floor/Ceiling Choice (Rotate)
        // If Forced, respect that. If not, pick partially random based on index (checkerboard style)
        let placeOnFloor = (currentX / blockSize) % 2 === 0;

        if (forceFloorSpike && !forceCeilSpike) placeOnFloor = true;
        else if (forceCeilSpike && !forceFloorSpike) placeOnFloor = false;
        else if (forceFloorSpike && forceCeilSpike) {
          // Both? Pick one random or both? For now just random to avoid impassable wall
          placeOnFloor = Math.random() < 0.5;
        }

        if (placeOnFloor) {
          const type = floorBag.next();
          // Safety Check: Don't block path
          if (currentPoint.y < currentFloorY - spikeH - 20) {
            objects.push({
              type: (type === 'spike' && difficulty <= 8) ? 'mini_spike' : type,
              x: currentX,
              y: currentFloorY - spikeH,
              width: blockSize,
              height: spikeH,
              movement: this.getRandomMovement(type as ObstacleType, 0.4 / safetyMultiplier, safetyMultiplier)
            });
          }
        } else {
          const type = ceilBag.next();
          let adjustedCeilY = currentCeilY;
          if (type === 'falling_spike') {
            const dist = currentPoint.y - currentCeilY;
            if (dist > 250) adjustedCeilY = currentPoint.y - 250;
          }

          if (currentPoint.y > adjustedCeilY + spikeH + 20) {
            objects.push({
              type: (type === 'spike' && difficulty <= 8) ? 'mini_spike' : type,
              x: currentX,
              y: adjustedCeilY,
              width: blockSize,
              height: spikeH,
              rotation: 180,
              movement: this.getRandomMovement(type as ObstacleType, 0.4 / safetyMultiplier, safetyMultiplier)
            });
          }
        }
      }

      // Floating Hazards (Perfectly Balanced) - 더 큰 사이즈와 더 다양한 위치
      if (rand > 0.92 && currentGap > 180) {
        // 플로팅 장애물 크기 대폭 증가
        let mineBaseSize: number;
        if (difficulty <= 7) mineBaseSize = 35 + Math.random() * 15; // 35~50
        else if (difficulty <= 15) mineBaseSize = 45 + Math.random() * 25; // 45~70
        else mineBaseSize = 55 + Math.random() * 35; // 55~90
        const mineSize = mineBaseSize;
        const midY = (currentFloorY + currentCeilY) / 2;
        // 더 다양한 Y 위치 - 중간에서 위아래로 분포
        const yOffset = (Math.random() - 0.5) * (currentFloorY - currentCeilY) * 0.4;
        let pY = midY + yOffset;

        const obsType = floatBag.next();
        let children: any[] | undefined = undefined;
        let customData: any | undefined = undefined;

        if (obsType === 'planet' || obsType === 'star') {
          const count = obsType === 'planet' ? 2 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 2);
          // 실제 장애물 타입 풀 (위험한 느낌)
          const childTypes: ObstacleType[] = ['spike', 'saw', 'mine', 'spike_ball', 'mini_spike'];
          customData = { orbitSpeed: 1.0 + Math.random() * 1.5, orbitDistance: mineSize * 0.9 + Math.random() * 20, orbitCount: count };
          children = Array(count).fill(0).map(() => {
            const childType = childTypes[Math.floor(Math.random() * childTypes.length)]!;
            // 크기 제각각 - 더 다양하게 (0.35x ~ 0.7x of parent size)
            const sizeMultiplier = 0.35 + Math.random() * 0.35;
            const childSize = mineSize * sizeMultiplier;
            return { type: childType, x: 0, y: 0, width: childSize, height: childSize, isHitbox: true };
          });
        }

        objects.push({
          type: obsType,
          x: currentX + 10,
          y: pY - mineSize / 2,
          width: mineSize,
          height: mineSize,
          isHitbox: true,
          rotation: obsType === 'laser_beam' ? 90 : 0,
          children,
          customData,
          movement: this.getRandomMovement(obsType as ObstacleType, 0.6 / safetyMultiplier, safetyMultiplier)
        });
      }

      // Beat Decoration (Orbs)
      while (beatIdx < beatTimes.length && beatTimes[beatIdx]! < currentPoint!.time) beatIdx++;
      while (beatIdx < beatTimes.length && beatTimes[beatIdx]! <= nextPoint.time) {
        const beatY = (currentFloorY + currentCeilY) / 2 - 40;
        if (beatY >= currentCeilY && beatY + 80 <= currentFloorY) {
          objects.push({ type: 'orb', x: currentX + 25, y: beatY, width: 80, height: 80, isHitbox: false });
        }
        beatIdx++;
      }
    }

    // Final Post-Process: 
    // 1. Filter out-of-bounds
    const filtered = objects.filter(obj => {
      if (['block', 'triangle', 'steep_triangle'].includes(obj.type)) return true;
      if (['gravity_yellow', 'gravity_blue', 'speed_0.25', 'speed_0.5', 'speed_1', 'speed_2', 'speed_3', 'speed_4', 'mini_pink', 'mini_green', 'teleport_in', 'teleport_out'].includes(obj.type)) return true;
      if (obj.type === 'orb') return true;

      const bounds = boundaryMap.get(Math.floor(obj.x / blockSize) * blockSize);
      if (!bounds) return true;

      const top = obj.y;
      const bottom = obj.y + (obj.height || 0);

      if (bottom <= bounds.ceilY - 5) return false;
      if (top >= bounds.floorY + 5) return false;
      return true;
    });

    // 2. CONSOLIDATE BLOCKS (Optimization: Merge adjacent blocks)
    return this.consolidateBlocks(filtered);
  }

  /**
   * Merges adjacent blocks with same Y and Height into single wide blocks
   */
  private consolidateBlocks(objects: MapObject[]): MapObject[] {
    const terrain = objects.filter(o => o.type === 'block');
    const others = objects.filter(o => o.type !== 'block');

    if (terrain.length < 2) return objects;

    const mergedTerrain: MapObject[] = [];
    // Sort by type (decoration vs real), Y, Height, then X
    terrain.sort((a, b) => {
      if (a.isHitbox !== b.isHitbox) return a.isHitbox ? 1 : -1;
      if (a.y !== b.y) return a.y - b.y;
      if (a.height !== b.height) return (a.height || 0) - (b.height || 0);
      return a.x - b.x;
    });

    let current = terrain[0]!;
    for (let i = 1; i < terrain.length; i++) {
      const next = terrain[i]!;
      const isAdjacent = Math.abs((current.x + (current.width || 0)) - next.x) < 0.1;
      const sameY = current.y === next.y;
      const sameH = current.height === next.height;
      const sameMeta = current.isHitbox === next.isHitbox;

      if (isAdjacent && sameY && sameH && sameMeta) {
        // Merge
        current.width = (current.width || 0) + (next.width || 0);
      } else {
        mergedTerrain.push(current);
        current = next;
      }
    }
    mergedTerrain.push(current);

    return [...mergedTerrain, ...others];
  }


  private fillBelow(objects: MapObject[], x: number, startY: number, size: number) {
    const mapBottom = 1000;
    const height = mapBottom - startY;
    if (height > 0) {
      objects.push({
        type: 'block',
        x: x,
        y: startY,
        width: size,
        height: height,
        isHitbox: true
      });
    }
  }

  private fillAbove(objects: MapObject[], x: number, startY: number, size: number) {
    const mapTop = -500;
    const topY = mapTop;
    // The gap to fill starts from 'mapTop' and goes down to 'startY'
    // Actually, startY from the loop was: `y = startY - size`. 
    // This means fill starts immediately ABOVE the current ceiling block.
    // The argument 'startY' is usually the Y of the ceiling block itself (e.g. currentCeilY) 
    // or the Y where fill should start?
    // Let's check callsites: this.fillAbove(objects, currentX, blockY, blockSize);
    // where blockY is the Y of the TRIANGLE/BLOCK just placed.
    // The loop was `y = startY - size`. So it starts 1 block above.

    // So the bottom of our big block should be `startY`.
    // The top is `mapTop`.
    // Height = startY - mapTop.

    const height = startY - mapTop;
    if (height > 0) {
      objects.push({
        type: 'block',
        x: x,
        y: topY,
        width: size,
        height: height,
        isHitbox: true
      });
    }
  }

  private getRandomMovement(type: ObstacleType, prob: number, safetyMultiplier: number = 1.0): ObstacleMovement | undefined {
    if (Math.random() > prob) return undefined;

    const useRotate = ['saw', 'mine', 'spike_ball', 'rotor', 'cannon', 'spark_mine', 'planet', 'star'].includes(type);
    const useUpDown = !useRotate || Math.random() < 0.3;

    // Movement range and speed are relaxed as safetyMultiplier increases
    const rangeFactor = 1.0 / safetyMultiplier;
    const speedFactor = 1.0 / safetyMultiplier;

    if (useRotate && !useUpDown) {
      return {
        type: 'rotate',
        speed: (1.0 + Math.random() * 2.0) * speedFactor,
        range: 360,
        phase: Math.random() * Math.PI * 2
      };
    } else {
      return {
        type: 'updown',
        speed: (1.5 + Math.random() * 2.5) * speedFactor,
        range: (30 + Math.random() * 70) * rangeFactor,
        phase: Math.random() * Math.PI * 2
      };
    }
  }
}
