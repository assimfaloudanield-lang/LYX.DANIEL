export interface StarParticle {
  x: number;
  y: number;
  baseRadius: number;
  radius: number;
  angle: number;
  distance: number;
  speed: number;
  armOffset: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  size: number;
  vx: number;
  vy: number;
  pulsePhase: number;
}

export interface TouchTrailPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

