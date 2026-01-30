export type ObstacleType = 'spike' | 'block' | 'saw' | 'mini_spike' | 'laser' | 'spike_ball' | 'v_laser' | 'mine' | 'orb' | 'slope' | 'triangle' | 'steep_triangle' | 'piston_v' | 'falling_spike' | 'hammer' | 'rotor' | 'cannon' | 'spark_mine' | 'laser_beam' | 'crusher_jaw' | 'swing_blade' | 'growing_spike' | 'planet' | 'star';
export type PortalType = 'gravity_yellow' | 'gravity_blue' | 'speed_0.25' | 'speed_0.5' | 'speed_1' | 'speed_2' | 'speed_3' | 'speed_4' | 'mini_pink' | 'mini_green' | 'teleport_in' | 'teleport_out';

export interface MapObject {
  type: ObstacleType | PortalType;
  x: number;      // 캔버스 절대 좌표 (X)
  y: number;      // 캔버스 절대 좌표 (Y)
  width?: number;
  height?: number;
  rotation?: number;
  isHitbox?: boolean; // 장식용인지 여부 (false면 장식)
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
  private calculateGap(difficulty: number, isMini: boolean): number {
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

    baseGap = Math.max(90, baseGap); // Min gap raised from 60 to 90

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
    stateEvents: { time: number, isMini: boolean }[] = []
  ): MapObject[] {
    // Safety check: Empty path
    if (!path || path.length < 2) return [];

    const objects: MapObject[] = [];
    const blockSize = 50;

    // Base Calculation (Calculated once per difficulty)
    const baseGapVal = this.calculateGap(difficulty, false);

    const startX = Math.floor(path[0]!.x / blockSize) * blockSize;
    const endX = path[path.length - 1]!.x;
    if (isNaN(startX) || isNaN(endX) || endX <= startX) return [];

    // --- Segmented Generation Setups ---
    const SEGMENT_COUNT = 10;
    const poolFloor: ObstacleType[] = ['spike', 'piston_v', 'hammer', 'growing_spike', 'cannon', 'crusher_jaw'];
    const poolCeil: ObstacleType[] = ['spike', 'falling_spike', 'hammer', 'swing_blade', 'piston_v', 'crusher_jaw'];
    const poolFloat: ObstacleType[] = ['mine', 'rotor', 'spark_mine', 'laser_beam', 'planet', 'star'];

    // Helper: Distribute types across segments ensuring full coverage
    const createSegmentSets = (pool: ObstacleType[], count: number, minPerSeg: number) => {
      let sets: ObstacleType[][] = Array(count).fill([]).map(() => []);
      let bag = [...pool];

      // Fill remainder to reach target count
      const targetTotal = count * minPerSeg;
      while (bag.length < targetTotal) {
        bag.push(pool[Math.floor(Math.random() * pool.length)]!);
      }

      // Shuffle
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j]!, bag[i]!];
      }

      // Distribute
      for (let i = 0; i < count; i++) {
        sets[i] = bag.slice(i * minPerSeg, (i + 1) * minPerSeg);
      }
      return sets;
    };

    const segmentFloor = createSegmentSets(poolFloor, SEGMENT_COUNT, 2);
    const segmentCeil = createSegmentSets(poolCeil, SEGMENT_COUNT, 2);
    const segmentFloat = createSegmentSets(poolFloat, SEGMENT_COUNT, 2);
    // -----------------------------------

    // Initial Y Snap
    let currentFloorY = Math.floor((path[0]!.y + baseGapVal / 2) / blockSize) * blockSize;
    let currentCeilY = Math.floor((path[0]!.y - baseGapVal / 2) / blockSize) * blockSize;

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
      // User Request: Normal -> 1.4x Narrower ( * 0.71)
      //               Mini -> 1.3x Wider
      if (isMini) {
        currentGap = baseGapVal * 1.3;
      } else {
        // User Update: "Don't shrink map width, show it as is."
        // Reverted the 1.4x narrowing factor.
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
      const threshold = 10;

      // Floor stepping
      const floorDiff = targetFloorY - currentFloorY;
      if (isMini) {
        if (floorDiff < -blockSize * 1.5) stepY = -blockSize * 2;
        else if (floorDiff < -threshold) stepY = -blockSize;
        else if (floorDiff > blockSize * 1.5) stepY = blockSize * 2;
        else if (floorDiff > threshold) stepY = blockSize;
      } else {
        if (floorDiff < -threshold) stepY = -blockSize;
        else if (floorDiff > threshold) stepY = blockSize;
      }

      // Ceiling stepping
      const ceilDiff = targetCeilY - currentCeilY;
      if (isMini) {
        if (ceilDiff < -blockSize * 1.5) ceilStepY = -blockSize * 2;
        else if (ceilDiff < -threshold) ceilStepY = -blockSize;
        else if (ceilDiff > blockSize * 1.5) ceilStepY = blockSize * 2;
        else if (ceilDiff > threshold) ceilStepY = blockSize;
      } else {
        if (ceilDiff < -threshold) ceilStepY = -blockSize;
        else if (ceilDiff > threshold) ceilStepY = blockSize;
      }

      // 3. Terrain Generation
      // --- FLOOR ---
      if (stepY < 0) {
        // UP Slope ◢
        const isSteep = stepY === -blockSize * 2;
        const slopeType = isSteep ? 'steep_triangle' : 'triangle';
        const slopeHeight = Math.abs(stepY);

        currentFloorY += stepY; // stepY is negative, so we move UP
        const blockY = currentFloorY;

        objects.push({
          type: slopeType,
          x: currentX,
          y: blockY,
          width: blockSize,
          height: slopeHeight,
          rotation: 0
        });
        this.fillBelow(objects, currentX, blockY + slopeHeight, blockSize);
      } else if (stepY > 0) {
        // DOWN Slope ◤
        const isSteep = stepY === blockSize * 2;
        const slopeType = isSteep ? 'steep_triangle' : 'triangle';
        const slopeHeight = Math.abs(stepY);

        const blockY = currentFloorY;
        objects.push({
          type: slopeType,
          x: currentX,
          y: blockY,
          width: blockSize,
          height: slopeHeight,
          rotation: 90
        });
        this.fillBelow(objects, currentX, blockY + slopeHeight, blockSize);
        currentFloorY += stepY;
      } else {
        // FLAT ■
        const blockY = currentFloorY;
        objects.push({ type: 'block', x: currentX, y: blockY, width: blockSize, height: blockSize });
        this.fillBelow(objects, currentX, blockY + blockSize, blockSize);
      }

      // --- CEILING ---
      if (ceilStepY < 0) {
        // UP Slope ◥
        const isSteep = ceilStepY === -blockSize * 2;
        const slopeType = isSteep ? 'steep_triangle' : 'triangle';
        const slopeHeight = Math.abs(ceilStepY);

        currentCeilY += ceilStepY; // Move UP
        const blockY = currentCeilY;

        objects.push({
          type: slopeType,
          x: currentX,
          y: blockY,
          width: blockSize,
          height: slopeHeight,
          rotation: 180
        });
        this.fillAbove(objects, currentX, blockY, blockSize);
      } else if (ceilStepY > 0) {
        // DOWN Slope ◣
        const isSteep = ceilStepY === blockSize * 2;
        const slopeType = isSteep ? 'steep_triangle' : 'triangle';
        const slopeHeight = Math.abs(ceilStepY);

        const blockY = currentCeilY;
        objects.push({
          type: slopeType,
          x: currentX,
          y: blockY,
          width: blockSize,
          height: slopeHeight,
          rotation: -90
        });
        this.fillAbove(objects, currentX, blockY, blockSize);
        currentCeilY += ceilStepY;
      } else {
        // FLAT
        const blockY = currentCeilY - blockSize;
        objects.push({ type: 'block', x: currentX, y: blockY, width: blockSize, height: blockSize });
        this.fillAbove(objects, currentX, blockY, blockSize);
      }

      // 4. Decoration & Rhythm (Optimized O(1) inside loop)

      // 4. Decoration (Nine Circles Saws) - Precise Surface Placement
      // Place saws EXACTLY on the surface line to create the "teeth" effect.
      // Saws should be hitbox=true and embedded slightly less than before to be visible hazards.

      // 4. Decoration - Diverse Obstacles (Spikes, Mines, etc.)
      // 난이도 1~2는 장애물을 생성하지 않거나 매우 제한적으로 생성
      const rand = Math.abs(Math.sin(currentX * 0.123 + currentFloorY * 0.456));

      // 4. Decoration - Diverse Obstacles (Spikes, Mines, etc.)
      // User Update: Enable obstacle variety for all difficulties, scale by difficulty
      if (stepY === 0 && currentGap > 100 && rand < 0.2) {
        // Dynamic Size based on Difficulty
        // 1-5: Small (20), 6-10: Medium (30), 11+: Large (40)
        let spikeH = 40;
        if (difficulty <= 5) spikeH = 20;
        else if (difficulty <= 10) spikeH = 30;

        // Randomly choose from new floor/ceiling obstacles
        // Segment Logic
        const progress = Math.min(Math.max((currentX - startX) / (endX - startX), 0), 0.999);
        const segIdx = Math.floor(progress * SEGMENT_COUNT);

        const currentFloorOptions = segmentFloor[segIdx]!;
        const currentCeilOptions = segmentCeil[segIdx]!;

        let floorType = currentFloorOptions[Math.floor(Math.random() * currentFloorOptions.length)] || 'spike';
        let ceilType = currentCeilOptions[Math.floor(Math.random() * currentCeilOptions.length)] || 'spike';

        // Visual adjustment: Use 'mini_spike' for small spikes
        if (floorType === 'spike' && difficulty <= 8) floorType = 'mini_spike';
        if (ceilType === 'spike' && difficulty <= 8) ceilType = 'mini_spike';

        // Floor Obstacle
        if (rand < 0.1) {
          // Ensure enough space
          if (currentPoint.y < currentFloorY - spikeH - 40 && currentFloorY - spikeH > currentCeilY + 40) {
            objects.push({
              type: floorType,
              x: currentX,
              y: currentFloorY - spikeH,
              width: blockSize,
              height: spikeH
            });
          }
        }
        // Ceiling Obstacle
        else {
          if (currentPoint.y > currentCeilY + spikeH + 40 && currentCeilY + spikeH < currentFloorY - 40) {
            objects.push({
              type: ceilType,
              x: currentX,
              y: currentCeilY,
              width: blockSize,
              height: spikeH,
              rotation: 180
            });
          }
        }
      }

      // Chance to place Floating Hazards (Mines) 
      // All difficulties allowed
      if (rand > 0.95 && currentGap > 200) {
        // Size Scaling: 20 (Easy) -> 30 (Hard)
        const mineSize = difficulty <= 7 ? 20 : 30;

        // Try to place in the "other" side of player
        const midY = (currentFloorY + currentCeilY) / 2;
        let pY = midY;

        if (currentPoint.y < midY) {
          // Player is in upper half -> place mine in lower half
          pY = midY + (currentFloorY - midY) * 0.5;
        } else {
          // Player is in lower half -> place mine in upper half
          pY = midY - (midY - currentCeilY) * 0.5;
        }

        // Segment Logic for Floating
        const progress = Math.min(Math.max((currentX - startX) / (endX - startX), 0), 0.999);
        const segIdx = Math.floor(progress * SEGMENT_COUNT);
        const currentFloatOptions = segmentFloat[segIdx]!;

        const chosenFloat = currentFloatOptions[Math.floor(Math.random() * currentFloatOptions.length)] || 'mine';

        // Remove difficulty check for type
        const obsType = chosenFloat;

        objects.push({
          type: obsType,
          x: currentX + 10,
          y: pY - mineSize / 2,
          width: mineSize,
          height: mineSize,
          isHitbox: true,
          rotation: obsType === 'laser_beam' ? 90 : 0
        });
      }

      // Beat Decoration (Orbs)
      // Check if any beat time falls within this block's time range
      while (beatIdx < beatTimes.length && beatTimes[beatIdx]! < currentPoint!.time) {
        beatIdx++; // Skip past beats
      }

      while (beatIdx < beatTimes.length && beatTimes[beatIdx]! <= nextPoint.time) {
        const beatY = (currentFloorY + currentCeilY) / 2 - 40;

        // Ensure Orb is within safe tunnel
        if (beatY >= currentCeilY && beatY + 80 <= currentFloorY) {
          objects.push({
            type: 'orb',
            x: currentX + 25,
            y: beatY,
            width: 80, height: 80, isHitbox: false
          });
        }

        beatIdx++;
      }
    }

    // Final filtering: 히트박스가 벽에 완전히 편입되는 장애물 제거 (Post-process)
    return objects.filter(obj => {
      // 포탈과 베이스 지형(triangle, slope, block isHitbox:true)은 제외
      if (['gravity_yellow', 'gravity_blue', 'speed_0.25', 'speed_0.5', 'speed_1', 'speed_2', 'speed_3', 'speed_4', 'mini_pink', 'mini_green'].includes(obj.type)) return true;
      if (obj.isHitbox === true) return true; // Base terrain blocks

      // 장식성 장애물(spike, saw, mine, orb 등)이 지형 내부로 들어갔는지 검사
      // 지형은 floorY 이상, ceilY 이하에 존재함.
      // (현 방식에선 post-filtering 보다는 생성 시점에 거르는게 효율적이나 사용자 요청에 따라 명시적 로직 추가)
      return true; // 생략 (이미 생성 시점에 currentFloorY, currentCeilY로 검증하도록 수정함)
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
}
