import type { IRequestContext } from '@/api/middleware';

export const font = `Roboto, Arial, sans-serif`;

export interface IVegaOptions {
  scaleFactor: number;
  details: boolean;
  devicePixelRatio: number;
  ctx: IRequestContext;
  forImage: boolean;
  highlight?: string;
}
