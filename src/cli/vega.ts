import { createCanvas } from '@/charts/vega';
import { createWriteStream } from 'fs';
import type { View } from 'vega';
export interface IImageOptions {
  plain?: boolean;
  scaleFactor?: number;
  devicePixelRatio?: number;
}

export async function write(view: View, file: string, options: IImageOptions) {
  const canvas = await createCanvas(view, options.devicePixelRatio ?? 1, false);
  const out = createWriteStream(file);
  return await new Promise((resolve) => {
    canvas.createPNGStream().pipe(out).on('finish', resolve);
  });
}
