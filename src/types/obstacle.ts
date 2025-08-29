// src/types/obstacle.ts
export type Obstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: string;
  position?: { x: number; y: number };
};