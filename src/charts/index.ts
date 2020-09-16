import { IRequestContext } from '@/api/middleware';

export const font = `Roboto`;

export interface IVegaOptions {
  scaleFactor: number;
  details: boolean;
  devicePixelRatio: number;
  ctx: IRequestContext;
}
