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

    baseGap = Math.max(50, baseGap) * safetyMultiplier; // Apply safety multiplier

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
    let currentFloorY = Math.floor((path[0]!.y + baseGapVal / 2) / blockSize) * blockSize;
    let currentCeilY = Math.floor((path[0]!.y - baseGapVal / 2) / blockSize) * blockSize;

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
      if (isMini) {
        if (floorDiff < -blockSize * 1.5) stepY = -blockSize * 2;
        else if (floorDiff < -floorContractThreshold) stepY = -blockSize;
        else if (floorDiff > blockSize * 1.5) stepY = blockSize * 2;
        else if (floorDiff > floorExpandThreshold) stepY = blockSize;
      } else {
        if (floorDiff < -floorContractThreshold) stepY = -blockSize;
        else if (floorDiff > floorExpandThreshold) stepY = blockSize;
      }

      // CEILING stepping
      const ceilDiff = targetCeilY - currentCeilY;
      if (isMini) {
        if (ceilDiff < -blockSize * 1.5) ceilStepY = -blockSize * 2;
        else if (ceilDiff < -ceilExpandThreshold) ceilStepY = -blockSize;
        else if (ceilDiff > blockSize * 1.5) ceilStepY = blockSize * 2;
        else if (ceilDiff > ceilContractThreshold) ceilStepY = blockSize;
      } else {
        if (ceilDiff < -ceilExpandThreshold) ceilStepY = -blockSize;
        else if (ceilDiff > ceilContractThreshold) ceilStepY = blockSize;
      }

      // FINAL SAFETY OVERRIDE
      if (stepY < 0 && currentFloorY + stepY < floorBoundary) stepY = 0;
      if (ceilStepY > 0 && currentCeilY + ceilStepY > ceilBoundary) ceilStepY = 0;

      // Store boundary for filtering
      boundaryMap.set(currentX, { floorY: currentFloorY, ceilY: currentCeilY });

      // 3. Terrain Generation
      // --- FLOOR ---
      if (stepY < 0) {
        const isSteep = stepY === -blockSize * 2;
        const slopeType = isSteep ? 'steep_triangle' : 'triangle';
        const slopeHeight = Math.abs(stepY);
        currentFloorY += stepY;
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
      } else {
        const blockY = currentCeilY - blockSize;
        objects.push({ type: 'block', x: currentX, y: blockY, width: blockSize, height: blockSize });
        this.fillAbove(objects, currentX, blockY, blockSize);
      }

      // 4. Decoration & Hazards
      const rand = Math.abs(Math.sin(currentX * 0.123 + currentFloorY * 0.456));
      const hazardThreshold = 0.2 + (difficulty / 30) * 0.35;

      if (stepY === 0 && ceilStepY === 0 && currentGap > 120 && rand < hazardThreshold) {
        // Diversified Size
        const sizeVariance = 0.8 + Math.random() * 0.4; // 0.8x ~ 1.2x
        let baseH = 40;
        if (difficulty <= 5) baseH = 25;
        else if (difficulty > 20) baseH = 50;
        const spikeH = baseH * sizeVariance;

        // Balanced Floor/Ceiling Choice (Rotate)
        const isFloor = (currentX / blockSize) % 2 === 0;

        if (isFloor) {
          const type = floorBag.next();
          if (currentPoint.y < currentFloorY - spikeH - 20) {
            objects.push({
              type: (type === 'spike' && difficulty <= 8) ? 'mini_spike' : type,
              x: currentX,
              y: currentFloorY - spikeH,
              width: blockSize,
              height: spikeH,
              movement: this.getRandomMovement(type as ObstacleType, 0.4)
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
              movement: this.getRandomMovement(type as ObstacleType, 0.4)
            });
          }
        }
      }

      // Floating Hazards (Perfectly Balanced)
      if (rand > 0.94 && currentGap > 220) {
        const mineSize = (difficulty <= 7 ? 20 : 35) * (0.9 + Math.random() * 0.2);
        const midY = (currentFloorY + currentCeilY) / 2;
        let pY = currentPoint.y < midY ? midY + (currentFloorY - midY) * 0.5 : midY - (midY - currentCeilY) * 0.5;

        const obsType = floatBag.next();
        let children: any[] | undefined = undefined;
        let customData: any | undefined = undefined;

        if (obsType === 'planet' || obsType === 'star') {
          const count = obsType === 'planet' ? 2 : 3;
          customData = { orbitSpeed: 1.0 + Math.random(), orbitDistance: mineSize * 0.8, orbitCount: count };
          children = Array(count).fill(0).map(() => ({ type: 'moon', x: 0, y: 0, width: mineSize * 0.4, height: mineSize * 0.4, isHitbox: true }));
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
          movement: this.getRandomMovement(obsType as ObstacleType, 0.6)
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

    // Final Post-Process: Remove obstacles that are outside the playable tunnel
    // 바닥과 천장 밖으로 나간 장애물 제거
    return objects.filter(obj => {
      // 1. Keep terrain and portals
      if (['block', 'triangle', 'steep_triangle'].includes(obj.type)) return true;
      if (['gravity_yellow', 'gravity_blue', 'speed_0.25', 'speed_0.5', 'speed_1', 'speed_2', 'speed_3', 'speed_4', 'mini_pink', 'mini_green', 'teleport_in', 'teleport_out'].includes(obj.type)) return true;
      if (obj.type === 'orb') return true;

      // 2. Check hazard boundaries
      const bounds = boundaryMap.get(Math.floor(obj.x / blockSize) * blockSize);
      if (!bounds) return true;

      const top = obj.y;
      const bottom = obj.y + (obj.height || 0);

      // Completely outside CEILING (Above it)
      if (bottom <= bounds.ceilY - 5) return false;
      // Completely outside FLOOR (Below it)
      if (top >= bounds.floorY + 5) return false;

      // Partially overlapping is fine, but if most of it is buried, we could remove it.
      // For now, "completely outside" is a safe bet for removal.
      return true;
    });
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

  private getRandomMovement(type: ObstacleType, prob: number): ObstacleMovement | undefined {
    if (Math.random() > prob) return undefined;

    const useRotate = ['saw', 'mine', 'spike_ball', 'rotor', 'cannon', 'spark_mine', 'planet', 'star'].includes(type);
    const useUpDown = !useRotate || Math.random() < 0.3;

    if (useRotate && !useUpDown) {
      return {
        type: 'rotate',
        speed: 1.0 + Math.random() * 2.0,
        range: 360,
        phase: Math.random() * Math.PI * 2
      };
    } else {
      return {
        type: 'updown',
        speed: 1.5 + Math.random() * 2.5,
        range: 30 + Math.random() * 70,
        phase: Math.random() * Math.PI * 2
      };
    }
  }
}
