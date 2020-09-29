import { fetchAllRegions, fetchMeta } from '@/api/data';
import type { IRequestContext } from '@/api/middleware';
import { Redis } from '@/api/redis';
import { getColorScale, signalByID, getValueDomain, historyRange, counties } from '@/model';
import { createCanvas } from 'canvas';
import { eachDayOfInterval } from 'date-fns';
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
  const scales = signals.map((s) => getColorScale(s.signal, s.meta));
  // create a color scale lookup texture
  const canvas = createCanvas(256 * dpr, signals.length * dpr);
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

export async function heatmap(options: IImageOptions) {
  const ctx: IRequestContext = {
    redis: new Redis(),
  };
  const dpr = options.devicePixelRatio ?? 1;

  const signals = (await fetchMeta(ctx)).map((s) => ({ meta: s, signal: signalByID(s.signal)! }));
  const dates = eachDayOfInterval(historyRange());
  const countyToIndex = new Map(counties.map((d, i) => [d.id, i]));

  // create a color scale lookup texture
  const canvas = createCanvas(signals.length * dates.length * dpr, counties.length * dpr);
  const c = canvas.getContext('2d');
  c.fillStyle = 'white';
  c.fillRect(0, 0, c.canvas.width, c.canvas.height);
  const encoded = createCanvas(signals.length * dates.length * dpr, counties.length * dpr);
  const c_enc = encoded.getContext('2d');
  c_enc.fillStyle = 'black';
  c_enc.fillRect(0, 0, c.canvas.width, c.canvas.height);

  for (let s = 0; s < signals.length; s++) {
    const signal = signals[s];
    const scale = getColorScale(signal.signal, signal.meta);
    const byte = rescaleByte(getValueDomain(signal.signal, signal.meta));

    let j = s * dates.length;
    for (const date of dates) {
      const data = await fetchAllRegions(ctx, signal.signal, date, 'county');
      for (const row of data) {
        if (countyToIndex.has(row.region) && row.value != null) {
          const i = countyToIndex.get(row.region)!;
          c.fillStyle = scale(row.value);
          c.fillRect(j * dpr, i * dpr, dpr, dpr);

          const v = byte(row.value);
          c_enc.fillStyle = `rgb(${v},${v},${v})`;
          c_enc.fillRect(j * dpr, i * dpr, dpr, dpr);
        }
      }
      j++;
    }
  }
  await new Promise((resolve) => {
    const out = createWriteStream(`./data/heatmap.png`);
    canvas.createPNGStream().pipe(out).on('finish', resolve);
  });
  // need to manually convert to grey scale without alpha channel
  await new Promise((resolve) => {
    const outEncoded = createWriteStream(`./data/heatmap_enc.png`);
    encoded.createPNGStream().pipe(outEncoded).on('finish', resolve);
  });

  ctx.redis.destroy();
}
