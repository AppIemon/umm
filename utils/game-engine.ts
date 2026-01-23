/**
 * Ultra Music Mania - Wave Mode Game Engine
 * 패턴 기반 맵 생성 시스템
 */

export type ObstacleType = 'spike' | 'block' | 'saw' | 'mini_spike';
export type PortalType = 'gravity_yellow' | 'gravity_blue' | 'speed_0.5' | 'speed_1' | 'speed_2' | 'speed_3' | 'speed_4' | 'mini_pink' | 'mini_green';

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  angle?: number; // 기울기 각도 (도)
}

export interface Portal {
  x: number;
  y: number;
  width: number;
  height: number;
  type: PortalType;
  activated: boolean;
}

// 패턴 정의: 상대적 위치와 요구되는 플레이어 Y 위치
export interface Pattern {
  obstacles: { dx: number; dy: number; w: number; h: number; type: ObstacleType; angle?: number }[];
  requiredY: 'top' | 'middle' | 'bottom';  // 통과를 위해 플레이어가 있어야 할 위치
  width: number;  // 패턴의 총 너비
  type?: string;
}

export interface GameState {
  playerX: number;
  playerY: number;
  velocity: number;
  isHolding: boolean;
  progress: number;
  isGravityInverted: boolean;
  speedMultiplier: number;
  isMini: boolean;
  waveAngle: number;
}

export interface MapConfig {
  density: number;
  portalFrequency: number;
  difficulty: number; // 1 ~ 10
}

export class GameEngine {
  // Player state
  playerX: number = 200;
  playerY: number = 360;
  playerSize: number = 12;
  basePlayerSize: number = 12;
  miniPlayerSize: number = 6;  // 미니 모드 히트박스

  // Wave movement
  baseSpeed: number = 350;
  waveSpeed: number = 350;
  waveAmplitude: number = 350;
  isHolding: boolean = false;
  waveAngle: number = 45;  // 기본 45도
  miniWaveAngle: number = 60;  // 미니 모드 60도

  // Gravity system
  isGravityInverted: boolean = false;
  speedMultiplier: number = 1.0;
  isMini: boolean = false;

  // Game boundaries
  minY: number = 140;
  maxY: number = 580;

  // Map elements
  obstacles: Obstacle[] = [];
  portals: Portal[] = [];

  // Pattern library
  patterns: Pattern[] = [];

  // Map config
  mapConfig: MapConfig = {
    density: 1.0,
    portalFrequency: 0.15,
    difficulty: 5
  };

  // Camera
  cameraX: number = 0;

  // Game state
  isPlaying: boolean = false;
  isDead: boolean = false;
  failReason: string = '';
  startTime: number = 0;

  // Hitbox mode
  showHitboxes: boolean = false;

  // Score & Progress
  score: number = 0;
  progress: number = 0;
  totalLength: number = 0;

  // Track data
  trackDuration: number = 0;

  // Visual effects
  trail: { x: number; y: number; time: number }[] = [];
  particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

  // AI state persistence
  aiStateTimer: number = 0; // 현재 입력을 유지한 시간 (초)
  aiPredictedPath: { x: number; y: number }[] = [];

  constructor() {
    this.reset();
  }

  /**
   * 100개의 미리 정의된 패턴 초기화 (난이도 반영)
   */
  private initPatterns() {
    this.patterns = [];
    const playH = this.maxY - this.minY;
    const diff = this.mapConfig.difficulty;

    // 난이도별 격차 극대화: 30은 물리적 한계치 (0.02)
    const gapMultiplier = Math.max(0.02, Math.pow(0.80, diff - 5) * (diff < 5 ? 1 + (5 - diff) * 0.4 : 1));
    // 난이도에 따른 블록 간격 배수 (더 극단적)
    const blockGapFactor = 2.5 * Math.max(0.15, 1.0 + (5 - diff) * 0.1);
    const SPIKE_H = 40;

    // 패턴 1-10: 바닥 가시 (위로 피하기)
    for (let i = 0; i < 10; i++) {
      const h = 80 + i * 12;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;
      const obs: Pattern['obstacles'] = [];
      if (bh > 0) obs.push({ dx: 0, dy: playH - bh, w: 50, h: bh, type: 'block' });
      obs.push({ dx: 0, dy: playH - h, w: 50, h: sh, type: 'spike' });

      this.patterns.push({
        obstacles: obs,
        requiredY: 'top',
        width: 60
      });
    }

    // 패턴 11-20: 천장 가시 (아래로 피하기)
    for (let i = 0; i < 10; i++) {
      const h = 80 + i * 12;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;
      const obs: Pattern['obstacles'] = [];
      obs.push({ dx: 0, dy: 0, w: 50, h: sh, type: 'spike' });
      if (bh > 0) obs.push({ dx: 0, dy: sh, w: 50, h: bh, type: 'block' });

      this.patterns.push({
        obstacles: obs,
        requiredY: 'bottom',
        width: 60
      });
    }

    // 패턴 21-30: 중앙 블록 (위 또는 아래로 피하기)
    for (let i = 0; i < 10; i++) {
      const size = 120 + i * 15;
      const centerY = playH / 2 - size / 2;
      this.patterns.push({
        obstacles: [{ dx: 0, dy: centerY, w: size, h: size, type: 'block' }],
        requiredY: i % 2 === 0 ? 'top' : 'bottom',
        width: size + 20,
        type: 'square_block'
      });
    }

    // 패턴 31-40: 더블 가시 (중간 통로) - 난이도 반영
    for (let i = 0; i < 10; i++) {
      const baseGap = (160 - i * 8) * blockGapFactor;
      const gapSize = baseGap * gapMultiplier;
      const topH = (playH - gapSize) / 2;
      const bottomY = topH + gapSize;
      const bottomH = playH - bottomY;

      const sh_top = Math.min(topH, SPIKE_H);
      const sh_bot = Math.min(bottomH, SPIKE_H);

      const obs: Pattern['obstacles'] = [
        { dx: 0, dy: Math.max(0, topH - sh_top), w: 40, h: Math.max(0, sh_top), type: 'spike' },
        { dx: 0, dy: bottomY, w: 40, h: Math.max(0, sh_bot), type: 'spike' }
      ];

      if (topH > sh_top) {
        obs.push({ dx: 0, dy: 0, w: 40, h: topH - sh_top, type: 'block' });
      }
      if (bottomH > sh_bot) {
        obs.push({ dx: 0, dy: bottomY + sh_bot, w: 40, h: bottomH - sh_bot, type: 'block' });
      }

      this.patterns.push({
        obstacles: obs,
        requiredY: 'middle',
        width: 50
      });
    }

    // 패턴 41-50: 톱니 (피하기)
    for (let i = 0; i < 10; i++) {
      const size = 80 + i * 10;
      const positions = ['top', 'middle', 'bottom'] as const;
      const pos = positions[i % 3];
      let dy = playH / 2 - size / 2;
      if (pos === 'top') dy = size / 2 + 20;
      if (pos === 'bottom') dy = playH - size - 20;

      this.patterns.push({
        obstacles: [{ dx: 0, dy: dy, w: size, h: size, type: 'saw' }],
        requiredY: pos === 'top' ? 'bottom' : pos === 'bottom' ? 'top' : (i % 2 === 0 ? 'top' : 'bottom'),
        width: size + 30
      });
    }

    // 패턴 51-60: 연속 바닥 가시
    for (let i = 0; i < 10; i++) {
      const count = 2 + Math.floor(i / 3);
      const obs: Pattern['obstacles'] = [];
      const h = 50;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;

      for (let j = 0; j < count; j++) {
        if (bh > 0) obs.push({ dx: j * 40, dy: playH - bh, w: 35, h: bh, type: 'block' });
        obs.push({ dx: j * 40, dy: playH - h, w: 35, h: sh, type: 'spike' });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: 'top',
        width: count * 40 + 20
      });
    }

    // 패턴 61-70: 연속 천장 가시
    for (let i = 0; i < 10; i++) {
      const count = 2 + Math.floor(i / 3);
      const obs: Pattern['obstacles'] = [];
      const h = 50;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;

      for (let j = 0; j < count; j++) {
        obs.push({ dx: j * 40, dy: 0, w: 35, h: sh, type: 'spike' });
        if (bh > 0) obs.push({ dx: j * 40, dy: sh, w: 35, h: bh, type: 'block' });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: 'bottom',
        width: count * 40 + 20
      });
    }

    // 패턴 71-80: 지그재그 (교차 가시)
    for (let i = 0; i < 10; i++) {
      const obs: Pattern['obstacles'] = [];
      const h = 100 + i * 12;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;

      // Bottom spike 1
      obs.push({ dx: 0, dy: playH - h, w: 45, h: sh, type: 'spike' });
      if (bh > 0) obs.push({ dx: 0, dy: playH - bh, w: 45, h: bh, type: 'block' });

      // Top spike
      obs.push({ dx: 60, dy: 0, w: 45, h: sh, type: 'spike' });
      if (bh > 0) obs.push({ dx: 60, dy: sh, w: 45, h: bh, type: 'block' });

      if (i >= 5) {
        // Bottom spike 2
        obs.push({ dx: 120, dy: playH - h, w: 45, h: sh, type: 'spike' });
        if (bh > 0) obs.push({ dx: 120, dy: playH - bh, w: 45, h: bh, type: 'block' });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: 'middle',
        width: i >= 5 ? 180 : 120
      });
    }

    // 패턴 81-90: 복도 (블록 벽) - 난이도 반영
    for (let i = 0; i < 10; i++) {
      const gapY = 40 + i * 35;
      const baseGapH = (100 - i * 4) * blockGapFactor;
      const gapH = baseGapH * gapMultiplier;
      this.patterns.push({
        obstacles: [
          { dx: 0, dy: 0, w: 40, h: gapY, type: 'block' },
          { dx: 0, dy: gapY + gapH, w: 40, h: Math.max(0, playH - gapY - gapH), type: 'block' }
        ],
        requiredY: gapY < playH / 3 ? 'top' : gapY > playH * 2 / 3 - gapH ? 'bottom' : 'middle',
        width: 50,
        type: 'corridor'
      });
    }

    // 패턴 91-100: 미니 가시 장식
    for (let i = 0; i < 10; i++) {
      const obs: Pattern['obstacles'] = [];
      const h = 70;
      const sh = Math.min(h, SPIKE_H);
      const bh = h - sh;

      if (i % 2 === 0) {
        // 바닥 장식
        obs.push({ dx: 0, dy: playH - h, w: 50, h: sh, type: 'spike' });
        if (bh > 0) obs.push({ dx: 0, dy: playH - bh, w: 50, h: bh, type: 'block' });
        obs.push({ dx: -20, dy: 0, w: 15, h: 20, type: 'mini_spike' });
        obs.push({ dx: 55, dy: 0, w: 15, h: 20, type: 'mini_spike' });
      } else {
        // 천장 장식
        obs.push({ dx: 0, dy: 0, w: 50, h: sh, type: 'spike' });
        if (bh > 0) obs.push({ dx: 0, dy: sh, w: 50, h: bh, type: 'block' });
        obs.push({ dx: -20, dy: playH - 20, w: 15, h: 20, type: 'mini_spike' });
        obs.push({ dx: 55, dy: playH - 20, w: 15, h: 20, type: 'mini_spike' });
      }

      this.patterns.push({
        obstacles: obs,
        requiredY: i % 2 === 0 ? 'top' : 'bottom',
        width: 80
      });
    }

    // 기울어진 블록 패턴들 비활성화 (AI 경로 계산에 문제 발생)
    // 추후 개선 시 다시 활성화
    /*
    // 패턴 101-110: 45도 기울어진 블록 (간격 축소) + 강제 경로
    for (let i = 0; i < 5; i++) {
      this.patterns.push({
        obstacles: [
          { dx: 0, dy: 80 - (blockGapFactor - 2.5) * 20, w: 200, h: 40, type: 'block', angle: 45 },
          { dx: 0, dy: 330 + (blockGapFactor - 2.5) * 20, w: 200, h: 40, type: 'block', angle: 45 },
          // 강제 경로 블록
          { dx: 0, dy: 0, w: 200, h: 40, type: 'block' },
          { dx: 0, dy: playH - 50, w: 200, h: 50, type: 'block' }
        ],
        requiredY: 'middle',
        width: 250
      });
    }

    // 패턴 111-120: 60도 기울어진 블록 (미니 모드용) + 강제 경로
    for (let i = 0; i < 5; i++) {
      this.patterns.push({
        obstacles: [
          { dx: 0, dy: 40 - (blockGapFactor - 2.5) * 15, w: 180, h: 35, type: 'block', angle: 60 },
          { dx: 0, dy: 360 + (blockGapFactor - 2.5) * 15, w: 180, h: 35, type: 'block', angle: 60 },
          // 강제 경로 블록
          { dx: 0, dy: 0, w: 180, h: 25, type: 'block' },
          { dx: 0, dy: 410, w: 180, h: playH - 410, type: 'block' }
        ],
        requiredY: 'middle',
        width: 220
      });
    }

    // 패턴 121-130: 30도 기울어진 블록 (고난도 연타용) - 간격 확대 + 강제 경로
    for (let i = 0; i < 5; i++) {
      this.patterns.push({
        obstacles: [
          { dx: 0, dy: 60 - (blockGapFactor - 2.5) * 25, w: 320, h: 30, type: 'block', angle: 30 },
          { dx: 0, dy: 350 + (blockGapFactor - 2.5) * 25, w: 320, h: 30, type: 'block', angle: 30 },
          // 강제 경로 블록
          { dx: 0, dy: 0, w: 320, h: 35, type: 'block' },
          { dx: 0, dy: 400, w: 320, h: playH - 400, type: 'block' }
        ],
        requiredY: 'middle',
        width: 380
      });
    }
    */
  }

  reset() {
    this.playerX = 200;
    this.playerY = 360;
    this.cameraX = 0;
    this.isHolding = false;
    this.isPlaying = false;
    this.isDead = false;
    this.failReason = '';
    this.score = 0;
    this.progress = 0;
    this.trail = [];
    this.particles = [];
    this.obstacles = [];
    this.portals = [];
    this.isGravityInverted = false;
    this.speedMultiplier = 1.0;
    this.waveSpeed = this.baseSpeed;
    this.waveAmplitude = this.baseSpeed;
    this.showHitboxes = false;
    this.isMini = false;
    this.waveAngle = 45;
    this.playerSize = this.basePlayerSize;
    this.aiStateTimer = 0;
    this.aiPredictedPath = [];
    this.lastAutoplayIndex = 0;
  }

  setMapConfig(config: Partial<MapConfig>) {
    this.mapConfig = { ...this.mapConfig, ...config };
  }

  // Autoplay data
  isAutoplay: boolean = false;
  autoplayLog: { x: number, y: number, holding: boolean }[] = [];
  private lastAutoplayIndex: number = 0;

  // 패턴 간격 배율 (재생성 시 증가)
  private patternGapMultiplier: number = 1.0;

  /**
   * 패턴 기반 맵 생성 (AI 경로 계산 실패 시 자동 재생성)
   */
  generateMap(beatTimes: number[], sections: any[], duration: number, fixedSeed?: number) {
    const seed = fixedSeed || (beatTimes.length * 777 + Math.floor(duration * 100));
    const maxRetries = 10;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // 시도할 때마다 간격 배율 증가 (1.0, 1.2, 1.44, 1.73, ...)
      this.patternGapMultiplier = Math.pow(1.2, attempt);

      this.initPatterns();
      this.obstacles = [];
      this.portals = [];
      this.trackDuration = duration;
      this.totalLength = duration * this.baseSpeed + 500;
      this.autoplayLog = [];

      let rng = this.seededRandom(seed + attempt); // 시드도 살짝 변경

      this.generatePatternBasedMap(beatTimes, sections, rng);

      // 정렬 (AI 경로 계산 전에 필요)
      this.obstacles.sort((a, b) => a.x - b.x);
      this.portals.sort((a, b) => a.x - b.x);

      // AI 경로 계산 시도
      const pathSuccess = this.computeAutoplayLog(200, 360);

      if (pathSuccess) {
        console.log(`[MapGen] Map generated with seed: ${seed}, attempt: ${attempt + 1}, gapMultiplier: ${this.patternGapMultiplier.toFixed(2)}`);
        return;
      }

      console.log(`[MapGen] AI path failed at attempt ${attempt + 1}, increasing gap...`);
    }

    // 모든 시도 실패 시 마지막 결과 사용
    console.warn(`[MapGen] All ${maxRetries} attempts failed. Using last generated map.`);
  }

  private generatePatternBasedMap(beatTimes: number[], sections: any[], rng: () => number) {
    const { density, portalFrequency } = this.mapConfig;

    let currentTime = 0;
    let currentX = 200; // 시작 위치
    let currentM = 1.0;  // 현재 속도 배율
    let currentMini = false;
    let currentInverted = false;

    let lastPatternEndTime = 0;
    let lastPortalX = 0;
    let lastRequiredY: 'top' | 'middle' | 'bottom' = 'middle';
    let lastSpeedType: PortalType = 'speed_1';
    let lastPatternType: string | undefined = undefined;

    // 모든 이벤트를 시간순으로 정렬
    type MapEvent = { time: number; type: 'section' | 'beat'; data: any };
    const events: MapEvent[] = [];

    if (sections) {
      sections.forEach(s => events.push({ time: s.startTime, type: 'section', data: s }));
    }
    beatTimes.forEach(t => events.push({ time: t, type: 'beat', data: t }));

    events.sort((a, b) => a.time - b.time);

    // 타임라인 시뮬레이션
    for (const event of events) {
      const dt = event.time - currentTime;
      if (dt > 0) {
        // 실제 게임 엔진과 동일한 속도 계산식 사용
        const speedMultiplier = this.getSpeedMultiplierFromType(lastSpeedType);
        currentX += dt * this.baseSpeed * speedMultiplier;
        currentTime = event.time;
      }

      if (event.type === 'section') {
        const section = event.data;
        const intensity = section.intensity || 0.5;
        if (event.time < 0.5) continue;

        // 1. 배속 포탈 결정 (난이도 반영: 난수 + 섹션 강도)
        const diff = this.mapConfig.difficulty; // 1 ~ 30
        let portalType: PortalType;

        if (diff < 8) {
          // EASY (~7): 0.5x, 1x 위주
          portalType = intensity < 0.75 ? 'speed_0.5' : 'speed_1';
        } else if (diff < 18) {
          // NORMAL (8~17): 1x, 2x 중심. 가끔 3x.
          if (intensity < 0.4) portalType = 'speed_1';
          else if (intensity < 0.85) portalType = 'speed_2';
          else portalType = 'speed_3';
        } else {
          // HARD+ (18~30): 2x, 3x, 4x 배정
          if (intensity < 0.3) portalType = 'speed_2';
          else if (intensity < 0.7) portalType = 'speed_3';
          else portalType = 'speed_4';
        }

        // 한 번에 생성할 포탈 목록 수집
        const portalTypes: PortalType[] = [];
        let portalX = currentX;

        // 1. 배속 포탈
        if (portalType !== lastSpeedType) {
          portalTypes.push(portalType);
          lastSpeedType = portalType;
        }

        // 2. 변곡점 중력반전 포탈
        if (rng() < 0.75) {
          const wantInverted = rng() > 0.5;
          if (wantInverted !== currentInverted) {
            portalTypes.push(wantInverted ? 'gravity_yellow' : 'gravity_blue');
            currentInverted = wantInverted;
          }
        }

        // 3. 미니 포탈
        if (intensity > 0.8 || (intensity > 0.6 && rng() < 0.4)) {
          portalTypes.push(!currentMini ? 'mini_pink' : 'mini_green');
          currentMini = !currentMini;
        }

        if (portalTypes.length > 0) {
          this.generatePortalWithType(portalX, portalTypes[0]!, rng, portalTypes.slice(1));
          lastPortalX = portalX;
        }
      } else {
        // 비트 이벤트: 장애물 배치
        const beatTime = event.time;
        if (beatTime < 0.4) continue;

        const speedM = this.getSpeedMultiplierFromType(lastSpeedType);

        // 속도와 미니 상태에 따른 동적 간격 스케일 + 재생성 시 증가하는 배율 적용
        let gapScale = 1.0 * this.patternGapMultiplier;
        if (currentMini) gapScale *= 1.25;
        gapScale *= Math.pow(speedM, 1.3);

        const xPos = currentX;
        // 패턴 간 최소 간격 (재생성 시 자동 확대됨)
        const minGapSeconds = (220 * gapScale) / (this.baseSpeed * speedM);

        if (beatTime < lastPatternEndTime + minGapSeconds) continue;

        const validPatterns = this.getValidPatterns(lastRequiredY, rng, lastPatternType);
        if (validPatterns.length === 0) continue;

        const pattern = validPatterns[Math.floor(rng() * validPatterns.length)]!;

        // 큰 정사각형 블록(square_block)은 포탈과 최소 900px 이상 떨어뜨림
        if (pattern.type === 'square_block') {
          const squareBuffer = 900 * speedM;
          if (Math.abs(xPos - lastPortalX) < squareBuffer) continue;
        } else {
          const portalMargin = 0.4 * this.baseSpeed * speedM;
          if (Math.abs(xPos - lastPortalX) < portalMargin) continue;
        }

        this.placePatternWithScale(pattern, xPos, speedM, currentMini, gapScale);

        lastPatternEndTime = beatTime + (pattern.width * gapScale) / (this.baseSpeed * speedM);
        lastRequiredY = pattern.requiredY;
        lastPatternType = pattern.type;

        // 정사각형 블록 뒤에는 포탈이 즉시 나오지 않도록 거리 확보
        const portalAfterMargin = pattern.type === 'square_block' ? 600 : 50;
        if (currentX - lastPortalX > 800 * speedM && rng() < portalFrequency * 2.8) {
          const gravityType: PortalType = rng() > 0.5 ? 'gravity_yellow' : 'gravity_blue';
          const pWidth = (pattern.width * gapScale);
          this.generatePortalWithType(currentX + pWidth + portalAfterMargin, gravityType, rng);
          lastPortalX = currentX + pWidth + portalAfterMargin;
        }
      }
    }

    this.totalLength = currentX + 800;
  }

  private getSpeedMultiplierFromType(type: PortalType): number {
    if (type === 'speed_0.5') return Math.sqrt(0.5);
    if (type === 'speed_1') return 1.0;
    if (type === 'speed_2') return Math.sqrt(2);
    if (type === 'speed_3') return Math.sqrt(3);
    if (type === 'speed_4') return Math.sqrt(4);
    return 1.0;
  }

  private getValidPatterns(lastPos: 'top' | 'middle' | 'bottom', rng: () => number, lastType?: string): Pattern[] {
    // 이전 위치에서 도달 가능한 패턴만 필터링
    // 웨이브는 45도로 이동하므로, 급격한 위치 변화는 제한
    const transitions: Record<string, string[]> = {
      'top': ['top', 'middle'],
      'middle': ['top', 'middle', 'bottom'],
      'bottom': ['middle', 'bottom']
    };

    const validPositions = transitions[lastPos] || ['middle'];
    let filtered = this.patterns.filter(p => validPositions.includes(p.requiredY));

    // 이전 패턴이 'corridor'였으면 이번에는 제외 (User request)
    if (lastType === 'corridor') {
      filtered = filtered.filter(p => p.type !== 'corridor');
    }

    return filtered;
  }

  private placePattern(pattern: Pattern, xPos: number) {
    const baseY = this.minY;

    for (const obs of pattern.obstacles) {
      this.obstacles.push({
        x: xPos + obs.dx,
        y: baseY + obs.dy,
        width: obs.w,
        height: obs.h,
        type: obs.type
      });
    }
  }

  /**
   * 속도/미니 상태에 따라 크기 조절된 패턴 배치
   * @param gapScale 외부에서 계산된 간격 스케일
   */
  private placePatternWithScale(pattern: Pattern, xPos: number, speed: number, isMini: boolean, gapScale: number) {
    const baseY = this.minY;
    const playH = this.maxY - this.minY;

    // 속도와 미니 상태에 따른 장애물 크기 보정
    let sizeScale = 1.0;
    if (speed > 1.2) sizeScale *= 0.85;
    if (speed < 0.8) sizeScale *= 1.15;
    if (isMini) sizeScale *= 0.75;

    for (const obs of pattern.obstacles) {
      let h = obs.h * sizeScale;
      let w = obs.w * sizeScale;
      let dy = obs.dy;

      // 천장/바닥 연결성 유지를 위한 수직 좌표 보정
      const isTopAnchored = obs.dy < playH / 2;
      if (isTopAnchored) {
        // 천장 기준 스케일링
        dy = obs.dy * sizeScale;
      } else {
        // 바닥 기준 스케일링
        const distFromBottom = playH - (obs.dy + obs.h);
        dy = playH - (distFromBottom * sizeScale) - h;
      }

      this.obstacles.push({
        x: xPos + obs.dx * gapScale,
        y: baseY + dy,
        width: w,
        height: h,
        type: obs.type,
        angle: obs.angle
      });
    }
  }

  /**
   * 지정된 타입들로 포탈 생성 (비트/섹션에 맞춤)
   * 여러 타입이 올 경우 하나의 블록 세트 안에 나란히 배치
   */
  private generatePortalWithType(xPos: number, firstType: PortalType, rng: () => number, extraTypes: PortalType[] = []) {
    const portalHeight = 100;
    const portalWidth = 50;
    const spacing = 40; // 포탈 간 간격
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
        type: type,
        activated: false
      });
    });

    // 강제 진입 블록 (전체 포탈 그룹을 감쌈)
    const portalTop = centerY - portalHeight / 2;
    const portalBottom = centerY + portalHeight / 2;

    if (portalTop > this.minY + 15) {
      this.obstacles.push({
        x: xPos - 10, y: this.minY,
        width: totalWidth + 20, height: portalTop - this.minY - 10,
        type: 'block'
      });
    }

    if (portalBottom < this.maxY - 15) {
      this.obstacles.push({
        x: xPos - 10, y: portalBottom + 10,
        width: totalWidth + 20, height: this.maxY - portalBottom - 10,
        type: 'block'
      });
    }
  }

  /**
   * 랜덤 타입으로 포탈 생성 (기존 호환)
   */
  private generatePortal(xPos: number, rng: () => number) {
    const portalTypes: PortalType[] = [
      'gravity_yellow', 'gravity_blue',
      'speed_0.5', 'speed_1', 'speed_2', 'speed_3', 'speed_4'
    ];

    const availableTypes = portalTypes.filter(t => {
      if (t === 'gravity_blue') return this.portals.some(p => p.type === 'gravity_yellow');
      return true;
    });

    const type = availableTypes[Math.floor(rng() * availableTypes.length)] || 'speed_1';
    this.generatePortalWithType(xPos, type, rng);
  }

  /**
   * 전역 AI 통과 경로 및 오토플레이 로그 생성
   */


  /**
   * 전역 AI 통과 경로 및 오토플레이 로그 생성 (시뮬레이션 기반)
   * 240프레임(약 4초) 앞을 미리 보고 생존과 중앙 유지를 최적화하는 경로를 찾습니다.
   */
  public *computeAutoplayLogGen(startX: number, startY: number): Generator<number, boolean, unknown> {
    this.autoplayLog = [];
    const dt = 1 / 60; // 60fps 시뮬레이션

    let x = startX;
    let y = startY;
    let h = false; // 현재 입력 상태 (홀딩 여부)
    let g = this.isGravityInverted;
    let sm = this.speedMultiplier;
    let m = this.isMini;
    let wa = this.waveAngle;

    const sortedObs = [...this.obstacles].sort((a, b) => a.x - b.x);
    const sortedPortals = [...this.portals].sort((a, b) => a.x - b.x);
    let pIdx = 0;

    // 내부 도우미: 충돌 체크
    const checkCollision = (testX: number, testY: number, size: number): boolean => {
      if (testY < this.minY + size || testY > this.maxY - size) return true;
      for (let i = 0; i < sortedObs.length; i++) {
        const obs = sortedObs[i]!;
        if (obs.x + obs.width < testX - 50) continue;
        if (obs.x > testX + size + 100) break;
        if (this.checkObstacleCollision(obs, testX, testY, size)) return true;
      }
      return false;
    };

    // 내부 도우미: 미래 N프레임 시뮬레이션 (점수 반환)
    const simulateFuture = (startX: number, startY: number, startG: boolean, startSM: number, startM: boolean, startWA: number, initialHold: boolean, frames: number): number => {
      let sx = startX, sy = startY, sg = startG, ssm = startSM, swa = startWA, smini = startM;
      let sh = initialHold;
      let survived = 0;
      let totalCenterScore = 0;
      let spIdx = 0;

      // 현재 포탈 시점부터 시작
      while (spIdx < sortedPortals.length && sortedPortals[spIdx]!.x + sortedPortals[spIdx]!.width < sx) spIdx++;

      for (let i = 0; i < frames; i++) {
        // 포탈 체크
        for (let j = spIdx; j < sortedPortals.length; j++) {
          const p = sortedPortals[j]!;
          if (p.x > sx + 20) break;
          if (sx >= p.x && sx <= p.x + p.width && sy >= p.y && sy <= p.y + p.height) {
            if (p.type === 'gravity_yellow') sg = true;
            if (p.type === 'gravity_blue') sg = false;
            if (p.type.startsWith('speed_')) ssm = this.getSpeedMultiplierFromType(p.type as PortalType);
            if (p.type === 'mini_pink') { smini = true; swa = this.miniWaveAngle; }
            if (p.type === 'mini_green') { smini = false; swa = 45; }
          }
        }


        const speed = this.baseSpeed * ssm;
        const amp = speed * Math.tan(swa * Math.PI / 180);
        // 시뮬레이션 시에는 5% 정도 더 큰 히트박스로 보수적으로 계산
        const size = (smini ? this.miniPlayerSize : this.basePlayerSize) * 1.05;

        sx += speed * dt;
        const holdDir = sg ? 1 : -1;
        const releaseDir = sg ? -1 : 1;
        const dir = sh ? holdDir : releaseDir;
        sy += amp * dir * dt;


        // 충돌 시 시뮬레이션 종료
        if (checkCollision(sx, sy, size)) break;
        survived++;

        // 득점 요소: 타겟(포탈 또는 중앙) 유지 가중치
        let targetY = 360;
        let portalBonus = 0;
        for (let k = spIdx; k < sortedPortals.length; k++) {
          const p = sortedPortals[k]!;
          if (p.x > sx + 150) break;
          if (p.x > sx) {
            targetY = p.y + p.height / 2;
            portalBonus = 2000; // 포탈 정렬 가중치 부여
            break;
          }
        }

        totalCenterScore += (100 - Math.abs(sy - targetY)) + portalBonus;

        // 시뮬레이션 내에서의 간단한 정책: 다음 프레임에 죽지 않는 쪽 선택
        const nextYHold = sy + amp * holdDir * dt;
        const nextYRelease = sy + amp * releaseDir * dt;
        const nextX = sx + speed * dt;
        const holdDead = checkCollision(nextX, nextYHold, size);
        const releaseDead = checkCollision(nextX, nextYRelease, size);

        if (holdDead && !releaseDead) sh = false;
        else if (!holdDead && releaseDead) sh = true;
        else {
          // 둘 다 살면 타겟 Y 유지 시도
          sh = Math.abs(nextYHold - targetY) < Math.abs(nextYRelease - targetY);
        }
      }
      return survived * 10000 + totalCenterScore;
    };

    let loops = 0;
    while (x < this.totalLength) {
      loops++;
      if (loops % 30 === 0) {
        yield x / this.totalLength;
      }

      // 포탈 상태 업데이트
      while (pIdx < sortedPortals.length && x >= sortedPortals[pIdx]!.x) {
        const p = sortedPortals[pIdx]!;
        if (y >= p.y && y <= p.y + p.height) {
          if (p.type === 'gravity_yellow') g = true;
          if (p.type === 'gravity_blue') g = false;
          if (p.type.startsWith('speed_')) sm = this.getSpeedMultiplierFromType(p.type as PortalType);
          if (p.type === 'mini_pink') { m = true; wa = this.miniWaveAngle; }
          if (p.type === 'mini_green') { m = false; wa = 45; }
        }
        pIdx++;
      }

      const speed = this.baseSpeed * sm;
      const amp = speed * Math.tan(wa * Math.PI / 180);
      const size = m ? this.miniPlayerSize : this.basePlayerSize;


      // 현재 시점에서 두 가지 선택지에 대해 미래 시뮬레이션 수행
      // 300프레임(약 5초) 앞을 내다봄
      const scoreHold = simulateFuture(x, y, g, sm, m, wa, true, 300);
      const scoreRelease = simulateFuture(x, y, g, sm, m, wa, false, 300);

      // 결정
      if (scoreHold > scoreRelease) {
        h = true;
      } else if (scoreRelease > scoreHold) {
        h = false;
      } else {
        // 동점이면 타겟 유지
        const pholdDir = g ? 1 : -1;
        const preleaseDir = g ? -1 : 1;
        const nextYHold = y + amp * pholdDir * dt;
        const nextYRelease = y + amp * preleaseDir * dt;

        // 타겟 Y (중앙 또는 포탈)
        let tY = 360;
        for (let k = pIdx; k < sortedPortals.length; k++) {
          const p = sortedPortals[k]!
          if (p.x > x + 150) break;
          if (p.x > x) { tY = p.y + p.height / 2; break; }
        }
        h = Math.abs(nextYHold - tY) < Math.abs(nextYRelease - tY);
      }

      // 실제 이동
      const currentDir = h ? (g ? 1 : -1) : (g ? -1 : 1);
      const nextX = x + speed * dt;
      const nextY = y + amp * currentDir * dt;

      // 현재 프레임 로그 저장
      this.autoplayLog.push({ x: nextX, y: nextY, holding: h });

      // 상태 업데이트
      x = nextX;
      y = nextY;

      // 만약 정답을 찾지 못하고 죽었다면 여기서 중단 (로그가 잘린 채로 게임 오버 처리됨)
      if (checkCollision(x, y, size)) break;
    }

    return x >= this.totalLength;
  }

  /**
   * 동기 Wrapper (기존 호환성용 - 맵 생성 시 검증 등)
   */
  public computeAutoplayLog(startX: number = 200, startY: number = 360): boolean {
    const gen = this.computeAutoplayLogGen(startX, startY);
    let res = gen.next();
    while (!res.done) res = gen.next();
    return res.value as boolean;
  }

  /**
   * 비동기 Wrapper (UI 프로그레스 바 업데이트용)
   */
  public async computeAutoplayLogAsync(startX: number, startY: number, onProgress: (p: number) => void): Promise<boolean> {
    const gen = this.computeAutoplayLogGen(startX, startY);
    let res = gen.next();
    let lastTime = performance.now();

    while (!res.done) {
      if (typeof res.value === 'number') {
        const now = performance.now();
        // 16ms(60fps) 마다 UI 제어권 반환 및 프로그레스 업데이트
        if (now - lastTime > 16) {
          onProgress(res.value);
          await new Promise(resolve => setTimeout(resolve, 0));
          lastTime = performance.now();
        }
      }
      res = gen.next();
    }
    onProgress(1.0);
    return res.value as boolean;
  }

  private validateMap(): boolean {
    return this.computeAutoplayLog(200, 360);
  }

  private seededRandom(seed: number): () => number {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  /**
   * 프레임마다 호출되는 업데이트 함수
   */
  update(dt: number, currentTime: number) {
    if (this.isDead || !this.isPlaying) return;

    if (dt > 0.1) dt = 0.1;
    if (dt < 0) dt = 0;

    const currentSpeed = this.baseSpeed * this.speedMultiplier;
    this.waveSpeed = currentSpeed;

    // 미니 + 고속(3배속 이상) 케이스: 지그재그 강도를 극도로 상향 (User request)
    let effectiveAngle = this.waveAngle;
    if (this.isMini) {
      if (this.speedMultiplier >= 1.9) effectiveAngle = 78; // 4x speed
      else if (this.speedMultiplier >= 1.7) effectiveAngle = 72; // 3x speed
      else effectiveAngle = 60;
    }

    const angleRad = (effectiveAngle * Math.PI) / 180;
    this.waveAmplitude = currentSpeed * Math.tan(angleRad);

    this.playerX += this.waveSpeed * dt;

    // 오토플레이 로직: 사전 계산된 로그를 기반으로 입력 및 경로 시각화 (User request)
    if (this.isAutoplay && this.autoplayLog.length > 0) {
      // 시간/프레임 대신 X 좌표 기반으로 가장 가까운 로그 찾기
      const targetX = this.playerX;
      let foundEntry = null;

      // 최적화: 이전에 찾았던 인덱스부터 검색
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

        // 부드러운 트레일을 위해 X 좌표 기반 선형 보간 (Linear Interpolation) 적용
        const prevEntry = this.lastAutoplayIndex > 0 ? this.autoplayLog[this.lastAutoplayIndex - 1] : null;
        if (prevEntry) {
          const ratio = (targetX - prevEntry.x) / (foundEntry.x - prevEntry.x);
          this.playerY = prevEntry.y + (foundEntry.y - prevEntry.y) * Math.max(0, Math.min(1, ratio));
        } else {
          this.playerY = foundEntry.y;
        }

        // 지그재그 경로 시각화 업데이트
        const visualPortion = this.autoplayLog.slice(this.lastAutoplayIndex, this.lastAutoplayIndex + 300);
        this.aiPredictedPath = visualPortion.map(p => ({ x: p.x, y: p.y }));
      }
    } else {
      this.aiPredictedPath = [];
      // 일반 플레이어: 물리 엔진으로 Y 좌표 계산
      const direction = this.isHolding ? -1 : 1;
      const gravityDirection = this.isGravityInverted ? -direction : direction;
      this.playerY += this.waveAmplitude * gravityDirection * dt;
    }

    if (this.playerY < this.minY + this.playerSize) {
      this.playerY = this.minY + this.playerSize;
      this.die('천장에 충돌!');
      return;
    }
    if (this.playerY > this.maxY - this.playerSize) {
      this.playerY = this.maxY - this.playerSize;
      this.die('바닥에 충돌!');
      return;
    }

    this.cameraX = this.playerX - 280;
    this.progress = Math.min(100, (this.playerX / this.totalLength) * 100);
    this.score = Math.floor(this.progress * 10);

    this.trail.push({ x: this.playerX, y: this.playerY, time: Date.now() });
    if (this.trail.length > 80) this.trail.shift();  // 더 긴 트레일

    this.updateParticles(dt);
    this.checkPortalCollisions();
    this.checkCollisions();

    if (this.playerX >= this.totalLength) {
      this.isPlaying = false;
    }
  }

  private checkPortalCollisions() {
    for (const portal of this.portals) {
      if (portal.activated) continue;
      if (portal.x + portal.width < this.playerX - 50) continue;
      if (portal.x > this.playerX + 100) break;

      if (this.playerX + this.playerSize > portal.x &&
        this.playerX - this.playerSize < portal.x + portal.width &&
        this.playerY + this.playerSize > portal.y &&
        this.playerY - this.playerSize < portal.y + portal.height) {

        portal.activated = true;
        this.activatePortal(portal.type);
        this.spawnPortalParticles(portal);
      }
    }
  }

  private activatePortal(type: PortalType) {
    switch (type) {
      case 'gravity_yellow': this.isGravityInverted = true; break;
      case 'gravity_blue': this.isGravityInverted = false; break;
      case 'speed_0.5':
      case 'speed_1':
      case 'speed_2':
      case 'speed_3':
      case 'speed_4':
        this.speedMultiplier = this.getSpeedMultiplierFromType(type);
        break;
      case 'mini_pink':
        this.isMini = true;
        this.playerSize = this.miniPlayerSize;
        this.waveAngle = this.miniWaveAngle;
        break;
      case 'mini_green':
        this.isMini = false;
        this.playerSize = this.basePlayerSize;
        this.waveAngle = 45;
        break;
    }
  }

  private spawnPortalParticles(portal: Portal) {
    const color = this.getPortalColor(portal.type);
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10;
      const speed = 50 + Math.random() * 60;
      this.particles.push({
        x: portal.x + portal.width / 2,
        y: portal.y + portal.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.3,
        color: color
      });
    }
  }

  getPortalColor(type: PortalType): string {
    switch (type) {
      case 'gravity_yellow': return '#ffff00';
      case 'gravity_blue': return '#4488ff';
      case 'speed_0.5': return '#ff8800';
      case 'speed_1': return '#4488ff';
      case 'speed_2': return '#44ff44';
      case 'speed_3': return '#ff44ff';
      case 'speed_4': return '#ff4444';
      case 'mini_pink': return '#ff66cc';  // 분홍색 뿨족뿨족
      case 'mini_green': return '#66ff66';  // 초록색 뿨족뿨족
      default: return '#ffffff';
    }
  }

  getPortalSymbol(type: PortalType): string {
    switch (type) {
      case 'gravity_yellow': return '⟲';
      case 'gravity_blue': return '⟳';
      case 'speed_0.5': return '<';
      case 'speed_1': return '>';
      case 'speed_2': return '>>';
      case 'speed_3': return '>>>';
      case 'speed_4': return '>>>>';
      case 'mini_pink': return '◆';  // 작은 다이아몬드
      case 'mini_green': return '◇';  // 빈 다이아몬드
      default: return '?';
    }
  }

  private updateParticles(dt: number) {
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
  private getObstacleYRangeAt(obs: Obstacle, x: number): { top: number, bottom: number } | null {
    if (x < obs.x || x > obs.x + obs.width) return null;

    if (obs.type === 'block') {
      if (obs.angle) {
        // 기울어진 블록: 4개의 모서리를 회전시켜 X가 지나는 선분과의 교점 탐색
        const angleRad = (obs.angle * Math.PI) / 180;
        const cx = obs.x + obs.width / 2;
        const cy = obs.y + obs.height / 2;
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);

        const hw = obs.width / 2;
        const hh = obs.height / 2;
        const corners = [
          { dx: -hw, dy: -hh }, { dx: hw, dy: -hh },
          { dx: hw, dy: hh }, { dx: -hw, dy: hh }
        ].map(p => ({
          x: cx + p.dx * cos - p.dy * sin,
          y: cy + p.dx * sin + p.dy * cos
        }));

        let minY = Infinity, maxY = -Infinity;
        let intersects = false;

        for (let i = 0; i < 4; i++) {
          const p1 = corners[i]!, p2 = corners[(i + 1) % 4]!;
          if ((p1.x <= x && x <= p2.x) || (p2.x <= x && x <= p1.x)) {
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
      return { top: obs.y, bottom: obs.y + obs.height };
    }

    if (obs.type === 'spike' || obs.type === 'mini_spike') {
      const isBottomSpike = obs.y > 330;
      const centerX = obs.x + obs.width / 2;
      let tipY;
      if (x <= centerX) {
        const t = (x - obs.x) / (centerX - obs.x);
        tipY = isBottomSpike ? (obs.y + obs.height) - t * obs.height : obs.y + t * obs.height;
      } else {
        const t = (x - centerX) / (obs.x + obs.width - centerX);
        tipY = isBottomSpike ? obs.y + (1 - t) * 0 + t * obs.height : (obs.y + obs.height) - (1 - t) * 0 - t * obs.height;
        // 위 식 정리:
        tipY = isBottomSpike ? obs.y + t * obs.height : (obs.y + obs.height) - t * obs.height;
      }

      if (isBottomSpike) return { top: tipY, bottom: obs.y + obs.height };
      return { top: obs.y, bottom: tipY };
    }

    return { top: obs.y, bottom: obs.y + obs.height };
  }

  private checkCollisions() {
    for (const obs of this.obstacles) {
      if (obs.x + obs.width < this.playerX - 80) continue;
      if (obs.x > this.playerX + 100) break;

      if (this.checkObstacleCollision(obs, this.playerX, this.playerY, this.playerSize)) {
        this.die('장애물과 충돌!');
        this.spawnDeathParticles();
        return;
      }
    }
  }

  /**
   * 세밀한 충돌 체크 (가시는 세모, 기울어진 블록은 OBB 적용)
   */
  private checkObstacleCollision(obs: Obstacle, px: number, py: number, pSize: number): boolean {
    const isRotated = obs.angle !== undefined && obs.angle !== 0;

    // 1단계: 기본 AABB 체크 (기울어진 경우 여유를 둠)
    const margin = isRotated ? Math.max(obs.width, obs.height) : 0;
    if (px + pSize <= obs.x - margin || px - pSize >= obs.x + obs.width + margin ||
      py + pSize <= obs.y - margin || py - pSize >= obs.y + obs.height + margin) {
      return false;
    }

    // 플레이어의 점들
    const points = [
      { x: px - pSize, y: py - pSize },
      { x: px + pSize, y: py - pSize },
      { x: px - pSize, y: py + pSize },
      { x: px + pSize, y: py + pSize },
      { x: px, y: py }
    ];

    // 2단계: 기울어진 블록 (Point-in-Rotated-Rect)
    if (isRotated && obs.type === 'block') {
      for (const p of points) {
        if (this.isPointInRotatedRect(p.x, p.y, obs)) return true;
      }
      return false;
    }

    // 4단계: 톱니(Saw) 원형 히트박스 체크 (더 정교하게)
    if (obs.type === 'saw') {
      const centerX = obs.x + obs.width / 2;
      const centerY = obs.y + obs.height / 2;
      const radius = (obs.width / 2) * 0.9; // 시각적 원에 더 근접하도록 90% 크기 사용

      // 원과 사각형(플레이어) 충돌: 플레이어의 5개 점 체크
      for (const p of points) {
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        if (dx * dx + dy * dy < radius * radius) return true;
      }
      return false;
    }

    // 3단계: 가시(Spike) 세모 체크
    if (obs.type === 'spike' || obs.type === 'mini_spike') {
      const isBottomSpike = obs.y > 300;
      const centerX = obs.x + obs.width / 2;

      if (isBottomSpike) {
        for (const p of points) {
          if (this.isPointInTriangle(p.x, p.y,
            obs.x, obs.y + obs.height,
            centerX, obs.y,
            obs.x + obs.width, obs.y + obs.height)) return true;
        }
      } else {
        for (const p of points) {
          if (this.isPointInTriangle(p.x, p.y,
            obs.x, obs.y,
            centerX, obs.y + obs.height,
            obs.x + obs.width, obs.y)) return true;
        }
      }
      return false;
    }

    // 일반 블록은 AABB만으로 체크 (isRotated가 false인 경우)
    return px + pSize > obs.x && px - pSize < obs.x + obs.width &&
      py + pSize > obs.y && py - pSize < obs.y + obs.height;
  }

  private isPointInRotatedRect(px: number, py: number, obs: Obstacle): boolean {
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

  private isPointInTriangle(px: number, py: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
    const area = Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0);
    const area1 = Math.abs((px * (y1 - y2) + x1 * (y2 - py) + x2 * (py - y1)) / 2.0);
    const area2 = Math.abs((px * (y2 - y3) + x2 * (y3 - py) + x3 * (py - y2)) / 2.0);
    const area3 = Math.abs((px * (y3 - y1) + x3 * (y1 - py) + x1 * (py - y3)) / 2.0);
    return Math.abs(area - (area1 + area2 + area3)) < 0.1;
  }

  private spawnDeathParticles() {
    const colors = ['#ff4444', '#ff8844', '#ffaa00', '#ffffff'];
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15;
      const speed = 100 + Math.random() * 150;
      this.particles.push({
        x: this.playerX,
        y: this.playerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)] || '#ffffff'
      });
    }
  }

  private die(reason: string) {
    this.isDead = true;
    this.failReason = reason;
    this.isPlaying = false;
    this.showHitboxes = true;  // 히트박스 표시
    this.isAutoplay = false;   // 주석: 죽으면 오토플레이(튜토리얼) 해제
  }

  setHolding(holding: boolean) {
    this.isHolding = holding;
  }

  getProgress(): number {
    return Math.floor(this.progress);
  }

  getState(): GameState {
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
