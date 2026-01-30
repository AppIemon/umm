export type ObstacleType = 'spike' | 'block' | 'saw' | 'mini_spike' | 'laser' | 'spike_ball' | 'v_laser' | 'mine' | 'orb' | 'slope' | 'triangle' | 'steep_triangle' | 'piston_v' | 'falling_spike' | 'hammer' | 'rotor' | 'cannon' | 'spark_mine' | 'laser_beam' | 'crusher_jaw' | 'swing_blade' | 'growing_spike' | 'planet' | 'star' | 'invisible_wall' | 'fake_block' | 'moon';
export type PortalType = 'gravity_yellow' | 'gravity_blue' | 'speed_0.25' | 'speed_0.5' | 'speed_1' | 'speed_2' | 'speed_3' | 'speed_4' | 'mini_pink' | 'mini_green' | 'teleport_in' | 'teleport_out';

export interface ObstacleMovement {
  type: 'updown' | 'rotate';
  range: number;
  speed: number;
  phase: number;
}
