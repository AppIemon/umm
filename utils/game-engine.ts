/**
 * Ultra Music Mania - Wave Mode Game Engine
 * 패턴 기반 맵 생성 시스템
 */

export type ObstacleType = 'spike' | 'block' | 'saw' | 'mini_spike' | 'laser' | 'spike_ball' | 'v_laser' | 'mine' | 'orb';
export type PortalType = 'gravity_yellow' | 'gravity_blue' | 'speed_0.25' | 'speed_0.5' | 'speed_1' | 'speed_2' | 'speed_3' | 'speed_4' | 'mini_pink' | 'mini_green';

export interface ObstacleMovement {
  type: 'updown' | 'rotate';
  range: number;
  speed: number;
  phase: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  angle?: number; // 기울기 각도 (도)
  movement?: ObstacleMovement;
  initialY?: number; // 움직임의 기준점
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
  obstacles: { dx: number; dy: number; w: number; h: number; type: ObstacleType; angle?: number; movement?: ObstacleMovement }[];
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
  miniPlayerSize: number = 12;  // 미니 모드 히트박스 (일반과 동일)

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
  // Validation feedback
  validationFailureInfo: { x: number, y: number, nearObstacles: Obstacle[] } | null = null;

  trackDuration: number = 0;

  // Visual effects
  trail: { x: number; y: number; time: number }[] = [];
  particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

  // AI state persistence
  aiStateTimer: number = 0; // 현재 입력을 유지한 시간 (초)
  aiPredictedPath: { x: number; y: number }[] = [];

  constructor(config?: Partial<MapConfig>) {
    if (config) {
      this.mapConfig = { ...this.mapConfig, ...config };
    }
    this.reset();
    this.initPatterns();
  }

  /**
   * 100개의 미리 정의된 패턴 초기화 (난이도 반영)
   */
  private initPatterns() {
    this.patterns = [];
    const playH = this.maxY - this.minY;
    const diff = this.mapConfig.difficulty;

    // 물리적 한계치 설정 (플레이어 크기의 최소 4.0배는 되어야 통과 가능)
    const MIN_GAP = this.basePlayerSize * 4.0;

    // 난이도별 격차: Difficulties are 1~30
    // Easy (1~7): 튜토리얼 수준 (2.5 ~ 1.8)
    // Normal (8~15): 적당함 (1.3 ~ 0.8)
    // Hard (16~23): 빡빡함 (0.8 ~ 0.45)
    // Impossible (24~30): 극한 (0.45 ~ 0.15)

    let gapMultiplier = 1.0;
    if (diff < 8) {
      // Easy: 2.5 -> 1.8
      gapMultiplier = 2.5 - ((diff - 1) / 7) * 0.7;
    } else if (diff < 16) {
      // Normal: 1.3 -> 0.8
      gapMultiplier = 1.3 - ((diff - 8) / 8) * 0.5;
    } else if (diff < 24) {
      // Hard: 0.8 -> 0.45
      gapMultiplier = 0.8 - ((diff - 16) / 8) * 0.35;
    } else {
      // Impossible: 0.45 -> 0.15
      gapMultiplier = 0.45 - ((diff - 24) / 7) * 0.3;
    }

    // 블록 간격 배수 (튜토리얼 수준은 매우 넓게)
    let blockGapFactor = 1.0;
    if (diff < 8) blockGapFactor = 4.0; // Easy (Tutorial level)
    else if (diff < 16) blockGapFactor = 1.5; // Normal
    else if (diff < 24) blockGapFactor = 1.2; // Hard
    else blockGapFactor = 1.0; // Impossible
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
      const gapSize = Math.max(MIN_GAP, baseGap * gapMultiplier);
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
      const gapH = Math.max(MIN_GAP, baseGapH * gapMultiplier);
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

    // 패턴 101-110: 레이저 (중앙 또는 위아래)
    for (let i = 0; i < 10; i++) {
      const h = 15;
      const w = 200;
      const positions = ['top', 'middle', 'bottom'] as const;
      const pos = positions[i % 3]!;
      let dy = playH / 2 - h / 2;
      if (pos === 'top') dy = 60;
      if (pos === 'bottom') dy = playH - 60 - h;

      this.patterns.push({
        obstacles: [{ dx: 0, dy: dy, w: w, h: h, type: 'laser' }],
        requiredY: pos === 'top' ? 'bottom' : pos === 'bottom' ? 'top' : (i % 2 === 0 ? 'top' : 'bottom'),
        width: w + 50,
        type: 'laser_pattern'
      });
    }

    // 패턴 111-120: 움직이는 톱니/스파이크볼
    for (let i = 0; i < 10; i++) {
      const size = 60;
      const type = i % 2 === 0 ? 'saw' : 'spike_ball';
      const dy = playH / 2 - size / 2;

      this.patterns.push({
        obstacles: [{
          dx: 0, dy: dy, w: size, h: size, type: type as ObstacleType,
          movement: {
            type: 'updown',
            range: 100 + i * 10,
            speed: 1 + i * 0.25,
            phase: i * Math.PI / 4
          }
        }],
        requiredY: 'middle',
        width: 100,
        type: 'moving_hazard'
      });
    }

    // 패턴 121-130: 스파이크 볼 밭
    for (let i = 0; i < 10; i++) {
      const count = 3 + Math.floor(i / 3);
      const obs: Pattern['obstacles'] = [];
      for (let j = 0; j < count; j++) {
        const dy = 50 + (j * 120) % (playH - 100);
        obs.push({ dx: j * 80, dy: dy, w: 40, h: 40, type: 'spike_ball' });
      }
      this.patterns.push({
        obstacles: obs,
        requiredY: 'middle',
        width: count * 80,
        type: 'spike_ball_field'
      });
    }

    // 패턴 131-140: 세로 레이저 (Vertical Lasers)
    for (let i = 0; i < 10; i++) {
      const h = playH;
      const w = 15;
      const xOffset = 0;

      // 상단/하단 중 하나를 비우거나 중앙을 통과하게 함
      const gapY = 100 + (i * 100) % (playH - 200);
      const gapH = 150;

      this.patterns.push({
        obstacles: [
          { dx: xOffset, dy: 0, w: w, h: gapY, type: 'v_laser' },
          { dx: xOffset, dy: gapY + gapH, w: w, h: playH - (gapY + gapH), type: 'v_laser' }
        ],
        requiredY: gapY < playH / 3 ? 'top' : gapY > playH * 2 / 3 - gapH ? 'bottom' : 'middle',
        width: 100,
        type: 'vertical_laser_pattern'
      });
    }

    // NEW PATTERNS for variety

    // 패턴 141-150: 마인 필드 (Mines) - 둥둥 떠있는 작은 지뢰들
    for (let i = 0; i < 10; i++) {
      const count = 2 + Math.floor(i / 2);
      const obs: Pattern['obstacles'] = [];

      for (let j = 0; j < count; j++) {
        const dy = 100 + Math.random() * (playH - 200);
        const dx = j * 60;
        obs.push({
          dx, dy, w: 30, h: 30, type: 'mine',
          movement: { type: 'updown', range: 30, speed: 2 + Math.random(), phase: j }
        });
      }

      this.patterns.push({
        obstacles: obs,
        requiredY: 'middle',
        width: count * 60 + 50,
        type: 'mine_field'
      });
    }

    // 패턴 151-160: 회전하는 막대 (Spinning Bars)
    for (let i = 0; i < 10; i++) {
      const size = 120;
      const cy = playH / 2 - size / 2;
      const obs: Pattern['obstacles'] = [];

      obs.push({
        dx: 0, dy: cy, w: 200, h: 30, type: 'block',
        angle: 0,
        movement: { type: 'rotate', range: 360, speed: 1.5 + i * 0.1, phase: 0 }
      });

      this.patterns.push({
        obstacles: obs,
        requiredY: i % 2 === 0 ? 'top' : 'bottom',
        width: 250,
        type: 'spinning_bar'
      });
    }

    // 패턴 161-170: 오브와 가시의 조화
    for (let i = 0; i < 10; i++) {
      const obs: Pattern['obstacles'] = [];
      // 중앙 오브
      const cy = playH / 2 - 25;
      obs.push({ dx: 50, dy: cy, w: 50, h: 50, type: 'orb' });
      // 위아래 가시
      obs.push({ dx: 50, dy: 0, w: 50, h: 60, type: 'spike' });
      obs.push({ dx: 50, dy: playH - 60, w: 50, h: 60, type: 'spike' });

      this.patterns.push({
        obstacles: obs,
        requiredY: 'middle', // 오브와 가시 사이 틈으로 지나가야 함? 
        // 사실 오브는 죽는거니까 오브 위나 아래로 지나가야 하는데 위아래 가시가 있음.
        // 오브가 작으니까(50) 틈이 있음.
        width: 150
      });
    }

    // 패턴 171-180: 풍차 (크로스 회전)
    for (let i = 0; i < 10; i++) {
      const obs: Pattern['obstacles'] = [];
      const cy = playH / 2 - 20;

      obs.push({
        dx: 0, dy: cy, w: 240, h: 40, type: 'block',
        movement: { type: 'rotate', range: 360, speed: 2, phase: 0 }
      });
      obs.push({
        dx: 0, dy: cy, w: 240, h: 40, type: 'block',
        movement: { type: 'rotate', range: 360, speed: 2, phase: Math.PI / 2 }
      });

      this.patterns.push({
        obstacles: obs,
        requiredY: 'middle',
        width: 300,
        type: 'windmill'
      });
    }

    // --- NEW SMALL PATTERNS FOR VARIETY ---

    // 패턴 181-190: 지뢰 군집 (Mine Clusters) - 작고 촘촘하게
    for (let i = 0; i < 10; i++) {
      const obs: Pattern['obstacles'] = [];
      const count = 3 + (i % 3);
      for (let j = 0; j < count; j++) {
        obs.push({
          dx: j * 40, dy: 100 + (j * 80) % (playH - 200),
          w: 25, h: 25, type: 'mine'
        });
      }
      this.patterns.push({
        obstacles: obs, requiredY: 'middle', width: count * 40, type: 'mine_cluster'
      });
    }

    // 패턴 191-200: 흩어진 오브 (Scattered Orbs)
    for (let i = 0; i < 10; i++) {
      const obs: Pattern['obstacles'] = [];
      const count = 4;
      for (let j = 0; j < count; j++) {
        obs.push({
          dx: j * 50, dy: 50 + (j * 150) % (playH - 100),
          w: 30, h: 30, type: 'orb'
        });
      }
      this.patterns.push({
        obstacles: obs, requiredY: 'middle', width: count * 50, type: 'orb_field'
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
    this.failReason = '';
    this.score = 0;
    this.progress = 0;
    this.trail = [];
    this.particles = [];
    this.obstacles = [];
    this.portals = [];
    this.isGravityInverted = false;

    this.speedMultiplier = 1.0;

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

  setMapConfig(config: Partial<MapConfig>) {
    this.mapConfig = { ...this.mapConfig, ...config };
  }

  loadMapData(mapData: any) {
    // 객체 깊은 복사 또는 상태 초기화 (재시작 시 포탈 상태 리셋)
    this.obstacles = mapData.engineObstacles.map((o: any) => ({ ...o }));
    this.portals = mapData.enginePortals.map((p: any) => ({ ...p, activated: false }));
    this.autoplayLog = [...mapData.autoplayLog];
    this.totalLength = mapData.duration * this.baseSpeed + 500;
  }

  // Autoplay data
  isAutoplay: boolean = false;
  autoplayLog: { x: number, y: number, holding: boolean }[] = [];
  private lastAutoplayIndex: number = 0;

  // 패턴 간격 배율 (재생성 시 증가)
  private patternGapMultiplier: number = 1.0;

  // BPM 및 마디 길이 (음악 동기화용)
  private bpm: number = 120;
  private measureLength: number = 2.0; // 한 마디 길이 (초)

  /**
   * patterns.
   * @param offsetAttempt 외부에서 재시도를 관리할 때 사용하는 시도 횟수 오프셋
   * @param bpm 노래의 BPM (분당 박자 수)
   * @param measureLength 한 마디 길이 (초)
   */
  generateMap(beatTimes: number[], sections: any[], duration: number, fixedSeed?: number, verify: boolean = true, offsetAttempt: number = 0, bpm: number = 120, measureLength: number = 2.0) {
    this.bpm = bpm;
    this.measureLength = measureLength;
    const seed = fixedSeed || (beatTimes.length * 777 + Math.floor(duration * 100));
    const maxRetries = verify ? 10 : 1;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const currentAttempt = attempt + offsetAttempt;
      // 시도할 때마다 간격 배율 증가 (1.0, 1.2, 1.44, 1.73, ...)
      this.patternGapMultiplier = Math.pow(1.2, currentAttempt);

      this.initPatterns();
      this.obstacles = [];
      this.portals = [];
      this.trackDuration = duration;
      this.totalLength = duration * this.baseSpeed + 500;
      this.autoplayLog = [];

      let rng = this.seededRandom(seed + currentAttempt); // 시드도 살짝 변경

      this.generatePatternBasedMap(beatTimes, sections, rng);

      // 정렬 (AI 경로 계산 전에 필요)
      this.obstacles.sort((a, b) => a.x - b.x);
      this.portals.sort((a, b) => a.x - b.x);

      // 중복 및 포함된 장애물 제거
      this.removeRedundantObstacles();

      // 검증을 건너뛰는 경우 첫 생성 결과로 종료
      if (!verify) {
        console.log(`[MapGen] Map generated quickly with seed: ${seed}`);
        return;
      }

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
    const isImp = this.mapConfig.difficulty >= 24;
    let currentX = 200; // 시작 위치
    let currentMini = false;
    let currentInverted = false;

    let lastPatternEndTime = 0;
    let lastPortalX = 0;
    let lastRequiredY: 'top' | 'middle' | 'bottom' = 'middle';
    let lastSpeedType: PortalType = 'speed_1'; // 모든 난이도에서 1배속으로 시작
    let lastPatternType: string | undefined = undefined;

    // 마디(measure) 기반 포탈 배치 타이밍 계산
    // 배속에 따라 한 마디가 차지하는 X 거리가 달라짐
    const measureTimes: number[] = [];
    const beatLength = 60 / this.bpm;
    const measureDuration = beatLength * 4; // 4/4 박자 기준

    // 첫 마디는 약간의 인트로 시간 후 시작 (0.5초 또는 첫 비트)
    const firstBeat = beatTimes.length > 0 ? Math.max(0.5, beatTimes[0]!) : 0.5;
    for (let t = firstBeat; t < this.trackDuration; t += measureDuration) {
      measureTimes.push(t);
    }

    console.log(`[MapGen] BPM: ${this.bpm}, Measure Duration: ${measureDuration.toFixed(3)}s, Total Measures: ${measureTimes.length}`);

    // 모든 이벤트를 시간순으로 정렬
    type MapEvent = { time: number; type: 'measure' | 'beat'; data: any };
    const events: MapEvent[] = [];

    // 마디 타이밍에 포탈 배치 이벤트 추가
    measureTimes.forEach((t, idx) => {
      // 섹션 정보에서 해당 시간대의 intensity 찾기
      const section = sections?.find(s => t >= s.startTime && t < s.endTime);
      events.push({
        time: t,
        type: 'measure',
        data: {
          measureIndex: idx,
          intensity: section?.intensity || 0.5
        }
      });
    });

    // 비트 타이밍에 장애물 배치 이벤트 추가
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

      if (event.type === 'measure') {
        const measureData = event.data;
        const intensity = measureData.intensity || 0.5;
        if (event.time < 0.5) continue;

        // 1. 배속 포탈 결정 (난이도 반영: 난수 + 섹션 강도)
        const diff = this.mapConfig.difficulty; // 1 ~ 30
        let portalType: PortalType;

        if (diff < 8) {
          // EASY (~7): 0.5x, 1x, 2x
          // Highlight (High Intensity) -> 2x
          if (intensity < 0.4) portalType = 'speed_0.5';
          else if (intensity < 0.7) portalType = 'speed_1';
          else portalType = 'speed_2';
        } else if (diff < 16) {
          // NORMAL (8~15): 1x (Center), 2x
          // Highlight -> 2x
          if (intensity < 0.6) portalType = 'speed_1';
          else portalType = 'speed_2';
        } else if (diff < 24) {
          // HARD (16~23): 0.5x (Narrow), 2x (Center), 3x
          // Highlight -> 3x (or 2x)
          if (intensity < 0.3) portalType = 'speed_0.5';
          else if (intensity < 0.65) portalType = 'speed_2'; // Normal
          else portalType = 'speed_3'; // Highlight
        } else {
          // IMPOSSIBLE (24+): Chaos + Speed
          // Highlight -> 4x
          const r = rng();
          // If it's a highlight (intensity > 0.8), almost always 4x
          if (intensity > 0.8) {
            portalType = 'speed_4';
          } else {
            // Random mixed speeds for non-highlight
            if (r < 0.15) portalType = 'speed_3';
            else if (r < 0.2) portalType = 'speed_2';
            else portalType = 'speed_4';
          }
        }

        // 강제 4배속 유지 (Impossible) -> Removed. 위 로직에서 처리.

        // 한 번에 생성할 포탈 목록 수집
        const portalTypes: PortalType[] = [];
        let portalX = currentX;

        // 1. 배속 포탈
        // 첫 포탈이거나 속도가 변할 때 포탈 생성
        if (portalType !== lastSpeedType || lastPortalX === 0) {
          portalTypes.push(portalType);
          lastSpeedType = portalType;
        }

        // 2. 변곡점 중력반전 포탈 (EASY 모드: diff 3 이상부터 등장, 낮은 확률)
        // Impossible 모드는 90% 확률로 중력 반전을 시도하여 혼란을 줌
        const gravityChance = diff >= 24 ? 0.9 : (diff < 8 ? 0.35 : 0.75);
        if (rng() < gravityChance && diff >= 3) { // diff >= 3 부터 중력 반전 허용
          const wantInverted = rng() > 0.5;
          if (wantInverted !== currentInverted) {
            portalTypes.push(wantInverted ? 'gravity_yellow' : 'gravity_blue');
            currentInverted = wantInverted;
          }
        }

        // 3. 미니 포탈 (난이도 2부터 등장)
        // Impossible 모드는 미니 모드를 매우 적극적으로 사용
        const miniThreshold = diff >= 24 ? 0.3 : 0.8; // 30% 확률 이상이면 미니 적용 (Highly frequent in Impossible)
        if (this.mapConfig.difficulty >= 2) {
          if (diff >= 24) {
            // Impossible: Random chaos
            if (rng() > 0.4) { // 60% chance to toggle
              portalTypes.push(!currentMini ? 'mini_pink' : 'mini_green');
              currentMini = !currentMini;
            }
          } else {
            // Normal logic
            if (intensity > miniThreshold || (intensity > 0.6 && rng() < 0.4)) {
              portalTypes.push(!currentMini ? 'mini_pink' : 'mini_green');
              currentMini = !currentMini;
            }
          }
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

        // 난이도별 장애물 간격 스케일 (더 공격적으로 조정)
        // EASY(1~7): 넓은 간격, IMPOSSIBLE(24+): 매우 좁은 간격
        const diff = Math.max(1, this.mapConfig.difficulty);
        let gapScale: number;

        if (diff < 8) {
          // EASY: 튜토리얼 수준의 매우 넓은 간격 (1.5 ~ 1.0)
          gapScale = 1.5 - ((diff - 1) / 7) * 0.5;
        } else if (diff < 16) {
          // NORMAL: 적당한 간격 (0.65 ~ 0.45)
          gapScale = 0.65 - ((diff - 8) / 8) * 0.2;
        } else if (diff < 24) {
          // HARD: 빡빡한 간격 (0.45 ~ 0.25)
          gapScale = 0.45 - ((diff - 16) / 8) * 0.2;
        } else {
          // IMPOSSIBLE: 극한이나 이전보다 완화 (0.25 ~ 0.12)
          gapScale = 0.25 - ((diff - 24) / 6) * 0.13;
        }

        gapScale *= this.patternGapMultiplier;

        // Speed compensation (고속에서는 간격 살짝 넓힘)
        gapScale *= Math.pow(speedM, 0.6);

        // GLOBAL DENSITY ADJUSTMENT (Reduced from previous 0.33)
        gapScale *= 0.8;

        // --- Difficulty Specific Adjustments ---

        // Hard/Impossible: 0.5x 배속에서 장애물 밀도 완화
        if (diff >= 16 && lastSpeedType === 'speed_0.5') {
          gapScale *= 0.4; // 이전 0.16에서 0.4로 대폭 완화
        }

        // Impossible settings
        if (diff >= 24) {
          if (currentMini) {
            gapScale *= 1.4;
          } else {
            gapScale *= 0.85; // 이전 0.7에서 상향
            if (currentInverted) {
              gapScale *= 0.95;
            }
          }
        } else if (diff >= 16) {
          gapScale *= 0.95; // 이전 0.85에서 상향
          if (currentMini) gapScale *= 1.1;
        } else {
          // Normal/Easy mini scaling
          if (currentMini) gapScale *= 1.25;
        }

        const xPos = currentX;
        // 패턴 간 최소 간격 (난이도에 따라 조절)
        const baseMinGap = diff >= 24 ? 180 : (diff >= 16 ? 220 : (diff < 8 ? 600 : 280));
        const minGapSeconds = (baseMinGap * gapScale) / (this.baseSpeed * speedM);

        if (beatTime < lastPatternEndTime + minGapSeconds) continue;

        let validPatterns = this.getValidPatterns(lastRequiredY, rng, lastPatternType);

        // Easy 난이도에서는 복잡한 패턴(레이저, 움직이는 장애물 등) 제외
        if (diff < 8) {
          validPatterns = validPatterns.filter(p =>
            !p.type?.includes('laser') &&
            !p.type?.includes('moving') &&
            !p.type?.includes('spike_ball') &&
            !p.type?.includes('mine') &&
            !p.type?.includes('orb')
          );
        }

        if (validPatterns.length === 0) continue;

        // --- WEIGHTED PATTERN SELECTION ---
        let selectedPattern: Pattern;
        const roll = rng();

        // 20% Chance: Scattered small hazards instead of a pattern
        if (roll < 0.20) {
          const count = 2 + Math.floor(rng() * 3);
          const playH = this.maxY - this.minY;
          const types: ObstacleType[] = ['orb', 'mine', 'saw', 'mini_spike', 'spike_ball'];

          for (let j = 0; j < count; j++) {
            const type = types[Math.floor(rng() * types.length)]!;
            const dy = 50 + rng() * (playH - 100);
            const dw = 30 + rng() * 20;
            this.obstacles.push({
              x: currentX + j * 50, y: this.minY + dy,
              width: dw, height: dw, type, initialY: this.minY + dy,
              movement: { type: 'none' as any, range: 0, speed: 0, phase: 0 }
            });
          }
          lastPatternEndTime = beatTime + (count * 50) / (this.baseSpeed * speedM);
          continue;
        }

        // Weighted pick from valid patterns
        const patternsWithWeight = validPatterns.map(p => {
          let weight = 1.0;
          const type = p.type || '';
          if (type.includes('mine') || type.includes('orb') || type.includes('cluster') || type.includes('field')) weight = 4.0;
          if (type.includes('mini_spike')) weight = 2.5;
          if (type === 'square_block' || type === 'corridor') weight = 0.25; // Drastically reduce large blocks
          return { p, weight };
        });

        const totalWeight = patternsWithWeight.reduce((sum, item) => sum + item.weight, 0);
        let rWeight = rng() * totalWeight;
        selectedPattern = patternsWithWeight[0]!.p;
        for (const item of patternsWithWeight) {
          rWeight -= item.weight;
          if (rWeight <= 0) {
            selectedPattern = item.p;
            break;
          }
        }

        // --- END WEIGHTED SELECTION ---

        // 큰 정사각형 블록(square_block)은 포탈과 최소 900px 이상 떨어뜨림
        if (selectedPattern.type === 'square_block') {
          const squareBuffer = 900 * speedM;
          if (Math.abs(xPos - lastPortalX) < squareBuffer) continue;
        } else {
          const portalMargin = 0.4 * this.baseSpeed * speedM;
          if (Math.abs(xPos - lastPortalX) < portalMargin) continue;
        }

        this.placePatternWithScale(selectedPattern, xPos, speedM, currentMini, gapScale);

        lastPatternEndTime = beatTime + (selectedPattern.width * gapScale) / (this.baseSpeed * speedM);
        lastRequiredY = selectedPattern.requiredY;
        lastPatternType = selectedPattern.type;

        // 정사각형 블록 뒤에는 포탈이 즉시 나오지 않도록 거리 확보
        const portalAfterMargin = selectedPattern.type === 'square_block' ? 600 : 50;
        if (currentX - lastPortalX > 800 * speedM && rng() < portalFrequency * 2.8) {
          const gravityType: PortalType = rng() > 0.5 ? 'gravity_yellow' : 'gravity_blue';
          const pWidth = (selectedPattern.width * gapScale);
          this.generatePortalWithType(currentX + pWidth + portalAfterMargin, gravityType, rng);
          lastPortalX = currentX + pWidth + portalAfterMargin;
        }
      }
    }

    this.totalLength = currentX + 800;
  }

  private getSpeedMultiplierFromType(type: PortalType): number {
    if (type === 'speed_0.25') return Math.sqrt(0.25);
    if (type === 'speed_0.5') return Math.sqrt(0.5);
    if (type === 'speed_1') return 1.0;
    if (type === 'speed_2') return Math.sqrt(2);
    if (type === 'speed_3') return Math.sqrt(3);
    if (type === 'speed_4') return Math.sqrt(4);
    return 1.0;
  }

  private getEffectiveAngle(isMini: boolean, speedMultiplier: number): number {
    if (!isMini) return 45;
    if (speedMultiplier >= 1.9) return 78; // 4x speed
    if (speedMultiplier >= 1.7) return 72; // 3x speed
    return 60; // Default mini
  }

  private getValidPatterns(lastPos: 'top' | 'middle' | 'bottom', rng: () => number, lastType?: string): Pattern[] {
    const transitions: Record<string, string[]> = {
      'top': ['top', 'middle'],
      'middle': ['top', 'middle', 'bottom'],
      'bottom': ['middle', 'bottom']
    };

    const validPositions = transitions[lastPos] || ['middle'];
    let filtered = this.patterns.filter(p => validPositions.includes(p.requiredY));

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
        type: obs.type,
        initialY: baseY + obs.dy
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
        angle: obs.angle,
        movement: obs.movement ? { ...obs.movement } : undefined,
        initialY: baseY + dy
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
    // 플레이어 크기보다 틈새가 넉넉해야 함
    const entryMargin = this.basePlayerSize * 2.2;
    const portalTop = centerY - portalHeight / 2;
    const portalBottom = centerY + portalHeight / 2;

    if (portalTop > this.minY + entryMargin) {
      this.obstacles.push({
        x: xPos - 10, y: this.minY,
        width: totalWidth + 20, height: portalTop - this.minY - entryMargin,
        type: 'block',
        initialY: this.minY
      });
    }

    if (portalBottom < this.maxY - entryMargin) {
      this.obstacles.push({
        x: xPos - 10, y: portalBottom + entryMargin,
        width: totalWidth + 20, height: this.maxY - (portalBottom + entryMargin),
        type: 'block',
        initialY: portalBottom + entryMargin
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
    this.validationFailureInfo = null;
    const dt = 1 / 60;
    const sortedObs = [...this.obstacles].sort((a, b) => a.x - b.x);
    const sortedPortals = [...this.portals].sort((a, b) => a.x - b.x);

    interface SearchState {
      x: number; y: number; time: number; g: boolean; sm: number; m: boolean; wa: number;
      h: boolean; pIdx: number; lastSwitchTime: number; prev: SearchState | null;
    }

    const initialState: SearchState = {
      x: startX, y: startY, time: 0, g: this.isGravityInverted, sm: this.speedMultiplier,
      m: this.isMini, wa: this.waveAngle, h: false, pIdx: 0, lastSwitchTime: -1.0, prev: null
    };

    const visited = new Set<string>();
    const getVisitedKey = (s: SearchState) => {
      const xi = Math.floor(s.x / (this.baseSpeed * 0.016));
      const yi = Math.floor(s.y / 8);
      return `${xi}_${yi}_${s.g ? 1 : 0}_${s.sm}_${s.m ? 1 : 0}`;
    };

    const checkColl = (tx: number, ty: number, sz: number, tm: number, margin: number = 1.0): boolean => {
      // 바닥/천장 충돌 체크에도 마진 적용
      if (ty < this.minY + sz + margin || ty > this.maxY - sz - margin) return true;
      for (let i = 0; i < sortedObs.length; i++) {
        const o = sortedObs[i]!;
        if (o.x + o.width < tx - 50) continue;
        if (o.x > tx + 100) break;

        // 움직이는 장애물에 대해서는 추가적인 안전 마진을 최소화 (타이밍 오차 보정용 1.2px)
        const moveMargin = o.movement ? 1.2 : 0;

        // 장애물 충돌 체크에도 마진(sz + margin) 적용
        if (this.checkObstacleCollision(o, tx, ty, sz + margin + moveMargin, tm)) return true;
      }
      return false;
    };

    // Lookahead helper
    const checkSurvival = (baseState: SearchState, testH: boolean, frames: number): boolean => {
      let sx = baseState.x;
      let sy = baseState.y;
      let sg = baseState.g;
      let ssm = baseState.sm;
      let swa = baseState.wa;
      let sm = baseState.m;
      let spIdx = baseState.pIdx;
      let sTime = baseState.time;

      for (let i = 0; i < frames; i++) {
        while (spIdx < sortedPortals.length && sx >= sortedPortals[spIdx]!.x) {
          const p = sortedPortals[spIdx]!;
          if (sy >= p.y && sy <= p.y + p.height) {
            if (p.type === 'gravity_yellow') sg = true;
            if (p.type === 'gravity_blue') sg = false;
            if (p.type.startsWith('speed_')) ssm = this.getSpeedMultiplierFromType(p.type as PortalType);
            if (p.type === 'mini_pink') sm = true;
            if (p.type === 'mini_green') sm = false;
            // 속도나 미니 상태가 변하면 각도 재계산
            swa = this.getEffectiveAngle(sm, ssm);
          }
          spIdx++;
        }

        const spd = this.baseSpeed * ssm;
        const amp = spd * Math.tan(swa * Math.PI / 180);
        const sz = sm ? this.miniPlayerSize : this.basePlayerSize;

        sx += spd * dt;
        sTime += dt;
        const vy = sg ? (testH ? 1 : -1) : (testH ? -1 : 1);
        sy += amp * vy * dt;

        // 생존 확인 시에는 매우 작은 마진(0.5px)만 둠
        if (checkColl(sx, sy, sz, sTime, 0.5)) return false;
      }
      return true;
    };

    const stack: SearchState[] = [initialState];
    let maxX = startX;
    let loops = 0;
    const maxLoops = 250000;
    let bestState: SearchState | null = null;
    let furthestFailX = startX;
    let failY = startY;

    while (stack.length > 0) {
      loops++;
      const curr = stack.pop()!;
      if (curr.x > maxX) {
        maxX = curr.x;
        if (loops % 500 === 0) yield maxX / this.totalLength;
      }
      if (curr.x >= this.totalLength) { bestState = curr; break; }

      const vkey = getVisitedKey(curr);
      if (visited.has(vkey)) continue;
      visited.add(vkey);

      let nG = curr.g; let nSM = curr.sm; let nM = curr.m; let nWA = curr.wa;
      let npIdx = curr.pIdx;
      while (npIdx < sortedPortals.length && curr.x >= sortedPortals[npIdx]!.x) {
        const p = sortedPortals[npIdx]!;
        if (curr.y >= p.y && curr.y <= p.y + p.height) {
          if (p.type === 'gravity_yellow') nG = true;
          if (p.type === 'gravity_blue') nG = false;
          if (p.type.startsWith('speed_')) nSM = this.getSpeedMultiplierFromType(p.type as PortalType);
          if (p.type === 'mini_pink') nM = true;
          if (p.type === 'mini_green') nM = false;
          // 속도나 미니 상태가 변하면 각도 재계산
          nWA = this.getEffectiveAngle(nM, nSM);
        }
        npIdx++;
      }

      const spd = this.baseSpeed * nSM;
      const amp = spd * Math.tan(nWA * Math.PI / 180);
      const sz = nM ? this.miniPlayerSize : this.basePlayerSize;
      const nT = curr.time + dt;
      const nX = curr.x + spd * dt;
      const nYH = curr.y + amp * (nG ? 1 : -1) * dt;
      const nYR = curr.y + amp * (nG ? -1 : 1) * dt;

      const dH = checkColl(nX, nYH, sz, nT, 0.8); // 0.8px safety margin for immediate action
      const dR = checkColl(nX, nYR, sz, nT, 0.8);

      if (dH && dR && nX > furthestFailX) { furthestFailX = nX; failY = curr.y; }

      const prevH = curr.h;
      // Increased lookahead to 45 frames (~0.75s) for better stability.
      const lookaheadFrames = 45;

      // CPS Limiting Logic:
      // Scale interval: 0.125 / (speedMultiplier^0.7)
      const MIN_SWITCH_INTERVAL = 0.125 / Math.pow(curr.sm, 0.7);

      const timeSinceLastSwitch = curr.time - curr.lastSwitchTime;
      let isSwitchRestricted = timeSinceLastSwitch < MIN_SWITCH_INTERVAL;

      // Exception: If we are deviating from center (> 25px) and moving AWAY,
      // allow rapid switching to correct course.
      if (isSwitchRestricted) {
        const currentY = curr.y;
        const distFromCenter = Math.abs(currentY - 360);
        if (distFromCenter > 25) {
          const isGravityInv = curr.g;
          const isHolding = prevH;
          // Vy direction: 
          // Normal(g=F): Hold -> Up(-), Release -> Down(+)
          // Inverted(g=T): Hold -> Down(+), Release -> Up(-)

          const vy = isGravityInv ? (isHolding ? 1 : -1) : (isHolding ? -1 : 1);
          const movingAway = (currentY > 360 && vy > 0) || (currentY < 360 && vy < 0);

          if (movingAway) {
            isSwitchRestricted = false;
          }
        }
      }

      let preferHold = false;
      // Pass lastSwitchTime to validation state for lookahead? (Simplification: just check immediate safety)
      const isHoldSafe = !dH && checkSurvival({ ...curr, x: nX, y: nYH, time: nT, g: nG, sm: nSM, m: nM, wa: nWA, pIdx: npIdx, h: true, lastSwitchTime: prevH ? curr.lastSwitchTime : nT, prev: null }, true, lookaheadFrames);
      const isReleaseSafe = !dR && checkSurvival({ ...curr, x: nX, y: nYR, time: nT, g: nG, sm: nSM, m: nM, wa: nWA, pIdx: npIdx, h: false, lastSwitchTime: !prevH ? curr.lastSwitchTime : nT, prev: null }, false, lookaheadFrames);

      // Default preference based on safety
      // Default preference based on safety
      if (prevH) {
        if (isHoldSafe) preferHold = true;
        else preferHold = false;
      } else {
        if (isReleaseSafe) preferHold = false;
        else preferHold = true;
      }

      // If both options are safe, prefer the midpoint of the local gap
      if (isHoldSafe && isReleaseSafe) {
        // 현재 X 위치에서 모든 장애물의 Y 범위를 수집하여 '장애물 층'을 만듦
        const barriers: { top: number, bottom: number }[] = [
          { top: -Infinity, bottom: this.minY }, // 천장 위
          { top: this.maxY, bottom: Infinity }   // 바닥 아래
        ];

        for (let oi = 0; oi < sortedObs.length; oi++) {
          const o = sortedObs[oi]!;
          if (o.x + o.width < nX) continue;
          if (o.x > nX) break;

          const range = this.getObstacleYRangeAt(o, nX, nT);
          if (range) {
            barriers.push(range);
          }
        }

        // Y축 기준으로 정렬
        barriers.sort((a, b) => a.top - b.top);

        // 겹치는 barrier 병합하여 실제 '닫힌 구간'들 계산
        const merged: { top: number, bottom: number }[] = [];
        if (barriers.length > 0) {
          let current = { ...barriers[0]! };
          for (let i = 1; i < barriers.length; i++) {
            const next = barriers[i]!;
            if (next.top <= current.bottom) {
              current.bottom = Math.max(current.bottom, next.bottom);
            } else {
              merged.push(current);
              current = { ...next };
            }
          }
          merged.push(current);
        }

        // '열린 구간(Gap)'들 찾기
        const gaps: { top: number, bottom: number }[] = [];
        for (let i = 0; i < merged.length - 1; i++) {
          gaps.push({
            top: merged[i]!.bottom,
            bottom: merged[i + 1]!.top
          });
        }

        // 현재 플레이어 Y가 포함된 gap 찾기 (없으면 가장 가까운 gap)
        let targetGap = gaps[0]!;
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

        // 안전 구간의 중점
        const targetY = (targetGap.top + targetGap.bottom) / 2;
        const distH = Math.abs(nYH - targetY);
        const distR = Math.abs(nYR - targetY);

        // 중점 방향으로 이동 선호
        if (distH < distR) {
          preferHold = true;
        } else if (distR < distH) {
          preferHold = false;
        } else {
          preferHold = prevH;
        }
      }

      // 1. If currently violating CPS limit, FORCE keeping same state if safe.
      // 2. Unless keeping same state is DEATH (isHoldSafe=false for prevH=true) -> then we MUST switch (exception applied)
      if (isSwitchRestricted) {
        if (prevH && isHoldSafe) preferHold = true; // Must hold
        if (!prevH && isReleaseSafe) preferHold = false; // Must release
      }

      const nextActions = preferHold ? [true, false] : [false, true];
      // Note: `preferHold ? [true, false]` means if preferHold is true, we test Hold first.

      for (const h of nextActions) {
        if (h ? !dH : !dR) {
          // If this action is a switch:
          if (h !== prevH) {
            // Check restriction
            if (isSwitchRestricted) {
              // Only allow switch if the alternative (maintaining state) leads to death
              // We already established preference above, but let's be explicit
              const maintenanceSafe = prevH ? isHoldSafe : isReleaseSafe;
              if (maintenanceSafe) continue; // Skip this switch, it violates CPS and isn't necessary for survival
            }
          }

          // Push new state
          const newLastSwitchTime = (h !== prevH) ? nT : curr.lastSwitchTime;
          stack.push({ x: nX, y: h ? nYH : nYR, time: nT, g: nG, sm: nSM, m: nM, wa: nWA, h, pIdx: npIdx, lastSwitchTime: newLastSwitchTime, prev: curr });
        }
      }
      if (loops > maxLoops) break;
    }

    if (bestState) {
      const path: { x: number, y: number, holding: boolean }[] = [];
      let t: SearchState | null = bestState;
      while (t) { path.push({ x: t.x, y: t.y, holding: t.h }); t = t.prev; }
      this.autoplayLog = path.reverse();
      return true;
    } else {
      this.validationFailureInfo = {
        x: furthestFailX, y: failY,
        nearObstacles: sortedObs.filter(o => o.x > furthestFailX - 400 && o.x < furthestFailX + 600)
      };
      return false;
    }
  }

  public computeAutoplayLog(startX: number = 200, startY: number = 360): boolean {
    const gen = this.computeAutoplayLogGen(startX, startY);
    let res = gen.next();
    while (!res.done) res = gen.next();
    return res.value as boolean;
  }

  public async computeAutoplayLogAsync(startX: number, startY: number, onProgress: (p: number) => void): Promise<boolean> {
    const gen = this.computeAutoplayLogGen(startX, startY);
    let res = gen.next();
    let lastTime = performance.now();

    while (!res.done) {
      if (typeof res.value === 'number') {
        const now = performance.now();
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
    const effectiveAngle = this.getEffectiveAngle(this.isMini, this.speedMultiplier);

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
      this.spawnDeathParticles();
      return;
    }
    if (this.playerY > this.maxY - this.playerSize) {
      this.playerY = this.maxY - this.playerSize;
      this.die('바닥에 충돌!');
      this.spawnDeathParticles();
      return;
    }

    this.cameraX = this.playerX - 280;
    this.progress = Math.min(100, (this.playerX / this.totalLength) * 100);
    this.score = Math.floor(this.progress * 10);

    this.trail.push({ x: this.playerX, y: this.playerY, time: Date.now() });
    if (this.trail.length > 80) this.trail.shift();  // 더 긴 트레일

    this.updateParticles(dt);
    this.updateMovingObstacles(currentTime);
    this.checkPortalCollisions();
    this.checkCollisions(currentTime);

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
      case 'speed_0.25':
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
      case 'speed_0.25': return '#aa5500'; // Dark orange/brown
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
      case 'speed_0.25': return '<<';
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
  private getObstacleYRangeAt(obs: Obstacle, x: number, time?: number): { top: number, bottom: number } | null {
    if (x < obs.x || x > obs.x + obs.width) return null;

    let obsY = obs.y;
    let obsAngle = obs.angle || 0;

    if (time !== undefined && obs.movement) {
      const state = this.getObstacleStateAt(obs, time);
      obsY = state.y;
      obsAngle = state.angle;
    }

    if (obs.type === 'block') {
      if (obsAngle) {
        // 기울어진 블록: 4개의 모서리를 회전시켜 X가 지나는 선분과의 교점 탐색
        const angleRad = (obsAngle * Math.PI) / 180;
        const cx = obs.x + obs.width / 2;
        const cy = obsY + obs.height / 2;
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
      return { top: obsY, bottom: obsY + obs.height };
    }

    if (obs.type === 'spike' || obs.type === 'mini_spike') {
      const isBottomSpike = obsY > 330;
      const centerX = obs.x + obs.width / 2;
      let tipY;
      if (x <= centerX) {
        const t = (x - obs.x) / (centerX - obs.x);
        tipY = isBottomSpike ? (obsY + obs.height) - t * obs.height : obsY + t * obs.height;
      } else {
        const t = (x - centerX) / (obs.x + obs.width - centerX);
        tipY = isBottomSpike ? obsY + (1 - t) * 0 + t * obs.height : (obsY + obs.height) - (1 - t) * 0 - t * obs.height;
        // 위 식 정리:
        tipY = isBottomSpike ? obsY + t * obs.height : (obsY + obs.height) - t * obs.height;
      }

      if (isBottomSpike) return { top: tipY, bottom: obsY + obs.height };
      return { top: obsY, bottom: tipY };
    }

    return { top: obsY, bottom: obsY + obs.height };
  }

  private checkCollisions(time: number) {
    for (const obs of this.obstacles) {
      if (obs.x + obs.width < this.playerX - 80) continue;
      if (obs.x > this.playerX + 100) break;

      if (this.checkObstacleCollision(obs, this.playerX, this.playerY, this.playerSize, time)) {
        this.die('장애물과 충돌!');
        this.spawnDeathParticles();
        return;
      }
    }
  }

  /**
   * 세밀한 충돌 체크 (가시는 세모, 기울어진 블록은 OBB 적용)
   */
  private checkObstacleCollision(obs: Obstacle, px: number, py: number, pSize: number, simTime?: number): boolean {
    let obsY = obs.y;
    let obsAngle = obs.angle || 0;

    // 시뮬레이션 중이거나 움직임이 있는 경우 현재 시간 기준으로 위치 및 각도 계산
    if (simTime !== undefined && obs.movement) {
      const state = this.getObstacleStateAt(obs, simTime);
      obsY = state.y;
      obsAngle = state.angle;
    }

    const isRotated = obsAngle !== 0;

    // 1단계: 기본 AABB 체크 (기울어진 경우 여유를 둠)
    const margin = isRotated ? Math.max(obs.width, obs.height) : 0;
    if (px + pSize <= obs.x - margin || px - pSize >= obs.x + obs.width + margin ||
      py + pSize <= obsY - margin || py - pSize >= obsY + obs.height + margin) {
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
      const tempObs = { ...obs, y: obsY, angle: obsAngle };
      for (const p of points) {
        if (this.isPointInRotatedRect(p.x, p.y, tempObs)) return true;
      }
      return false;
    }

    // 4단계: 톱니(Saw), 스파이크볼, 마인, 오브 등 원형 히트박스 체크
    if (obs.type === 'saw' || obs.type === 'spike_ball' || obs.type === 'mine' || obs.type === 'orb') {
      const centerX = obs.x + obs.width / 2;
      const centerY = obsY + obs.height / 2;

      let radiusScale = 0.9;
      if (obs.type === 'spike_ball') radiusScale = 0.85;
      if (obs.type === 'mine') radiusScale = 0.9;
      if (obs.type === 'orb') radiusScale = 0.95;

      const radius = (obs.width / 2) * radiusScale;

      // 원과 사각형(플레이어) 충돌: 플레이어의 5개 점 체크
      for (const p of points) {
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        if (dx * dx + dy * dy < radius * radius) return true;
      }
      return false;
    }

    // 5단계: 레이저 (Laser) - 얇은 가로선 / v_laser - 얇은 세로선
    if (obs.type === 'laser') {
      const laserH = obs.height * 0.4;
      const centerY = obsY + obs.height / 2;
      return px + pSize > obs.x && px - pSize < obs.x + obs.width &&
        py + pSize > centerY - laserH && py - pSize < centerY + laserH;
    }
    if (obs.type === 'v_laser') {
      const laserW = obs.width * 0.4;
      const centerX = obs.x + obs.width / 2;
      return py + pSize > obsY && py - pSize < obsY + obs.height &&
        px + pSize > centerX - laserW && px - pSize < centerX + laserW;
    }

    // 3단계: 가시(Spike) 세모 체크
    if (obs.type === 'spike' || obs.type === 'mini_spike') {
      const isBottomSpike = obsY > 300;
      const centerX = obs.x + obs.width / 2;

      // Hitbox forgiveness: Shrink the triangle slightly (7px)
      // This prevents "clipping" deaths where the player visually barely touches the edge
      const padding = 7;

      if (isBottomSpike) {
        for (const p of points) {
          if (this.isPointInTriangle(p.x, p.y,
            obs.x + padding, obsY + obs.height - padding,
            centerX, obsY + padding,
            obs.x + obs.width - padding, obsY + obs.height - padding)) return true;
        }
      } else {
        for (const p of points) {
          if (this.isPointInTriangle(p.x, p.y,
            obs.x + padding, obsY + padding,
            centerX, obsY + obs.height - padding,
            obs.x + obs.width - padding, obsY + padding)) return true;
        }
      }
      return false;
    }

    // 일반 블록은 AABB만으로 체크 (isRotated가 false인 경우)
    return px + pSize > obs.x && px - pSize < obs.x + obs.width &&
      py + pSize > obsY && py - pSize < obsY + obs.height;
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

  /**
   * 장애물 중복 제거: 다른 장애물에 완전히 포함된 장애물을 삭제합니다.
   */
  private removeRedundantObstacles() {
    const toRemove = new Set<number>();
    const n = this.obstacles.length;

    for (let i = 0; i < n; i++) {
      const a = this.obstacles[i]!;
      if (a.movement) continue; // 움직이는 장애물은 일단 제외

      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const b = this.obstacles[j]!;
        if (b.movement) continue;

        // 최적화: X축 범위가 겹치지 않으면 패스
        // (단, b가 회전된 경우는 span이 달라질 수 있으므로 여유를 둠)
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

  private isObstacleContained(a: Obstacle, b: Obstacle): boolean {
    // b가 블록이나 가시일 때만 포함 가능하다고 가정 (레이저 등은 너무 얇음)
    if (b.type !== 'block' && b.type !== 'spike' && b.type !== 'mini_spike') return false;

    const corners = this.getObstacleCorners(a);
    for (const p of corners) {
      if (!this.isPointInStaticObstacle(p.x, p.y, b)) return false;
    }
    return true;
  }

  private isPointInStaticObstacle(px: number, py: number, obs: Obstacle): boolean {
    if (obs.type === 'block') {
      return this.isPointInRotatedRect(px, py, obs);
    }
    if (obs.type === 'spike' || obs.type === 'mini_spike') {
      const isBottomSpike = obs.y > 300;
      const centerX = obs.x + obs.width / 2;
      if (isBottomSpike) {
        return this.isPointInTriangle(px, py,
          obs.x, obs.y + obs.height,
          centerX, obs.y,
          obs.x + obs.width, obs.y + obs.height);
      } else {
        return this.isPointInTriangle(px, py,
          obs.x, obs.y,
          centerX, obs.y + obs.height,
          obs.x + obs.width, obs.y);
      }
    }
    return false;
  }

  private getObstacleCorners(obs: Obstacle): { x: number, y: number }[] {
    if (obs.type === 'spike' || obs.type === 'mini_spike') {
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
      const angleRad = (obs.angle * Math.PI) / 180;
      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const hw = obs.width / 2;
      const hh = obs.height / 2;
      return [
        { dx: -hw, dy: -hh }, { dx: hw, dy: -hh },
        { dx: hw, dy: hh }, { dx: -hw, dy: hh }
      ].map(p => ({
        x: cx + p.dx * cos - p.dy * sin,
        y: cy + p.dx * sin + p.dy * cos
      }));
    }

    return [
      { x: obs.x, y: obs.y },
      { x: obs.x + obs.width, y: obs.y },
      { x: obs.x, y: obs.y + obs.height },
      { x: obs.x + obs.width, y: obs.y + obs.height }
    ];
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

  public getObstacleStateAt(obs: Obstacle, time: number): { y: number, angle: number } {
    let y = obs.y;
    let angle = obs.angle || 0;

    if (obs.movement) {
      if (obs.movement.type === 'updown' && obs.initialY !== undefined) {
        const { range, speed, phase } = obs.movement;
        y = obs.initialY + Math.sin(time * speed + phase) * range;
      } else if (obs.movement.type === 'rotate') {
        const { speed, phase } = obs.movement;
        const rad = time * speed + phase;
        angle = (rad * 180 / Math.PI) % 360;
      }
    }
    return { y, angle };
  }

  private updateMovingObstacles(time: number) {
    for (const obs of this.obstacles) {
      if (obs.movement) {
        const state = this.getObstacleStateAt(obs, time);
        obs.y = state.y;
        if (obs.movement.type === 'rotate') {
          obs.angle = state.angle;
        }
      }
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
