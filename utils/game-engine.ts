/**
 * Ultra Music Mania - Wave Mode Game Engine
 * 패턴 기반 맵 생성 시스템
 */

import { MapGenerator, type MapObject } from './MapGenerator';

import type { ObstacleType, PortalType, ObstacleMovement } from './types';

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  angle?: number; // 기울기 각도 (도)
  movement?: ObstacleMovement;
  initialY?: number; // 움직임의 기준점
  moveY?: { range: number; speed: number }; // 수직 이동 설정

  // Advanced Obstacle Properties
  customData?: {
    orbitCount?: number;     // Number of moons (for standalone planet)
    orbitSpeed?: number;     // Orbit speed
    orbitDistance?: number;  // Orbit distance
    pulseSpeed?: number;     // Pulsation speed (for mines)
    pulseAmount?: number;    // Pulsation size variance
    nestedOrbit?: boolean;   // Legacy nested orbit flag
    // Falling Spike State
    isFalling?: boolean;
    vy?: number;
  };
  children?: Obstacle[];     // Attached objects (e.g. Planets attached to Star)
  parentId?: string;         // Helper to track attachment in editor
}

export interface Portal {
  x: number;
  y: number;
  width: number;
  height: number;
  type: PortalType;
  angle?: number;
  activated: boolean;
  linkId?: number; // For teleport portals
}

export interface Boss {
  active: boolean;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  state: 'idle' | 'attack_laser' | 'attack_projectile' | 'stunned';
  attackTimer: number;
  projectiles: { x: number; y: number; vx: number; vy: number; type: 'missile' | 'beam' }[];
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

export interface StateEvent {
  time: number;
  speedType: PortalType;
  isInverted: boolean;
  isMini: boolean;
}

export interface BeatAction {
  time: number;
  action: 'click' | 'release';
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

  // Get dynamic base speed based on difficulty
  getDynamicBaseSpeed(): number {
    const diff = this.mapConfig.difficulty;
    if (diff <= 2) return 260; // Ultra Slow
    if (diff <= 7) return 300; // Slow
    if (diff <= 12) return 330; // Normal (Slightly slower)
    return 350; // Hard/Impossible
  }

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

  beatTimes: number[] = []; // Store beat times for effect synchronization

  // Boss System
  boss: Boss = {
    active: false,
    x: 0,
    y: 0,
    health: 100,
    maxHealth: 100,
    state: 'idle',
    attackTimer: 0,
    projectiles: []
  };

  // Generation State Persistence
  lastStateEvents: StateEvent[] = [];
  lastBeatActions: BeatAction[] = [];

  // Measure Highlights
  lastMeasureIndex: number = -1;
  isMeasureHighlight: boolean = false;

  public onPortalActivation: ((type: PortalType) => void) | null = null;

  constructor(config?: Partial<MapConfig>) {
    if (config) {
      this.mapConfig = { ...this.mapConfig, ...config };
    }
    this.baseSpeed = this.getDynamicBaseSpeed();
    this.reset();
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

  setMapConfig(config: Partial<MapConfig>) {
    this.mapConfig = { ...this.mapConfig, ...config };
  }

  loadMapData(mapData: any) {
    // 객체 깊은 복사 또는 상태 초기화 (재시작 시 포탈 상태 리셋)
    this.obstacles = mapData.engineObstacles.map((o: any) => ({ ...o }));
    this.portals = mapData.enginePortals.map((p: any) => ({ ...p, activated: false }));
    this.autoplayLog = mapData.autoplayLog ? [...mapData.autoplayLog] : [];
    this.totalLength = mapData.duration * this.baseSpeed + 500;

    // 오토플레이 인덱스 초기화 (중요!)
    this.lastAutoplayIndex = 0;

    console.log(`[loadMapData] Loaded ${this.obstacles.length} obstacles, ${this.portals.length} portals, ${this.autoplayLog.length} autoplay points`);
  }

  // Autoplay data
  isAutoplay: boolean = false;
  autoplayLog: { x: number, y: number, holding: boolean, time: number }[] = [];
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
  /**
   * 새로운 맵 생성 로직: 동선 우선 생성 방식
   * 1. 비트 타이밍에 맞춰 클릭/릴리즈를 번갈아가며 동선(autoplayLog)을 먼저 계산
   * 2. 마디마다 포탈을 배치  
   * 3. 동선을 따라가다가 동선에서 벗어나면 충돌하도록 장애물 배치
   * 4. AI 경로 검증 불필요 - 동선이 이미 안전하게 설계됨
   * @param resumeOptions (Optional) 이전 생성 결과에서 특정 지점까지 유지하고 그 이후부터 재생성
   */
  generateMap(beatTimes: number[], sections: any[], duration: number, fixedSeed?: number, verify: boolean = true, offsetAttempt: number = 0, bpm: number = 120, measureLength: number = 2.0, volumeProfile?: number[], resumeOptions?: {
    time: number;
    stateEvents: StateEvent[];
    beatActions: BeatAction[];
    obstacles: Obstacle[];
    portals: Portal[];
  }) {
    this.bpm = bpm;
    this.measureLength = measureLength;
    const seed = fixedSeed || (beatTimes.length * 777 + Math.floor(duration * 100));

    // 1. Clear current state before generation
    this.obstacles = [];
    this.portals = [];

    this.beatTimes = beatTimes || [];
    this.trackDuration = duration;
    this.totalLength = duration * this.baseSpeed + 2000;
    this.autoplayLog = [];

    const generator = new MapGenerator();
    const difficulty = this.mapConfig.difficulty;

    console.log(`[MapGen] Procedural Generation with seed: ${seed}, Difficulty: ${difficulty}`);

    const rng = this.seededRandom(seed + offsetAttempt);

    // 2. Generate path (autoplayLog) based on beats
    // generatePathBasedMap returns state events and populates this.portals with portals for the NEW part
    const stateEvents = this.generatePathBasedMap(beatTimes, sections, rng, volumeProfile, resumeOptions);
    this.lastStateEvents = stateEvents;

    // Calculate Resume X if applicable
    let startX = 0;
    if (resumeOptions) {
      const point = this.autoplayLog.find(p => p.time >= resumeOptions.time);
      if (point) startX = point.x;

      // Restore obstacles and portals from BEFORE the resume point
      const oldObstacles = resumeOptions.obstacles.filter(o => o.x + o.width <= startX);
      const oldPortals = resumeOptions.portals.filter(p => p.x + p.width <= startX);

      this.obstacles = [...oldObstacles, ...this.obstacles];
      this.portals = [...oldPortals, ...this.portals];
    }

    // 3. Generate Terrain & Obstacles along the path
    let pathForGen = this.autoplayLog;
    if (resumeOptions && startX > 0) {
      pathForGen = this.autoplayLog.filter(p => p.x >= startX);
    }

    const mapObjects = generator.generateFromPath(pathForGen, difficulty, beatTimes, stateEvents);

    // 4. Convert MapObjects to Obstacles/Portals
    for (const obj of mapObjects) {
      if (['gravity_yellow', 'gravity_blue', 'speed_0.25', 'speed_0.5', 'speed_1', 'speed_2', 'speed_3', 'speed_4', 'mini_pink', 'mini_green'].includes(obj.type)) {
        this.portals.push({
          x: obj.x,
          y: this.minY,
          width: obj.width || 50,
          height: this.maxY - this.minY,
          type: obj.type as PortalType,
          activated: false
        });
      } else {
        this.obstacles.push({
          x: obj.x,
          y: obj.y,
          width: obj.width || 50,
          height: obj.height || 50,
          type: obj.type as ObstacleType,
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
  private generatePathBasedMap(beatTimes: number[], sections: any[], rng: () => number, volumeProfile?: number[], resumeOptions?: { time: number, stateEvents: StateEvent[], beatActions: BeatAction[] }): StateEvent[] {
    const diff = this.mapConfig.difficulty;
    const playH = this.maxY - this.minY;
    const dt = 1 / 60; // 60fps 시뮬레이션

    // 마디 타이밍 계산 (4/4 박자 기준)
    const beatLength = 60 / this.bpm;
    const measureDuration = beatLength * 4;
    const measureTimes: number[] = [];
    const firstBeat = beatTimes.length > 0 ? Math.max(0.5, beatTimes[0]!) : 0.5;
    for (let t = firstBeat; t < this.trackDuration; t += measureDuration) {
      measureTimes.push(t);
    }

    const resumeTime = resumeOptions?.time || 0;

    console.log(`[MapGen] BPM: ${this.bpm}, Measure Duration: ${measureDuration.toFixed(3)}s, Total Measures: ${measureTimes.length}`);

    // 1단계: 마디마다 상태 변화 이벤트 결정 (포탈은 나중에 동선에 맞춰 배치)
    const stateEvents: StateEvent[] = [];
    let currentSpeedType: PortalType = 'speed_1';
    let currentInverted = false;
    let currentMini = false;

    // 0. 초기 상태 포탈 배치 (시작점에)
    const initialEvents: StateEvent[] = [{
      time: 0.5, // 첫 비트 근처
      speedType: 'speed_1', // 기본값
      isInverted: false,
      isMini: false
    }];

    // 강제로 초기 속도 다양화 (난이도에 따라)
    const initialEvent = initialEvents[0];
    if (diff >= 5 && initialEvent) {
      const r = rng();
      if (r < 0.3) initialEvent.speedType = 'speed_0.5';
      else if (r < 0.6) initialEvent.speedType = 'speed_2';
    }

    stateEvents.push(...initialEvents);
    if (initialEvents[0]) {
      currentSpeedType = initialEvents[0].speedType;
    }

    // Resume: Restore previous events
    if (resumeOptions) {
      // Clear initial if we are replacing fully? No, merging.
      // Keep events before resumeTime
      const keptEvents = resumeOptions.stateEvents.filter(e => e.time < resumeTime);
      stateEvents.length = 0;
      stateEvents.push(...keptEvents);

      // Update current state from last kept event
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
      if (measureTime < 1.0) continue;
      if (measureTime < resumeTime) continue; // Skip past measures if resuming

      // 섹션에서 intensity 찾기
      const section = sections?.find(s => measureTime >= s.startTime && measureTime < s.endTime);
      const intensity = section?.intensity || 0.5;

      // 배속 포탈 결정 (난이도 기반)
      let newSpeedType: PortalType;
      if (diff < 8) {
        // Easy: 80% speed_1, others rarely
        const r = rng();
        if (r < 0.8) newSpeedType = 'speed_1';
        else if (r < 0.9) newSpeedType = 'speed_0.5';
        else newSpeedType = 'speed_2';
      } else if (diff < 16) {
        // Normal: Mostly 1 and 2, rare 0.5
        const r = rng();
        if (r < 0.1) newSpeedType = 'speed_0.5';
        else if (r < 0.6) newSpeedType = 'speed_1';
        else newSpeedType = 'speed_2';
      } else if (diff < 24) {
        // Hard: Varied speeds (0.5, 1, 2, 3)
        const r = rng();
        if (r < 0.15) newSpeedType = 'speed_0.5';
        else if (r < 0.4) newSpeedType = 'speed_1';
        else if (r < 0.8) newSpeedType = 'speed_2';
        else newSpeedType = 'speed_3';
      } else {
        // Impossible: Aggressive shifts (0.25, 0.5, 2, 3, 4)
        const r = rng();
        if (r < 0.1) newSpeedType = 'speed_0.25';
        else if (r < 0.25) newSpeedType = 'speed_0.5';
        else if (r < 0.4) newSpeedType = 'speed_1';
        else if (r < 0.5) newSpeedType = 'speed_2';
        else if (r < 0.8) newSpeedType = 'speed_3';
        else newSpeedType = 'speed_4';
      }

      // 중력 반전 결정
      const gravityChance = diff >= 24 ? 0.9 : (diff < 8 ? 0.25 : 0.5);
      let newInverted: boolean = currentInverted;
      if (rng() < gravityChance && diff >= 3) {
        newInverted = rng() > 0.5;
      }

      // 미니 결정 (비율 대폭 축소: 진입은 어렵게, 탈출은 쉽게)
      let newMini: boolean = currentMini;
      if (diff >= 5) { // 5 난이도 미만은 미니 안나오게
        if (!currentMini) {
          // Normal -> Mini: Rare
          const miniEntryChance = diff >= 24 ? 0.08 : 0.04;
          if (rng() < miniEntryChance) newMini = true;
        } else {
          // Mini -> Normal: Common (Short duration)
          const miniExitChance = 0.6; // 60% chance to exit mini per measure
          if (rng() < miniExitChance) newMini = false;
        }
      } else {
        newMini = false; // Force normal for low difficulty
      }

      // 상태 변화가 있을 때만 이벤트 기록
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

    // 2단계: 비트에 맞춰 클릭/릴리즈 동선 생성 (User Requested "Piano Mapping" Logic)
    // - Fast Beats (< 0.25s): Toggle State (Click -> Release -> Click...) -> ZigZag
    // - Normal Beats (>= 0.25s): Pulse (Click at beat, Release at mid-point) -> Hill

    // (moved internally)
    // BeatAction export is actually needed for resumeOptions.
    // I will export it at top level or assume it's passed as any/internal.
    // Better to export it. 
    // Since I cannot move the interface definition easily without breaking references if I'm not careful,
    // I will redefine it or find where it is.
    // It was locally defined. I will keep it locally but cast if needed, or better, move it up.
    // But for this tool I can't move lines far away easily.
    // I will simply duplicate definition or use 'any' for now in the method signature, 
    // OR change the method signature in a separate chunk to use a type alias defined at top.


    const beatActions: BeatAction[] = [];

    // Resume: Restore beat actions
    if (resumeOptions) {
      beatActions.push(...resumeOptions.beatActions.filter(b => b.time < resumeTime));
    }

    const sortedBeats = [...beatTimes].filter(t => t >= 0.3 && t >= resumeTime).sort((a, b) => a - b);

    // State tracker for generation
    let isHolding = false;

    // Resume: Restore isHolding state
    if (resumeOptions && resumeOptions.beatActions.length > 0) {
      // Find the very last action strictly before resumeTime
      const lastAction = resumeOptions.beatActions[resumeOptions.beatActions.length - 1];
      if (lastAction.action === 'click') {
        isHolding = true;
      }
    }
    const fastThreshold = 0.25;

    // Macro Trend Variables (지형의 전반적인 흐름 제어)
    let currentHeight = 360; // Estimated height tracker
    // Initial Trend based on volume if available
    let trend: 'up' | 'down' | 'flat' = 'up';
    if (!volumeProfile) {
      trend = Math.random() < 0.5 ? 'up' : 'down';
    }

    let trendTimer = 0;


    for (let i = 0; i < sortedBeats.length; i++) {
      const beatTime = sortedBeats[i]!;
      const nextBeatTime = (i + 1 < sortedBeats.length) ? sortedBeats[i + 1]! : (beatTime + 1.0);
      const interval = nextBeatTime - beatTime;

      // User Feedback: "Click and Release should be set exactly."
      // IF Fast Beat: Just Toggle
      if (interval < fastThreshold) {
        beatActions.push({ time: beatTime, action: isHolding ? 'release' : 'click' });
        isHolding = !isHolding;
      } else {
        // Normal Beat:
        // IF Holding: Release at beat (Logic: End of hold is the beat?) -> User wants "Click" at beat usually
        // Let's assume Beat = Click (Lead Sound).
        // So we Click at Beat.
        // And Release somewhere in between (e.g. 50% or 75% duration).

        // Wait, if we are already holding, we must release first to click again.
        if (isHolding) {
          // Release slightly before the beat? Or at the beat?
          // If we release at beat, we can't click at beat immediately without 0 duration.
          // So, release at (beat - small margin) or (lastBeat + duration).

          // Simple pulse: 
          // If not holding: Click at beat.
          // Then Release at beat + interval * factor
          // We vary the factor slightly with RNG to create different jump arcs (0.4 ~ 0.7)
          // This allows finding paths through tight spots during retries
          const baseFactor = 0.5;
          const variance = (rng() - 0.5) * 0.3; // -0.15 ~ +0.15
          const holdFactor = Math.max(0.3, Math.min(0.8, baseFactor + variance)); // Clamp 0.3 ~ 0.8

          beatActions.push({ time: beatTime, action: 'click' });
          beatActions.push({ time: beatTime + interval * holdFactor, action: 'release' });
          isHolding = false; // We released.
        } else {
          // Not holding. Click at beat.
          // Vary hold factor
          const baseFactor = 0.5;
          const variance = (rng() - 0.5) * 0.3;
          const holdFactor = Math.max(0.3, Math.min(0.8, baseFactor + variance));

          beatActions.push({ time: beatTime, action: 'click' });
          // Release later
          beatActions.push({ time: beatTime + interval * holdFactor, action: 'release' });
          isHolding = false;
        }
      }
    }

    // Cleanup: Remove actions that might overlap
    beatActions.sort((a, b) => a.time - b.time);
    const cleanedActions: BeatAction[] = [];
    for (const act of beatActions) {
      if (cleanedActions.length > 0) {
        const last = cleanedActions[cleanedActions.length - 1];
        if (act.time - last!.time < 0.01) {
          cleanedActions.pop();
        }
      }
      cleanedActions.push(act);
    }
    beatActions.length = 0;
    beatActions.push(...cleanedActions);

    // Swap back
    // (Existing dedup loop below handles final cleanup)

    // 시간순 정렬 및 중복 제거
    beatActions.sort((a, b) => a.time - b.time);
    const dedupedActions: BeatAction[] = [];
    for (const action of beatActions) {
      const last = dedupedActions[dedupedActions.length - 1];
      if (!last || Math.abs(last.time - action.time) > 0.03 || last.action !== action.action) {
        dedupedActions.push(action);
      }
    }
    beatActions.length = 0;
    beatActions.push(...dedupedActions);

    // 3단계: 동선 시뮬레이션 (autoplayLog 생성) - 포탈 없이 순수 동선만
    this.autoplayLog = [];
    let simX = 200;
    let simY = 360;
    let simTime = 0;
    let simHolding = false;
    let simGravity = false;
    let simSpeed = 1.0;
    let simMini = false;
    let simAngle = 45;
    let beatActionIdx = 0;
    let stateEventIdx = 0;

    while (simTime < this.trackDuration + 1) {
      // 상태 이벤트 처리 (시간 기반)
      while (stateEventIdx < stateEvents.length && stateEvents[stateEventIdx]!.time <= simTime) {
        const se = stateEvents[stateEventIdx]!;
        simSpeed = this.getSpeedMultiplierFromType(se.speedType);
        simGravity = se.isInverted;
        simMini = se.isMini;
        simAngle = this.getEffectiveAngle(simMini, simSpeed);
        stateEventIdx++;
      }

      // 비트 액션 처리
      while (beatActionIdx < beatActions.length && beatActions[beatActionIdx]!.time <= simTime) {
        const ba = beatActions[beatActionIdx]!;
        simHolding = ba.action === 'click';
        beatActionIdx++;
      }

      // 물리 시뮬레이션
      const spd = this.baseSpeed * simSpeed;
      const amp = spd * Math.tan(simAngle * Math.PI / 180);

      // Y 속도 방향 계산
      let vy: number;
      if (simGravity) {
        vy = simHolding ? 1 : -1;
      } else {
        vy = simHolding ? -1 : 1;
      }

      simY += amp * vy * dt;

      // 천장/바닥 경계 처리 (여유 마진 포함)
      const margin = 70; // Increased from 30 to 70 to prevent sticking
      if (simY < this.minY + margin) simY = this.minY + margin;
      if (simY > this.maxY - margin) simY = this.maxY - margin;

      simX += spd * dt;

      // autoplayLog에 기록
      this.autoplayLog.push({
        x: simX,
        y: simY,
        holding: simHolding,
        time: simTime
      });

      simTime += dt;
    }

    this.lastBeatActions = beatActions; // Save for next resume

    this.totalLength = simX + 500;

    // 4단계: 동선에 맞춰 포탈 배치 (동선의 실제 Y 위치 사용)
    for (const se of stateEvents) {
      // 해당 시간에서의 동선 위치 찾기
      const pathPoint = this.autoplayLog.find(p => Math.abs(p.time - se.time) < 0.02);
      if (!pathPoint) continue;

      const portalTypes: PortalType[] = [];

      // 이전 상태와 비교하여 변경된 포탈만 추가
      const prevEvent = stateEvents[stateEvents.indexOf(se) - 1];
      const prevSpeed = prevEvent?.speedType || 'speed_1';
      const prevInverted = prevEvent?.isInverted || false;
      const prevMini = prevEvent?.isMini || false;

      if (se.speedType !== prevSpeed) {
        portalTypes.push(se.speedType);
      }
      if (se.isInverted !== prevInverted) {
        portalTypes.push(se.isInverted ? 'gravity_yellow' : 'gravity_blue');
      }
      if (se.isMini !== prevMini) {
        portalTypes.push(se.isMini ? 'mini_pink' : 'mini_green');
      }

      if (portalTypes.length > 0) {
        // 동선의 Y 위치에 맞춰 포탈 배치 (강제 진입 블록 없음)
        this.generatePathAlignedPortals(pathPoint.x, pathPoint.y, portalTypes);
      }
    }

    // 5단계: 동선 강제를 위한 장애물 배치 (MapGenerator로 대체)
    // this.placeObstaclesForPath(beatActions, stateEvents, rng, diff);
    return stateEvents;
  }

  /**
   * 동선에 맞춰 포탈 배치 (정상 크기, 경로 사이에 배치)
   */
  private generatePathAlignedPortals(xPos: number, pathY: number, types: PortalType[]) {
    const portalWidth = 64;
    const portalHeight = 240; // Increased to 240 for better forcing
    const horizontalSpacing = 80;

    types.forEach((type, horizontalIndex) => {
      const currentX = xPos + horizontalIndex * (portalWidth + horizontalSpacing);

      // 포탈을 경로 중심에 배치 (pathY 기준)
      const portalY = pathY - portalHeight / 2;

      this.portals.push({
        x: currentX,
        y: this.minY,
        width: portalWidth,
        height: this.maxY - this.minY,
        type: type,
        activated: false
      });

      // 난이도 1~2는 강제 블록 벽 생성 안함
      if (this.mapConfig.difficulty <= 2) return;

      // 포탈 위아래에 블록 벽 배치 (강제 통과)
      const wallThickness = 70;
      const gapSize = portalHeight + 40; // Larger gap for larger portal

      // 위쪽 벽
      const topWallHeight = portalY - this.minY - 20;
      if (topWallHeight > 20) {
        this.obstacles.push({
          x: currentX - 5,
          y: this.minY,
          width: portalWidth + 10,
          height: topWallHeight,
          type: 'block',
          initialY: this.minY
        });
      }

      // 아래쪽 벽
      const bottomWallStart = portalY + portalHeight + 20;
      const bottomWallHeight = this.maxY - bottomWallStart;
      if (bottomWallHeight > 20) {
        this.obstacles.push({
          x: currentX - 5,
          y: bottomWallStart,
          width: portalWidth + 10,
          height: bottomWallHeight,
          type: 'block',
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
  private isObstacleSafe(obsX: number, obsY: number, obsW: number, obsH: number, margin: number = 0): boolean {
    const playerSize = this.basePlayerSize + margin;
    const checkMinX = obsX - playerSize;
    const checkMaxX = obsX + obsW + playerSize;

    // Binary Search for start index
    let l = 0, r = this.autoplayLog.length;
    while (l < r) {
      const mid = (l + r) >>> 1;
      if (this.autoplayLog[mid]!.x < checkMinX) l = mid + 1;
      else r = mid;
    }
    const startIndex = l;

    // 해당 X 범위 내의 동선 포인트들 확인
    for (let i = startIndex; i < this.autoplayLog.length; i++) {
      const point = this.autoplayLog[i]!;
      if (point.x > checkMaxX) break; // X 범위 벗어나면 중단 (Sorted)

      // Y 범위 충돌 확인
      if (point.y >= obsY - playerSize && point.y <= obsY + obsH + playerSize) {
        return false; // 충돌!
      }
    }
    return true; // 안전
  }

  /**
   * 동선 강제를 위한 장애물 배치 (체계적인 패턴 사용)
   * 패턴: 블록/레이저 벽, 기울어진 블록, 이동 장애물
   * 미니 상태: 60도 기울어진 블록만 사용
   */
  private placeObstaclesForPath(beatActions: { time: number; action: string }[], stateEvents: StateEvent[], rng: () => number, diff: number) {
    const normDiff = Math.max(0.1, diff / 30);
    const pRadius = this.basePlayerSize;

    // 현재 상태 추적 (속도, 미니 여부)
    let currentSpeed = 1.0;
    let isMini = false;

    // 포탈 위치별 상태 변화 맵 생성
    const portalStates: { x: number; isMini: boolean; speed: number }[] = [];
    this.portals.forEach(p => {
      if (p.type === 'mini_pink') {
        portalStates.push({ x: p.x, isMini: true, speed: currentSpeed });
      } else if (p.type === 'mini_green') {
        portalStates.push({ x: p.x, isMini: false, speed: currentSpeed });
      } else if (p.type.startsWith('speed_')) {
        const speedVal = parseFloat(p.type.replace('speed_', ''));
        portalStates.push({ x: p.x, isMini, speed: speedVal });
      }
    });
    portalStates.sort((a, b) => a.x - b.x);

    // 속도별 간격 조정
    const getSpacingMultiplier = (speed: number): number => {
      if (speed <= 0.5) return 0.4;  // 저배속: 매우 좁은 간격
      if (speed <= 1.0) return 1.0;  // 기본
      if (speed <= 2.0) return 1.5;  // 고배속: 간격 증가
      return 2.0;  // 최고배속: 최대 간격
    };

    // 안전 마진 (미니일 때 더 좁음)
    const getSafeMargin = (): number => {
      const baseMargin = Math.max(pRadius + 5, 50 - normDiff * 35);
      return isMini ? baseMargin * 0.5 : baseMargin;
    };

    // 비트 기반 섹션 분할
    const sectionLength = 800;
    let lastPatternX = 400;

    console.log(`[MapGen] Starting path obstacle placement - Diff: ${diff}`);

    for (let x = 500; x < this.totalLength - 300; x += 100) {
      // 현재 X 위치에서의 시뮬레이션 시간 찾기 (가장 가까운 로그 추천)
      const pathPoint = this.autoplayLog.find(p => Math.abs(p.x - x) < 50);
      if (!pathPoint) continue;

      // 현재 시점의 미니/속도 상태 업데이트
      const simTime = pathPoint.time;
      // findLast 대신 역순 find 사용 (브라우저 호환성)
      const currentEvent = [...stateEvents].reverse().find((e: StateEvent) => e.time <= simTime);
      if (currentEvent) {
        isMini = currentEvent.isMini;
        currentSpeed = this.getSpeedMultiplierFromType(currentEvent.speedType);
      }

      const pathY = pathPoint.y;
      const safeMargin = getSafeMargin();
      const spacingMult = getSpacingMultiplier(currentSpeed);

      // 패턴 간격 체크
      if (x - lastPatternX < 150 * spacingMult) continue;

      // === 미니 상태: 60도 기울어진 블록만 사용 ===
      if (isMini) {
        this.placeTiltedBlock(x, pathY, safeMargin, 60, rng);
        lastPatternX = x;
        continue;
      }

      // === 일반 상태: 다양한 패턴 사용 ===
      const patternType = Math.floor((x - 500) / sectionLength) % 4;

      if (patternType === 0) {
        // 패턴 0: 블록 벽 (위/아래)
        this.placeBlockWall(x, pathY, safeMargin, rng);
        lastPatternX = x;
      } else if (patternType === 1) {
        // 패턴 1: 기울어진 블록 (45도)
        this.placeTiltedBlock(x, pathY, safeMargin, 45, rng);
        lastPatternX = x;
      } else if (patternType === 2) {
        // 패턴 2: 레이저 벽
        this.placeLaserWall(x, pathY, safeMargin, rng);
        lastPatternX = x;
      } else {
        // 패턴 3: 이동하는 장애물
        if (diff >= 10) {
          this.placeMovingObstacle(x, pathY, safeMargin, pathPoint.time, rng);
          lastPatternX = x;
        } else {
          this.placeBlockWall(x, pathY, safeMargin, rng);
          lastPatternX = x;
        }
      }

      // 빠른 비트 구간: 연타 블록 (미니가 아닐 때만)
      const nearBeat = beatActions.find(b => Math.abs((b.time * this.baseSpeed) + 200 - x) < 100);
      if (nearBeat && rng() < 0.3 + normDiff * 0.3) {
        this.placeRapidBlocks(x, pathY, safeMargin, 3, rng);
      }
    }

    // this.obstacles.length check or log
    // New MapGenerator logic replaces this method's obstacle placement.
    // However, portals are generated in step 4 above (inside generatePathBasedMap call stack).
    // We might need to ensure portals are kept, or MapGenerator handles them.
    // MapGenerator currently assumes path is provided.

    // IMPORTANT: The original generatePathBasedMap calls 'placeObstaclesForPath' at the end (Step 5).
    // We should DISABLE step 5 inside generatePathBasedMap because we are using MapGenerator for terrain.
  }

  // Override or Disable internal obstacle placement in generatePathBasedMap
  // Actually, generatePathBasedMap is called BY generateMap.
  // We can just comment out the call to placeObstaclesForPath inside generatePathBasedMap.
  // But wait, generatePathBasedMap definition is below. Let's find where it calls placeObstaclesForPath.

  /**
   * 블록 벽 배치 (위/아래)
   */
  private placeBlockWall(x: number, pathY: number, safeMargin: number, rng: () => number) {
    const wallWidth = 50 + Math.floor(rng() * 30);

    // 위쪽 벽
    const topHeight = pathY - safeMargin - this.minY;
    if (topHeight > 30 && this.isObstacleSafe(x, this.minY, wallWidth, topHeight, 3)) {
      this.obstacles.push({
        x, y: this.minY, width: wallWidth, height: topHeight,
        type: 'block', initialY: this.minY
      });
    }

    // 아래쪽 벽
    const bottomStart = pathY + safeMargin;
    const bottomHeight = this.maxY - bottomStart;
    if (bottomHeight > 30 && this.isObstacleSafe(x, bottomStart, wallWidth, bottomHeight, 3)) {
      this.obstacles.push({
        x, y: bottomStart, width: wallWidth, height: bottomHeight,
        type: 'block', initialY: bottomStart
      });
    }
  }

  /**
   * 기울어진 블록 배치 - 웨이브 방향에 맞춘 코리도(통로) 형성
   * 이미지 참조: 위로 올라갈 때와 아래로 내려갈 때 다른 방향의 슬로프
   */
  private placeTiltedBlock(x: number, pathY: number, safeMargin: number, angle: number, rng: () => number) {
    const blockSize = 100 + Math.floor(rng() * 50);

    // 현재 위치의 웨이브 방향 추정 (이전/다음 포인트 비교)
    const prevPoint = this.autoplayLog.find(p => Math.abs(p.x - (x - 100)) < 60);
    const nextPoint = this.autoplayLog.find(p => Math.abs(p.x - (x + 100)) < 60);

    // 기본값: 위로 올라가는 중
    let goingUp = true;
    if (prevPoint && nextPoint) {
      goingUp = nextPoint.y < prevPoint.y;
    } else if (prevPoint) {
      goingUp = pathY < prevPoint.y;
    }

    // === 웨이브 방향에 맞춘 슬로프 배치 ===
    // 위로 올라갈 때: 위쪽 슬로프는 왼쪽 하단 모서리, 아래쪽 슬로프는 오른쪽 상단 모서리
    // 아래로 내려갈 때: 반대

    // 위쪽 슬로프 (플레이어 위)
    const topY = pathY - safeMargin - blockSize;
    if (topY > this.minY && this.isObstacleSafe(x, topY, blockSize, blockSize, 3)) {
      this.obstacles.push({
        x, y: topY, width: blockSize, height: blockSize,
        type: 'slope', initialY: topY,
        angle: goingUp ? angle : -angle  // 올라갈 때: 양수(왼쪽 하단), 내려갈 때: 음수(오른쪽 하단)
      });
    }

    // 아래쪽 슬로프 (플레이어 아래)
    const bottomY = pathY + safeMargin;
    if (bottomY + blockSize < this.maxY && this.isObstacleSafe(x, bottomY, blockSize, blockSize, 3)) {
      this.obstacles.push({
        x, y: bottomY, width: blockSize, height: blockSize,
        type: 'slope', initialY: bottomY,
        angle: goingUp ? -angle : angle  // 올라갈 때: 음수(오른쪽 상단), 내려갈 때: 양수(왼쪽 상단)
      });
    }

    // 추가: 톱니 장애물 (이미지처럼 중간에 배치)
    if (rng() < 0.3) {
      const sawSize = 40 + Math.floor(rng() * 30);
      const sawX = x + blockSize + 30;
      const sawY = pathY - sawSize / 2;
      if (this.isObstacleSafe(sawX, sawY, sawSize, sawSize, 3)) {
        this.obstacles.push({
          x: sawX, y: sawY, width: sawSize, height: sawSize,
          type: 'spike_ball', initialY: sawY
        });
      }
    }
  }


  /**
   * 레이저 벽 배치
   */
  private placeLaserWall(x: number, pathY: number, safeMargin: number, rng: () => number) {
    const laserWidth = 30;

    // 위쪽 레이저
    const topHeight = pathY - safeMargin - this.minY - 20;
    if (topHeight > 50) {
      this.obstacles.push({
        x: x + 10, y: this.minY, width: laserWidth, height: topHeight,
        type: 'v_laser', initialY: this.minY
      });
    }

    // 아래쪽 레이저
    const bottomStart = pathY + safeMargin + 20;
    const bottomHeight = this.maxY - bottomStart;
    if (bottomHeight > 50) {
      this.obstacles.push({
        x: x + 10, y: bottomStart, width: laserWidth, height: bottomHeight,
        type: 'v_laser', initialY: bottomStart
      });
    }
  }

  /**
   * 이동하는 장애물 배치 (사전 계산된 위치)
   */
  private placeMovingObstacle(x: number, pathY: number, safeMargin: number, time: number, rng: () => number) {
    const obsSize = 40 + Math.floor(rng() * 20);
    const moveRange = 80 + Math.floor(rng() * 60);
    const moveSpeed = 1.5 + rng() * 1.5;

    // 위쪽 이동 장애물
    const topBaseY = pathY - safeMargin - obsSize - 30;
    if (topBaseY > this.minY + moveRange) {
      this.obstacles.push({
        x, y: topBaseY, width: obsSize, height: obsSize,
        type: 'saw', initialY: topBaseY,
        moveY: { range: moveRange, speed: moveSpeed }
      });
    }

    // 아래쪽 이동 장애물
    const bottomBaseY = pathY + safeMargin + 30;
    if (bottomBaseY + obsSize + moveRange < this.maxY) {
      this.obstacles.push({
        x, y: bottomBaseY, width: obsSize, height: obsSize,
        type: 'spike_ball', initialY: bottomBaseY,
        moveY: { range: moveRange, speed: moveSpeed }
      });
    }
  }

  /**
   * 연타 블록 배치 (빠른 비트용)
   */
  private placeRapidBlocks(startX: number, pathY: number, safeMargin: number, count: number, rng: () => number) {
    const blockWidth = 30;
    const gap = 60;

    for (let i = 0; i < count; i++) {
      const x = startX + i * gap;
      const isTop = i % 2 === 0;

      if (isTop) {
        const topHeight = pathY - safeMargin - this.minY;
        if (topHeight > 20 && this.isObstacleSafe(x, this.minY, blockWidth, topHeight, 2)) {
          this.obstacles.push({
            x, y: this.minY, width: blockWidth, height: topHeight,
            type: 'block', initialY: this.minY
          });
        }
      } else {
        const bottomStart = pathY + safeMargin;
        const bottomHeight = this.maxY - bottomStart;
        if (bottomHeight > 20 && this.isObstacleSafe(x, bottomStart, blockWidth, bottomHeight, 2)) {
          this.obstacles.push({
            x, y: bottomStart, width: blockWidth, height: bottomHeight,
            type: 'block', initialY: bottomStart
          });
        }
      }
    }
  }

  /**
   * 작은 장애물 타입 (동선 강제용) - 다양한 타입 사용
   */
  private getSmallObstacleType(rng: () => number, diff: number): ObstacleType {
    const r = rng();
    if (diff < 8) {
      // Easy: 기본 장애물
      if (r < 0.4) return 'spike';
      if (r < 0.7) return 'mini_spike';
      return 'orb';
    } else if (diff < 16) {
      // Normal: 다양한 장애물
      if (r < 0.25) return 'spike';
      if (r < 0.4) return 'saw';
      if (r < 0.55) return 'orb';
      if (r < 0.7) return 'mini_spike';
      if (r < 0.85) return 'spike_ball';
      return 'mine';
    } else if (diff < 24) {
      // Hard: 위험한 장애물
      if (r < 0.2) return 'spike';
      if (r < 0.35) return 'saw';
      if (r < 0.5) return 'spike_ball';
      if (r < 0.65) return 'mine';
      if (r < 0.8) return 'orb';
      return 'laser';
    } else {
      // Impossible: 모든 위험 장애물
      if (r < 0.15) return 'spike';
      if (r < 0.25) return 'saw';
      if (r < 0.4) return 'spike_ball';
      if (r < 0.55) return 'mine';
      if (r < 0.7) return 'orb';
      if (r < 0.85) return 'laser';
      return 'v_laser';
    }
  }


  /**
   * 난이도에 따른 랜덤 장애물 타입
   */
  private getRandomObstacleType(rng: () => number, diff: number): ObstacleType {
    if (diff < 8) {
      // Easy: 기본 장애물만
      return rng() > 0.5 ? 'block' : 'spike';
    } else if (diff < 16) {
      // Normal: 다양한 장애물
      const types: ObstacleType[] = ['block', 'spike', 'saw', 'mini_spike'];
      return types[Math.floor(rng() * types.length)]!;
    } else if (diff < 24) {
      // Hard: 위험한 장애물 포함
      const types: ObstacleType[] = ['block', 'spike', 'saw', 'laser', 'spike_ball'];
      return types[Math.floor(rng() * types.length)]!;
    } else {
      // Impossible: 모든 장애물
      const types: ObstacleType[] = ['block', 'spike', 'saw', 'laser', 'spike_ball', 'mine', 'orb', 'v_laser'];
      return types[Math.floor(rng() * types.length)]!;
    }
  }

  /**
   * 난이도에 따른 장식 장애물 타입
   */
  private getRandomDecorationType(rng: () => number, diff: number): ObstacleType {
    if (diff < 16) {
      const types: ObstacleType[] = ['mini_spike', 'orb'];
      return types[Math.floor(rng() * types.length)]!;
    } else {
      const types: ObstacleType[] = ['mine', 'spike_ball', 'saw', 'orb'];
      return types[Math.floor(rng() * types.length)]!;
    }
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
   * 난이도에 따라 빠른 속도 포탈 제한
   */
  private generatePortal(xPos: number, rng: () => number) {
    let portalTypes: PortalType[] = [
      'gravity_yellow', 'gravity_blue',
      'speed_0.5', 'speed_1', 'speed_2', 'speed_3', 'speed_4'
    ];

    // 난이도별 속도 포탈 제한
    const diff = this.mapConfig.difficulty;
    if (diff < 8) {
      // EASY: 2배속 이상 제외
      portalTypes = portalTypes.filter(t => !['speed_2', 'speed_3', 'speed_4'].includes(t));
    } else if (diff < 16) {
      // NORMAL: 3배속 이상 제외
      portalTypes = portalTypes.filter(t => !['speed_3', 'speed_4'].includes(t));
    } else if (diff < 24) {
      // HARD: 4배속 제외
      portalTypes = portalTypes.filter(t => t !== 'speed_4');
    }
    // IMPOSSIBLE: 모든 포탈 허용

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
  public * computeAutoplayLogGen(startX: number, startY: number): Generator<number, boolean, unknown> {
    this.autoplayLog = [];
    this.validationFailureInfo = null;
    // 성능 최적화: dt를 1/30으로 설정하여 검증 속도 2배 향상
    const dt = 1 / 30;
    const sortedObs = [...this.obstacles].sort((a, b) => a.x - b.x);
    const sortedPortals = [...this.portals].sort((a, b) => a.x - b.x);

    // Binary search helper for obstacles
    const findStartIndex = (minX: number): number => {
      let l = 0, r = sortedObs.length;
      while (l < r) {
        const mid = (l + r) >>> 1;
        if (sortedObs[mid]!.x < minX) l = mid + 1;
        else r = mid;
      }
      return l;
    };

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
      // 성능 최적화: 더 큰 그리드 셀 사용
      const xi = Math.floor(s.x / (this.baseSpeed * 0.033));
      const yi = Math.floor(s.y / 12);
      return `${xi}_${yi}_${s.g ? 1 : 0}_${Math.round(s.sm * 10)}_${s.m ? 1 : 0}`;
    };

    const checkColl = (tx: number, ty: number, sz: number, tm: number, sm: number, margin: number = 0): boolean => {
      // 바닥/천장 충돌 체크 (실제 게임과 동일하게 마진 없음)
      // 바닥/천장 충돌 체크 제거 (슬라이딩 처리로 변경)
      // if (ty < this.minY + sz || ty > this.maxY - sz) return true;

      const startI = findStartIndex(tx - 1000); // 1000px lookback is safe for max obstacle width

      for (let i = startI; i < sortedObs.length; i++) {
        const o = sortedObs[i]!;
        if (o.x + o.width < tx - 50) continue;
        if (o.x > tx + 100) break;

        // 움직이는 장애물에 대해서만 타이밍 오차 보정용 마진 적용 (2px)
        // 이동 오브젝트는 시뮬레이션 시간과 실제 게임 시간의 차이로 인해 위치가 달라질 수 있음
        const moveMargin = o.movement ? 2.0 : 0;

        // 실제 게임과 동일하게 sz 그대로 사용, 이동 오브젝트만 추가 마진
        if (this.checkObstacleCollision(o, tx, ty, sz + margin + moveMargin, tm, sm)) return true;
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

        // 바닥/천장 슬라이딩 처리
        if (sy < this.minY + sz) sy = this.minY + sz;
        if (sy > this.maxY - sz) sy = this.maxY - sz;

        // 생존 확인: 안전 마진 1px 적용 (더 정밀한 경로 탐색 허용)
        if (checkColl(sx, sy, sz, sTime, ssm, 1)) return false;
      }
      return true;
    };

    const stack: SearchState[] = [initialState];
    let maxX = startX;
    let loops = 0;
    const maxLoops = 500000; // Increased search depth
    let bestState: SearchState | null = null;
    let furthestFailX = startX;
    let failY = startY;

    while (stack.length > 0) {
      loops++;
      const curr = stack.pop()!;
      if (curr.x > maxX) {
        maxX = curr.x;
      }
      if (loops % 1000 === 0) yield maxX / this.totalLength;
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
          if (p.type === 'teleport_in') {
            // AI Simulation: Teleport
            const target = this.portals.find(tp => tp.type === 'teleport_out' && (p.linkId ? tp.linkId === p.linkId : tp.x > p.x));
            if (target) {
              curr.x = target.x + target.width + 20;
              curr.y = target.y + target.height / 2;
              // Re-find portals at new location
              npIdx = sortedPortals.findIndex(sp => sp.x >= curr.x);
              if (npIdx === -1) npIdx = sortedPortals.length;
              // Stop processing portals at old location
              break;
            }
          }
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
      let nYH = curr.y + amp * (nG ? 1 : -1) * dt;
      let nYR = curr.y + amp * (nG ? -1 : 1) * dt;

      // 바닥/천장 슬라이딩 처리
      if (nYH < this.minY + sz) nYH = this.minY + sz;
      if (nYH > this.maxY - sz) nYH = this.maxY - sz;
      if (nYR < this.minY + sz) nYR = this.minY + sz;
      if (nYR > this.maxY - sz) nYR = this.maxY - sz;

      let dH = checkColl(nX, nYH, sz, nT, nSM, 3); // 안전 마진 3px 적용 - 아슬아슬한 경로 방지
      let dR = checkColl(nX, nYR, sz, nT, nSM, 3);

      // Tunneling prevention: Check midpoint if moving fast vertically
      // dt=1/30 (approx 11px X movement), but Y movement can be large (50px+)
      const vDist = sz * 0.8;
      if (!dH && Math.abs(nYH - curr.y) > vDist) {
        if (checkColl((curr.x + nX) / 2, (curr.y + nYH) / 2, sz, curr.time + dt / 2, nSM, 3)) dH = true;
      }
      if (!dR && Math.abs(nYR - curr.y) > vDist) {
        if (checkColl((curr.x + nX) / 2, (curr.y + nYR) / 2, sz, curr.time + dt / 2, nSM, 3)) dR = true;
      }

      if (dH && dR && nX > furthestFailX) { furthestFailX = nX; failY = curr.y; }

      const prevH = curr.h;
      // Increased lookahead to 60 frames (~1.0s) for better stability.
      const lookaheadFrames = 60;

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
      // Default preference based on safety: Stick to current state if safe
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

        for (let oi = findStartIndex(nX - 1000); oi < sortedObs.length; oi++) {
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

      // USER REQUEST: "falling spike에서 자꾸 tutorial mode가 죽음. 최대한 위로 가라." -> Revised: "Try Low first, then High"
      // Falling Spike Strategy Override:
      // Try 'Low' first (Release in Normal, Hold in Inverted)
      const scanEnd = nX + 400;
      let fallingSpikeAhead = false;

      for (let i = findStartIndex(nX); i < sortedObs.length; i++) {
        const o = sortedObs[i]!;
        if (o.x > scanEnd) break;
        if (o.type === 'falling_spike') {
          fallingSpikeAhead = true;
          break;
        }
      }

      if (fallingSpikeAhead) {
        preferHold = !nG; // Normal(F): false(Release/Low). Inverted(T): true(Hold/Low).
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
      const path: { x: number, y: number, holding: boolean, time: number }[] = [];
      let t: SearchState | null = bestState;
      while (t) { path.push({ x: t.x, y: t.y, holding: t.h, time: t.time }); t = t.prev; }
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
    let simTime: number | null = null; // 오토플레이 시 AI 시뮬레이션 시간
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
          // 시간도 보간하여 이동 오브젝트 동기화
          simTime = prevEntry.time + (foundEntry.time - prevEntry.time) * Math.max(0, Math.min(1, ratio));
        } else {
          this.playerY = foundEntry.y;
          simTime = foundEntry.time;
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
      // 천장 충돌 시 죽지 않음 (슬라이딩)
    }
    if (this.playerY > this.maxY - this.playerSize) {
      this.playerY = this.maxY - this.playerSize;
      // 바닥 충돌 시 죽지 않음 (슬라이딩)
    }

    this.cameraX = this.playerX - 280;
    this.progress = Math.min(100, (this.playerX / this.totalLength) * 100);
    this.score = Math.floor(this.progress * 10);

    this.trail.push({ x: this.playerX, y: this.playerY, time: Date.now() });
    if (this.trail.length > 80) this.trail.shift();  // 더 긴 트레일

    this.updateParticles(dt);

    // 오토플레이 모드에서는 AI 시뮬레이션 시간(simTime)을 사용하여 이동 오브젝트 동기화
    const effectiveTime = simTime !== null ? simTime : currentTime;
    this.updateMovingObstacles(dt, effectiveTime);
    this.updateBoss(dt, effectiveTime); // Boss update
    this.checkPortalCollisions();
    this.checkCollisions(effectiveTime);

    // Beat Highlight logic
    if (this.beatTimes.length > 0) {
      // Find current beat index
      const currentBeatIdx = this.beatTimes.findIndex(t => t >= currentTime);
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

  private checkPortalCollisions() {
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
        const rad = -portal.angle! * Math.PI / 180;
        points.forEach(p => {
          const dx = p.x - cx;
          const dy = p.y - cy;
          p.x = cx + dx * Math.cos(rad) - dy * Math.sin(rad);
          p.y = cy + dx * Math.sin(rad) + dy * Math.cos(rad);
        });
      }

      const isColliding = points.some(p =>
        p.x >= portal.x && p.x <= portal.x + portal.width &&
        p.y >= portal.y && p.y <= portal.y + portal.height
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
      case 'teleport_in':
        // Find linked output portal
        // If linkId is present, find match. If not, find the nearest 'teleport_out' ahead.
        const currentPortal = this.portals.find(p => p.type === 'teleport_in' && p.activated && Math.abs(p.x - this.playerX) < 100);
        if (currentPortal) {
          let target = null;
          if (currentPortal.linkId) {
            target = this.portals.find(p => p.type === 'teleport_out' && p.linkId === currentPortal.linkId);
          } else {
            target = this.portals.find(p => p.type === 'teleport_out' && p.x > this.playerX);
          }

          if (target) {
            this.playerX = target.x + target.width + 20;
            this.playerY = target.y + target.height / 2;
            this.cameraX = this.playerX - 280; // Instant camera catchup
            this.trail = []; // Clear trail to avoid visual glitch lines
            this.spawnPortalParticles(target);
          }
        }
        break;
      case 'teleport_out':
        // Do nothing on entry, it's an exit
        break;
    }
  }

  private updateBoss(dt: number, time: number) {
    if (!this.boss.active) return;

    // Simple state machine
    this.boss.attackTimer += dt;

    // Boss floats on the right of the screen
    this.boss.x = this.cameraX + 1000;
    this.boss.y = 360 + Math.sin(time * 0.5) * 100;

    // Projectile update
    for (let i = this.boss.projectiles.length - 1; i >= 0; i--) {
      const p = this.boss.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Collision check for projectiles
      const dist = Math.hypot(p.x - this.playerX, p.y - this.playerY);
      if (dist < 20 + this.playerSize) {
        this.die("보스 공격에 당했습니다!");
      }

      if (p.x < this.cameraX - 100) this.boss.projectiles.splice(i, 1);
    }

    // Attack logic
    if (this.boss.attackTimer > 3.0) {
      // Fire
      this.boss.projectiles.push({
        x: this.boss.x, y: this.boss.y,
        vx: -600, vy: (this.playerY - this.boss.y) * 2,
        type: 'missile'
      });
      this.boss.attackTimer = 0;
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
      case 'mini_green': return '#66ff66';
      case 'teleport_in': return '#00ffff';
      case 'teleport_out': return '#ff00ff';
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
      case 'mini_pink': return '◆';
      case 'mini_green': return '◇';
      case 'teleport_in': return 'IN';
      case 'teleport_out': return 'OUT';
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

    if (obs.type === 'slope') {
      // 새로운 코리도 삼각형 형태에 맞춤
      // angle > 0: (x, y+h) -> (x+w, y) -> (x, y) 왼쪽 하단 직각 (위쪽 슬로프 ◤)
      // angle < 0: (x+w, y+h) -> (x, y) -> (x+w, y) 오른쪽 하단 직각 (아래쪽 슬로프 ◥)
      const t = (x - obs.x) / obs.width;

      if (obsAngle > 0) {
        // 왼쪽 하단 직각: 빗변은 (x, y+h) -> (x+w, y)
        // Solid range is above diagonal
        const hypotenuseY = obsY + obs.height * (1 - t);
        return { top: obsY, bottom: hypotenuseY };
      } else {
        // 오른쪽 하단 직각: 빗변은 (x+w, y+h) -> (x, y) (TL to BR)
        // Solid range is above diagonal (Top-Right part matches rendering ◥)
        const hypotenuseY = obsY + obs.height * t;
        return { top: obsY, bottom: hypotenuseY };
      }
    }

    if (obs.type === 'triangle' || obs.type === 'steep_triangle') {
      // 바닥 경사면 ◢ (Right angle at Bottom-Right)
      // (x, y+h) -> (x+w, y+h) -> (x+w, y)
      // Solid range is below diagonal (TL to BR line is diagonal? No)
      // Vertices: BL(x, y+h), BR(x+w, y+h), TR(x+w, y).
      // Diagonal is BL to TR.
      // x connects to hypotenuse: hypotenuse goes from (x, y+h) to (x+w, y).
      const t = (x - obs.x) / obs.width;
      // At t=0 (x), y = y+h. At t=1 (x+w), y = y.
      const hypotenuseY = obsY + obs.height * (1 - t);
      // Solid part is BELOW hypotenuse (between hypotenuse and bottom)
      return { top: hypotenuseY, bottom: obsY + obs.height };
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
   * 전역 회전 지원: 플레이어 점들을 역회전시켜 AABB와 체크
   */
  private checkObstacleCollision(obs: Obstacle, px: number, py: number, pSize: number, simTime?: number, simSpeedMultiplier?: number): boolean {
    let obsY = obs.y;
    let obsAngle = obs.angle || 0;

    if (simTime !== undefined && obs.movement) {
      const state = this.getObstacleStateAt(obs, simTime);
      obsY = state.y;
      obsAngle = state.angle;
    }

    // --- Advanced Obstacle Logic (Pulsation & Orbits) ---
    // Effective size calculation for pulsation
    let effectiveWidth = obs.width;
    let effectiveHeight = obs.height;

    // Apply Pulsation (Mines)
    if (obs.type === 'mine' && obs.customData?.pulseSpeed) {
      const time = simTime || performance.now() / 1000;
      const speed = obs.customData.pulseSpeed || 2;
      const amount = obs.customData.pulseAmount || 0.2; // 20% variance
      const pulse = 1 + Math.sin(time * speed) * amount;
      effectiveWidth *= pulse;
      effectiveHeight *= pulse;
    }

    const minHitboxSize = 10;
    effectiveWidth = Math.max(effectiveWidth, minHitboxSize);
    effectiveHeight = Math.max(effectiveHeight, minHitboxSize);
    // Hitbox Reduction (Forgiveness)
    // 히트박스를 시각적 크기보다 약간 작게 만들어 판정을 관대하게 함
    // hitbox reduction 제거
    const hitboxReduction = 0; // Total reduction (2px per side)
    const planetReduction = 0; // More reduction for planets (circular shapes often feel wider)

    let reduction = hitboxReduction;
    if (obs.type === 'planet' || obs.type === 'star') reduction = planetReduction;

    effectiveWidth = Math.max(10, effectiveWidth - reduction);
    effectiveHeight = Math.max(10, effectiveHeight - reduction);

    const effectiveX = obs.x - (effectiveWidth - obs.width) / 2;
    const effectiveY = obsY - (effectiveHeight - obs.height) / 2;

    const isRotated = obsAngle !== 0;

    // 플레이어의 5개 점 (히트박스 정교화)
    const points = [
      { x: px - pSize, y: py - pSize },
      { x: px + pSize, y: py - pSize },
      { x: px - pSize, y: py + pSize },
      { x: px + pSize, y: py + pSize },
      { x: px, y: py }
    ];

    // --- Falling Spike Dynamic Logic (Validation Mode) ---
    // If simTime is provided (AI validation), calculate position deterministically
    // based on when the player WOULD have triggered it.
    if (obs.type === 'falling_spike' && simTime !== undefined) {
      // Trigger logic: Approaching within 150px
      const triggerX = obs.x - 150;

      // If player is past the trigger point
      if (px > triggerX) {
        // Estimate time since trigger
        // We don't have exact trigger time in simple check, but we can estimate:
        // time_elapsed = distance_past_trigger / current_speed (Approx)
        // For better accuracy in loop, we'd need tracked state, but let's use the passed time?
        // No, time is total time.

        // Heuristic: If we are close enough to trigger, it starts falling.
        // Gravity = 2500.
        // Max Speed consideration?
        // Let's assume constant speed for the short duration of the fall interaction ??
        // Or just use the distance difference and current velocity estimate.

        // In actual gameplay, updateMovingObstacles accumulates velocity.
        // y = y0 + 0.5 * g * t^2

        // How to map px to time?
        // In validation, we know `simTime`.
        // But we don't know `simTimeAtTrigger`.
        // Let's assume standard speed around this obstacle?
        // Or just simply: 
        // If we are past triggerX, calculate `dist = px - triggerX`.
        // `t = dist / (baseSpeed * speedMultiplier)` (assuming constant speed nearby)
        // This is "good enough" for generating a path that avoids it.

        // Find current speed multiplier (approximate or passed?)
        // checkObstacleCollision doesn't know current speed.
        // But `baseSpeed` is known.

        // Let's try to get speed multiplier from map config or average?
        // Actually, `simTime` is passed, but not speed.
        // Let's assume speed=1 speed if unknown, or try to infer.
        // Safe approach: assume fast fall (instant block?) No.

        // Let's use a standard speed estimation 
        const estimatedSpeed = this.baseSpeed * (simSpeedMultiplier !== undefined ? simSpeedMultiplier : (this.speedMultiplier || 1));
        // Note: this.speedMultiplier is the CURRENT engine state, which might differ from SearchState.
        // However, checkObstacleCollision is usually called within checkColl which doesn't pass speed.
        // Limitation accepted.

        const dist = Math.max(0, px - triggerX);
        const t = dist / estimatedSpeed;
        const drop = 0.5 * 2500 * t * t;

        obsY = (obs.initialY !== undefined ? obs.initialY : obs.y) + drop;

        // Optimization: If it fell out of screen, return false immediately?
        if (obsY > this.maxY + 100) return false;
      } else {
        obsY = obs.initialY !== undefined ? obs.initialY : obs.y;
      }
    }

    // --- Orbit Collision Check (Planet & Star) ---
    if (obs.type === 'planet' || obs.type === 'star') {
      const time = simTime || performance.now() / 1000;
      const cx = obs.x + obs.width / 2;
      const cy = obsY + obs.height / 2;

      // 1. Check Main Body (Ellipse Collision)
      const rx = effectiveWidth / 2;
      const ry = effectiveHeight / 2;
      const dx = px - cx;
      const dy = py - cy;
      // Ellipse formula with a bit of leniency (-2px)
      if ((dx * dx) / ((rx - 2) * (rx - 2)) + (dy * dy) / ((ry - 2) * (ry - 2)) < 1) return true;

      // 2. Check Orbiting Moons/Planets
      const hasChildren = obs.children && obs.children.length > 0;

      if (hasChildren) {
        // Use attached children as orbiting bodies
        const children = obs.children!;
        const speed = obs.customData?.orbitSpeed ?? 1.0;

        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (!child) continue;
          const theta = time * speed + (i * ((Math.PI * 2) / children.length));
          const dist = obs.customData?.orbitDistance ?? (obs.width * 0.85);

          const childX = cx + Math.cos(theta) * dist;
          const childY = cy + Math.sin(theta) * dist;

          // Check collision with Child (Planet)
          const childSize = child.width ? child.width / 2 : 14;
          const distToChildSq = (points[4].x - childX) ** 2 + (points[4].y - childY) ** 2;
          if (distToChildSq < (childSize + pSize - 2) ** 2) return true;

          // Check Child's Moons (Moon orbiting Planet)
          if (child.type === 'planet') {
            const moonCount = child.customData?.orbitCount ?? 2;
            const moonSpeed = child.customData?.orbitSpeed ?? 2.0;
            const moonDist = child.customData?.orbitDistance ?? (child.width * 0.8);

            for (let j = 0; j < moonCount; j++) {
              const mTheta = time * moonSpeed + (j * ((Math.PI * 2) / moonCount));
              const mx = childX + Math.cos(mTheta) * moonDist;
              const my = childY + Math.sin(mTheta) * moonDist;

              const distToMoonSq = (points[4].x - mx) ** 2 + (points[4].y - my) ** 2;
              if (distToMoonSq < (8 + pSize - 2) ** 2) return true;
            }
          }
        }

      } else {
        // Fallback: Abstract Orbit generation (Old Logic)
        const count = obs.customData?.orbitCount ?? (obs.type === 'star' ? 0 : 2); // Default 0 for star now if manual
        if (count === 0 && obs.type === 'star') {
          // No orbiters
        } else {
          const speed = obs.customData?.orbitSpeed ?? 1.0;
          const dist = obs.customData?.orbitDistance ?? (obs.width * 0.8);

          for (let i = 0; i < count; i++) {
            const theta = time * speed + (i * ((Math.PI * 2) / count));
            const mx = cx + Math.cos(theta) * dist;
            const my = cy + Math.sin(theta) * dist;

            // Moon size: Planet's moon is small, Star's planet is medium
            const moonRadius = obs.type === 'star' ? 20 : 10;

            // Moon collision
            const mDistSq = (points[4].x - mx) ** 2 + (points[4].y - my) ** 2;
            if (mDistSq < (moonRadius + pSize - 2) ** 2) return true;

            // Nested Orbit (Old Legacy logic, kept if needed but children logic supersedes)
            if (obs.type === 'star' && obs.customData?.nestedOrbit) {
              const subMoonCount = 2;
              const subDist = 25;
              const subSpeed = speed * 2.5;
              for (let j = 0; j < subMoonCount; j++) {
                const subTheta = time * subSpeed + (j * ((Math.PI * 2) / subMoonCount));
                const smx = mx + Math.cos(subTheta) * subDist;
                const smy = my + Math.sin(subTheta) * subDist;
                const smDistSq = (points[4].x - smx) ** 2 + (points[4].y - smy) ** 2;
                if (smDistSq < (8 + pSize - 2) ** 2) return true;
              }
            }
          }
        }
      }
      return false; // If passed all orbit checks
    }

    // 전역 회전 지원: 플레이어 점들을 장애물 중심 기준으로 역회전 시킴
    if (isRotated) {
      const cx = effectiveX + effectiveWidth / 2;
      const cy = effectiveY + effectiveHeight / 2;
      const rad = -obsAngle * Math.PI / 180;
      points.forEach(p => {
        const dx = p.x - cx;
        const dy = p.y - cy;
        p.x = cx + dx * Math.cos(rad) - dy * Math.sin(rad);
        p.y = cy + dx * Math.sin(rad) + dy * Math.cos(rad);
      });
    }

    // 이제 points는 회전되지 않은 장애물 좌표계에 있음
    // 1. AABB 체크 (회전된 경우에도 역회전 덕분에 가능)
    const isInsideAABB = points.some(p =>
      p.x >= effectiveX && p.x <= effectiveX + effectiveWidth &&
      p.y >= effectiveY && p.y <= effectiveY + effectiveHeight
    );
    if (!isInsideAABB && obs.type !== 'slope' && obs.type !== 'spike' && obs.type !== 'mini_spike') return false;

    // 2. 블록 타입 (역회전된 상태이므로 단순히 AABB 체크만으로 충분)
    if (obs.type === 'block') {
      return isInsideAABB;
    }

    // 3. Slope 타입 (삼각형) - 코리도 형성용
    if (obs.type === 'slope') {
      // angle > 0: 왼쪽 하단 직각 (x, y+h), (x+w, y), (x, y)
      // angle < 0: 오른쪽 하단 직각 (x+w, y+h), (x, y), (x+w, y)
      let tri: { x: number, y: number }[];

      if (obs.angle! > 0) {
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
        if (this.isPointInTriangle(p.x, p.y, tri[0]!.x, tri[0]!.y, tri[1]!.x, tri[1]!.y, tri[2]!.x, tri[2]!.y)) return true;
      }
      return false;
    }

    // 4. Triangle (Floor Slope ◢)
    if (obs.type === 'triangle' || obs.type === 'steep_triangle') {
      // Vertices: BL(x, y+h), BR(x+w, y+h), TR(x+w, y)
      const tri = [
        { x: effectiveX, y: effectiveY + effectiveHeight },
        { x: effectiveX + effectiveWidth, y: effectiveY + effectiveHeight },
        { x: effectiveX + effectiveWidth, y: effectiveY }
      ];
      for (const p of points) {
        if (this.isPointInTriangle(p.x, p.y, tri[0]!.x, tri[0]!.y, tri[1]!.x, tri[1]!.y, tri[2]!.x, tri[2]!.y)) return true;
      }
      return false;
    }

    // 5. 가시 (Spike)
    if (obs.type === 'spike' || obs.type === 'mini_spike') {
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

    // 5. 원형/타원형 장애물
    if (obs.type === 'saw' || obs.type === 'spike_ball' || obs.type === 'mine' || obs.type === 'orb') {
      const cx = effectiveX + effectiveWidth / 2;
      const cy = effectiveY + effectiveHeight / 2;
      const rx = (effectiveWidth / 2) * 0.9;
      const ry = (effectiveHeight / 2) * 0.9;
      for (const p of points) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        // Ellipse formula: (x/rx)^2 + (y/ry)^2 < 1
        if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) < 1) return true;
      }
      return false;
    }

    // 6. 레이저
    if (obs.type === 'laser') {
      const h = effectiveHeight * 0.4;
      const cy = effectiveY + effectiveHeight / 2;
      return points.some(p => p.x >= effectiveX && p.x <= effectiveX + effectiveWidth && p.y >= cy - h && p.y <= cy + h);
    }
    if (obs.type === 'v_laser' || obs.type === 'laser_beam') {
      const w = effectiveWidth * 0.4;
      const cx = effectiveX + effectiveWidth / 2;
      return points.some(p => p.y >= effectiveY && p.y <= effectiveY + effectiveHeight && p.x >= cx - w && p.x <= cx + w);
    }

    // New Obstacles Collision
    if (obs.type === 'hammer') {
      // Hammer head + handle? simpler: just circle at the end
      const cx = effectiveX + effectiveWidth / 2;
      const cy = effectiveY + effectiveHeight / 2;
      // Assuming it's a circle hazard for now
      return points.some(p => (p.x - cx) ** 2 + (p.y - cy) ** 2 < (effectiveWidth / 2) ** 2);
    }
    if (obs.type === 'falling_spike') {
      // Like spike but moving. checkObstacleCollision handles movement via getObstacleStateAt called at start
      // So shapes match 'spike' logic if type string was checked.
      // Reuse spike logic:
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
    if (['rotor', 'cannon', 'spark_mine', 'crusher_jaw', 'swing_blade'].includes(obs.type)) {
      // Generally ellipse or rect based hazards
      const cx = effectiveX + effectiveWidth / 2;
      const cy = effectiveY + effectiveHeight / 2;
      const rx = (effectiveWidth / 2) * 0.8;
      const ry = (effectiveHeight / 2) * 0.8;
      for (const p of points) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) < 1) return true;
      }
      return false;
    }
    if (obs.type === 'piston_v') {
      return isInsideAABB; // Rectangular crush
    }
    if (obs.type === 'growing_spike') {
      // Treat as spike
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

    if (obs.type === 'triangle' || obs.type === 'steep_triangle') {
      return [
        { x: obs.x, y: obs.y + obs.height }, // BL
        { x: obs.x + obs.width, y: obs.y + obs.height }, // BR
        { x: obs.x + obs.width, y: obs.y } // TR
      ];
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
    } else {
      // Implicit Animations (if no explicit movement set)
      if (['saw', 'rotor', 'spike_ball'].includes(obs.type)) {
        // Continuous Rotation
        const speed = 3; // rad/s approx 170 deg/s
        angle = ((time * speed) * 180 / Math.PI) % 360;
      } else if (['hammer', 'swing_blade'].includes(obs.type)) {
        // Pendulum Swing
        const speed = 3;
        const range = 60; // degrees
        angle = Math.sin(time * speed) * range;
      } else if (['piston_v', 'crusher_jaw'].includes(obs.type)) {
        // Up/Down Piston
        if (obs.initialY !== undefined) {
          const speed = 2;
          const range = 50;
          // Piston usually smashes down/up. Let's use simple sine for now.
          y = obs.initialY + Math.sin(time * speed) * range;
        }
      }
    }
    return { y, angle };
  }

  private updateMovingObstacles(dt: number, time: number) {
    for (const obs of this.obstacles) {
      // 1. Deterministic movement (Explicit OR Implicit)
      const hasImplicit = ['saw', 'rotor', 'spike_ball', 'hammer', 'swing_blade', 'piston_v', 'crusher_jaw'].includes(obs.type);

      if (obs.movement || hasImplicit) {
        const state = this.getObstacleStateAt(obs, time);
        // Only update Y if it's supposed to move vertically (preserve Y for pure rotators if getObstacleStateAt returns input Y)
        // Actually getObstacleStateAt returns current obs.y if no Y movement.
        // But for implicit rotators, getObstacleStateAt returns obs.y passed in.
        // If we assign back, it's a no-op, which is fine.
        // BUT `getObstacleStateAt` uses `obs.y` as base.
        // If we keep assigning, `obs.y` might drift if we had `y += ...` logic, but here we use `initialY`.
        // So we strictly need `initialY` for position animations.

        // Ensure initialY is set for position movers
        if ((hasImplicit || obs.movement?.type === 'updown') && obs.initialY === undefined) {
          obs.initialY = obs.y;
        }

        obs.y = state.y;
        obs.angle = state.angle;
      }

      // 2. Falling Spike Logic (Stateful)
      if (obs.type === 'falling_spike') {
        if (!obs.customData) obs.customData = {};

        // Initialize state if checking for the first time
        if (obs.customData.isFalling === undefined) {
          obs.customData.isFalling = false;
          obs.customData.vy = 0;
          // If initialY is not set by map data, capture it now
          if (obs.initialY === undefined) obs.initialY = obs.y;
        }

        const isFalling = obs.customData.isFalling;

        if (isFalling) {
          // Apply Gravity
          const gravity = 2500; // Falling acceleration
          obs.customData.vy = (obs.customData.vy || 0) + gravity * dt;
          obs.y += obs.customData.vy * dt;

          // Optional: Stop if hits floor? 
          // For now, let it fall through or clamp at maxY if desired.
          // Usually spikes fall off screen. 
        } else {
          // Check trigger
          // Trigger when player approaches
          const dist = obs.x - this.playerX;
          // Trigger range: 150px ahead to 50px behind (so you can't just stand under it safely)
          // Actually, standard is trigger when getting close. 
          if (dist < 150 && dist > -50) {
            obs.customData.isFalling = true;
            obs.customData.vy = 0; // Start with 0 velocity
          }
          // Maintain position
          if (obs.initialY !== undefined) obs.y = obs.initialY;
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
