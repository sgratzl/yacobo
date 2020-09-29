import { fetchMeta } from '@/api/data';
import type { IRequestContext } from '@/api/middleware';
import { Redis } from '@/api/redis';
import { getColorScale, signalByID, getValueDomain } from '@/model';
import { createCanvas } from 'canvas';
import { createWriteStream } from 'fs';
import type { IImageOptions } from '../vega';

export function rescaleByte(domain: [number, number]) {
  const max = domain[1];
  // 0 ... 255 byte range
  // 0 ... missing
  // 1 ... 255 value
  // 0 ... 254
  return (v?: number | null) => {
    if (v == null || Number.isNaN(v)) {
      return 0;
    }
    return 1 + Math.round((254 * v) / max);
  };
}

export async function colorScaleTexture(options: IImageOptions) {
  const ctx: IRequestContext = {
    redis: new Redis(),
  };
  const dpr = options.devicePixelRatio ?? 1;

  const signals = (await fetchMeta(ctx)).map((s) => ({ meta: s, signal: signalByID(s.signal)! }));

  const domains = signals.map((s) => getValueDomain(s.signal, s.meta));
  // create a color scale lookup texture
  const canvas = createCanvas(256 * dpr, signals.length * dpr);
  const scales = signals.map((s) => getColorScale(s.signal, s.meta));
  const c = canvas.getContext('2d');

  // missing value
  c.fillStyle = 'transparent';
  c.fillRect(0, 0, dpr, signals.length * dpr);

  scales.forEach((scale, j) => {
    const s = domains[j][1] / 255;
    for (let i = 0; i < 255; i++) {
      const color = scale(s * i);
      c.fillStyle = color;
      c.fillRect(i + 1, j, dpr, dpr);
    }
  });

  const out = createWriteStream('./data/colorScales.png');
  await new Promise((resolve) => {
    canvas.createPNGStream().pipe(out).on('finish', resolve);
  });

  ctx.redis.destroy();
}
