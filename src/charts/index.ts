import { IRequestContext } from '@/api/middleware';

export const font = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`;

export interface IVegaOptions {
  scaleFactor: number;
  details: boolean;
  devicePixelRatio: number;
  ctx: IRequestContext;
}
