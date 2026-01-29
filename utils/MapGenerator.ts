export type ObstacleType = 'spike' | 'block' | 'saw' | 'mini_spike' | 'laser' | 'spike_ball' | 'v_laser' | 'mine' | 'orb' | 'slope' | 'triangle' | 'steep_triangle';
export type PortalType = 'gravity_yellow' | 'gravity_blue' | 'speed_0.25' | 'speed_0.5' | 'speed_1' | 'speed_2' | 'speed_3' | 'speed_4' | 'mini_pink' | 'mini_green';

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
  private calculateGap(difficulty: number, isMini: boolean): number {
    // 플레이어 크기 (기본 약 12~15)
    // 난이도 1: 약 450px (기본 간격 2배)
    // 난이도 30: 약 60px (Impossible 0.7배 - 난이도 격차 확대)
    const baseGap = Math.max(60, 450 - (difficulty * 13));
    // Mini Portal: 간격 1.5배 (기존 0.7 -> 1.5)
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
        currentGap = baseGapVal * (1 / 1.4);
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

      // ... (rest is same logic, just use targetFloorY logic and sync ceil to gap)

      // 2. Determine Step Direction
      let stepY = 0;
      const diff = targetFloorY - currentFloorY;
      const threshold = 10;

      if (diff < -threshold) stepY = -blockSize;
      else if (diff > threshold) stepY = blockSize;

      // 3. Terrain Generation
      // --- FLOOR ---
      if (stepY < 0) {
        // UP Slope ◢
        currentFloorY -= blockSize;
        const blockY = currentFloorY;
        objects.push({ type: 'triangle', x: currentX, y: blockY, width: blockSize, height: blockSize, rotation: 0 });
        this.fillBelow(objects, currentX, blockY + blockSize, blockSize);
      } else if (stepY > 0) {
        // DOWN Slope ◤
        const blockY = currentFloorY;
        objects.push({ type: 'triangle', x: currentX, y: blockY, width: blockSize, height: blockSize, rotation: 90 });
        this.fillBelow(objects, currentX, blockY + blockSize, blockSize);
        currentFloorY += blockSize;
      } else {
        // FLAT ■
        const blockY = currentFloorY;
        objects.push({ type: 'block', x: currentX, y: blockY, width: blockSize, height: blockSize });
        this.fillBelow(objects, currentX, blockY + blockSize, blockSize);
      }

      // --- CEILING ---
      const ceilStepY = stepY;
      if (ceilStepY < 0) {
        // UP Slope ◥
        currentCeilY -= blockSize;
        const blockY = currentCeilY;
        objects.push({ type: 'triangle', x: currentX, y: blockY, width: blockSize, height: blockSize, rotation: 180 });
        this.fillAbove(objects, currentX, blockY, blockSize);
      } else if (ceilStepY > 0) {
        // DOWN Slope ◣
        const blockY = currentCeilY;
        objects.push({ type: 'triangle', x: currentX, y: blockY, width: blockSize, height: blockSize, rotation: -90 });
        this.fillAbove(objects, currentX, blockY, blockSize);
        currentCeilY += blockSize;
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
      const rand = Math.abs(Math.sin(currentX * 0.123 + currentFloorY * 0.456)); // Deterministic random

      // Chance to place Spikes on Flat Surfaces (roughly 20%)
      // Only if gap is wide enough
      if (stepY === 0 && currentGap > 100 && rand < 0.2) {
        const distToPath = currentFloorY - currentPoint.y; // Positive if player is above floor
        const spikeH = 40;

        // Floor Spike
        if (rand < 0.1) {
          // Ensure player is far enough above the floor
          if (currentPoint.y < currentFloorY - spikeH - 20) {
            objects.push({
              type: 'spike',
              x: currentX,
              y: currentFloorY - spikeH,
              width: blockSize,
              height: spikeH
            });
          } else if (currentPoint.y < currentFloorY - 20 - 20) {
            // If too close for big spike, try mini spike
            objects.push({
              type: 'mini_spike',
              x: currentX + 10,
              y: currentFloorY - 20,
              width: 30,
              height: 20
            });
          }
        }
        // Ceiling Spike
        else {
          // Ensure player is far enough below the ceiling
          // currentCeilY is bottom of ceiling block
          if (currentPoint.y > currentCeilY + spikeH + 20) {
            objects.push({
              type: 'spike',
              x: currentX,
              y: currentCeilY,
              width: blockSize,
              height: spikeH,
              rotation: 180
            });
          } else if (currentPoint.y > currentCeilY + 20 + 20) {
            objects.push({
              type: 'mini_spike',
              x: currentX + 10,
              y: currentCeilY,
              width: 30,
              height: 20,
              rotation: 180
            });
          }
        }
      }

      // Chance to place Floating Hazards (Mines) (roughly 5%)
      // Avoid placing near beats (orbs) or if gap is too tight
      if (rand > 0.95 && currentGap > 200) {
        const mineSize = 30;
        // Try to place in the "other" side of player
        // If player is high, place low, etc.
        const midY = (currentFloorY + currentCeilY) / 2;
        let pY = midY;

        if (currentPoint.y < midY) {
          // Player is in upper half -> place mine in lower half
          pY = midY + (currentFloorY - midY) * 0.5;
        } else {
          // Player is in lower half -> place mine in upper half
          pY = midY - (midY - currentCeilY) * 0.5;
        }

        // Double check distance
        if (Math.abs(pY - currentPoint.y) > 80) {
          objects.push({
            type: 'mine',
            x: currentX + 10,
            y: pY - mineSize / 2,
            width: mineSize,
            height: mineSize,
            isHitbox: true
          });
        }
      }

      // Beat Decoration (Orbs)
      // Check if any beat time falls within this block's time range
      // Range: currentPoint.time ~ nextPoint.time
      // We scan beatTimes using beatIdx to avoid redundant checks
      while (beatIdx < beatTimes.length && beatTimes[beatIdx]! < currentPoint!.time) {
        beatIdx++; // Skip past beats
      }
      // Check beats in the current window
      while (beatIdx < beatTimes.length && beatTimes[beatIdx]! <= nextPoint.time) {
        // Found a beat in this segment!
        const beatT = beatTimes[beatIdx];
        // Calculate exact beat X (approximate based on current segment)
        // If we have strict time-X relation, we can use it.
        // Or simply place at currentX since it's close enough (within 50px)
        objects.push({
          type: 'orb',
          x: currentX + 25, // Center of block
          y: (currentFloorY + currentCeilY) / 2 - 40, // Center of tunnel
          width: 80, height: 80, isHitbox: false
        });

        beatIdx++;
      }
    }

    return objects;
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
