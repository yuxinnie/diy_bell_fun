export enum AppState {
  IDLE = 'IDLE',
  TRIGGERED = 'TRIGGERED',
  CELEBRATING = 'CELEBRATING',
}

export interface CelebrationConfig {
  text: string;
}

export interface MotionEvent {
  detected: boolean;
  velocity: number;
}