import { createMap } from '@/charts/map';
import { fetchAllRegions } from '@/api/data';
import { refSignal } from '@/model';
import type { IRequestContext } from '@/api/middleware';
import { Redis } from '@/api/redis';
import { createCanvas, createVega } from '@/charts/vega';
import { createWriteStream } from 'fs';

const ctx: IRequestContext = {
  redis: new Redis(),
};

export async function run() {
  console.log('start creating image');
  const date = new Date(2020, 6, 1);
  const data = await fetchAllRegions(ctx, refSignal, date, 'county');
  const spec = await createMap(refSignal, date, data, {
    ctx,
    devicePixelRatio: 1,
    forImage: true,
    plain: true,
    scaleFactor: 1,
  });
  const view = await createVega(spec, false);
  const canvas = await createCanvas(view, 1, false);
  canvas.createPNGStream().pipe(createWriteStream('./test.png'));
  console.log('done');
}
