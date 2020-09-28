import { createMap } from '@/charts/map';
import { fetchAllRegions } from '@/api/data';
import { historyRange, ISignal } from '@/model';
import type { IRequestContext } from '@/api/middleware';
import { Redis } from '@/api/redis';
import { createCanvas, createVega } from '@/charts/vega';
import { createWriteStream } from 'fs';
import { formatAPIDate } from '@/common';
import { eachDayOfInterval } from 'date-fns';
import type { View } from 'vega';
import { concatPNGImages } from '../video';
import { resolve } from 'path';
import { mkdirSync } from 'fs';

export interface IImageOptions {
  plain?: boolean;
  scaleFactor?: number;
  devicePixelRatio?: number;
}

async function write(view: View, options: IImageOptions, file: string) {
  const canvas = await createCanvas(view, options.devicePixelRatio ?? 1, false);
  const out = createWriteStream(`./data/${file}.png`);
  return await new Promise((resolve) => {
    canvas.createPNGStream().pipe(out).on('finish', resolve);
  });
}

export async function run(signal: ISignal, date: Date, options: IImageOptions) {
  console.log('create map', signal.id, date);
  const ctx: IRequestContext = {
    redis: new Redis(),
  };
  const data = await fetchAllRegions(ctx, signal, date, 'county');
  const spec = await createMap(signal, date, data, {
    ctx,
    devicePixelRatio: 1,
    forImage: true,
    plain: false,
    scaleFactor: 1,
    ...options,
  });
  const view = await createVega(spec, false);
  await write(view, options, `${signal.id}_${formatAPIDate(date)}`);
  ctx.redis.destroy();
  console.log('done');
}

export async function runHistory(signal: ISignal, options: IImageOptions) {
  console.log('create map', signal.id);
  const ctx: IRequestContext = {
    redis: new Redis(),
  };
  const dates = eachDayOfInterval(historyRange());
  const spec = await createMap(signal, new Date(), [{ region: 'US', value: 0 }], {
    ctx,
    devicePixelRatio: 1,
    forImage: true,
    plain: true,
    scaleFactor: 1,
    ...options,
  });
  const view = await createVega(spec, false);

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const data = await fetchAllRegions(ctx, signal, date, 'county');
    console.log(data.length);
    await view
      .change(
        'data',
        view
          .changeset()
          .remove(() => true)
          .insert(data)
      )
      .runAsync();
    mkdirSync(`./data/${signal.id}`, {
      recursive: true,
    });
    await write(view, options, `${signal.id}/${signal.id}_${i.toString().padStart(3, '0')}`);
  }

  ctx.redis.destroy();
  console.log('done');
  await concatPNGImages(
    resolve(process.cwd(), `data/${signal.id}/${signal.id}_%03d.png`),
    resolve(process.cwd(), `data/${signal.id}.mp4`)
  );
}
