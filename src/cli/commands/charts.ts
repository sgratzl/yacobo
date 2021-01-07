import { fetchAllRegions, fetchSignalMeta, fetchSignalRegion } from '@/api/data';
import type { IRequestContext } from '@/api/middleware';
import { Redis } from '@/api/redis';
import { createMap } from '@/charts/map';
import { createVega } from '@/charts/vega';
import { formatAPIDate, formatLocal } from '@/common';
import { counties, historyRange, IDateValue, IRegion, ISignal, signals } from '@/model';
import { eachDayOfInterval } from 'date-fns';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { IVegaOptions } from '../../charts';
import { createSignalLineChart } from '../../charts/line';
import { imputeMissing, startOfISODate } from '@/common/parseDates';
import { write, IImageOptions } from '../vega';
import { concatPNGImages, IVideoOptions, stackVideos } from '../video';

export interface ICommonOptions {
  force?: boolean;
}

interface ILineOptions {
  skip?: boolean;
  local?: boolean;
}

function createVegaOptions(options: IImageOptions): IVegaOptions {
  const ctx: IRequestContext = {
    redis: new Redis(),
  };
  return {
    ctx,
    devicePixelRatio: 1,
    forImage: true,
    plain: false,
    scaleFactor: 1,
    ...options,
  };
}

function fpsSuffix(options: { fps?: number }) {
  if (options.fps == null || options.fps === 1) {
    return '';
  }
  return `_${options.fps}x`;
}

export async function runMap(signal: ISignal, date: Date, options: IImageOptions & ICommonOptions) {
  console.log('create map', signal.id, date);
  const file = `./data/${signal.id}_${formatAPIDate(date)}.png`;
  if (!options.force && existsSync(file)) {
    console.log('skip');
    return;
  }
  const vegaOptions = createVegaOptions(options);
  const data = await fetchAllRegions(vegaOptions.ctx, signal, date, 'county');
  const spec = await createMap(signal, date, data, vegaOptions);
  const view = await createVega(spec, false);
  await write(view, file, options);
  vegaOptions.ctx.redis.destroy();
  console.log('done');
}

export async function runMapHistory(signal: ISignal, options: IImageOptions & IVideoOptions & ICommonOptions) {
  console.log('create map', signal.id);
  const dates = eachDayOfInterval(historyRange());
  const vegaOptions = createVegaOptions(options);
  mkdirSync(`./data/${signal.id}`, {
    recursive: true,
  });

  // dummy with signals
  const spec = await createMap(signal, dates[0], [{ region: 'US' }], vegaOptions, true);
  const view = await createVega(spec, false, {
    title: 'Test',
  });

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const file = `./data/${signal.id}/${signal.id}_${i.toString().padStart(3, '0')}.png`;
    if (!options.force && existsSync(file)) {
      // console.log(formatAPIDate(date), 'skip');
      continue;
    }
    const data = await fetchAllRegions(vegaOptions.ctx, signal, date, 'county');
    // update view with data and title
    view.signal('title', `${signal.name} as of ${formatLocal(date)}`);
    view.change(
      'data',
      view
        .changeset()
        .remove(() => true)
        .insert(data)
    );
    await view.runAsync();
    console.log(formatAPIDate(date), data.length);
    await write(view, file, options);
  }

  vegaOptions.ctx.redis.destroy();
  console.log('create video');
  await concatPNGImages(
    resolve(process.cwd(), `data/${signal.id}/${signal.id}_%03d.png`),
    resolve(process.cwd(), `data/${signal.id}${fpsSuffix(options)}.mp4`),
    {
      ...options,
      size: [600 * (options.devicePixelRatio ?? 1), 330 * (options.devicePixelRatio ?? 1)],
    }
  );
}

export async function runMapHistoryAll(options: IImageOptions & IVideoOptions & ICommonOptions) {
  for (const s of signals) {
    await runMapHistory(s, options);
  }
  console.log('create stacked video');
  await stackVideos(
    signals.map((signal) => `data/${signal.id}${fpsSuffix(options)}.mp4`),
    `data/combined${fpsSuffix(options)}.mp4`
  );
}

export async function runLine(
  signal: ISignal,
  region: IRegion,
  options: IImageOptions & ICommonOptions & ILineOptions
) {
  console.log('create line', signal.id, region.name);
  const file = `./data/${region.id}_${signal.id}.png`;
  if (!options.force && existsSync(file)) {
    console.log('skip');
    return;
  }
  const vegaOptions = createVegaOptions(options);
  const data = await fetchSignalRegion(vegaOptions.ctx, signal, region, historyRange());
  const spec = await createSignalLineChart(region, signal, data, vegaOptions, false, options.local);
  const view = await createVega(spec, false);
  await write(view, file, options);
  vegaOptions.ctx.redis.destroy();
  console.log('done');
}

export async function runLineRegions(
  signal: ISignal,
  options: IImageOptions & IVideoOptions & ICommonOptions & ILineOptions
) {
  console.log('create line regions', signal.id);
  const vegaOptions = createVegaOptions(options);
  mkdirSync(`./data/${signal.id}_regions`, {
    recursive: true,
  });
  const meta = await fetchSignalMeta(vegaOptions.ctx, signal);
  const dates = eachDayOfInterval(options.local ? { start: meta.minTime, end: meta.maxTime } : historyRange());

  // dummy with signals
  const spec = await createSignalLineChart(counties[0], signal, [], vegaOptions, true, options.local ?? false);
  const view = await createVega(spec, false, {
    title: 'Test',
  });

  const lookup = new Map<string, IDateValue[]>();

  const buildData = async () => {
    counties.forEach((county) => lookup.set(county.id, []));

    // load all data since we have those data in the cache
    for (const date of dates) {
      const data = await fetchAllRegions(vegaOptions.ctx, signal, date, 'county');
      for (const row of data) {
        if (lookup.has(row.region)) {
          lookup.get(row.region)!.push({
            ...row,
            date,
          });
        }
      }
    }
  };

  for (let i = 0; i < counties.length; i++) {
    const region = counties[i];
    const file = `./data/${signal.id}_regions/${i.toString().padStart(4, '0')}.png`;
    if (!options.force && existsSync(file)) {
      // console.log(region.id, 'skip');
      continue;
    }
    if (lookup.size === 0) {
      await buildData();
    }
    const data = lookup.get(region.id)! || [];
    if (options.skip && data.length === 0) {
      continue;
    }
    // prepare data
    const full = imputeMissing(data, {}).map((d) => ({ ...d, date: startOfISODate(d.date).valueOf() }));
    // update view with data and title
    view.signal('title', `${region.name} - ${signal.name}`);
    view.change(
      'data',
      view
        .changeset()
        .remove(() => true)
        .insert(full)
    );
    // console.log(region.id, data.length);
    await write(view, file, options);
  }

  vegaOptions.ctx.redis.destroy();
  console.log('create video');
  await concatPNGImages(
    resolve(process.cwd(), `data/${signal.id}_regions/%04d.png`),
    resolve(process.cwd(), `data/${signal.id}_regions${fpsSuffix(options)}.mp4`),
    {
      ...options,
      size: [460 * (options.devicePixelRatio ?? 1), 270 * (options.devicePixelRatio ?? 1)],
    }
  );
}

export async function runLineRegionsAll(options: IImageOptions & IVideoOptions & ICommonOptions & ILineOptions) {
  for (const s of signals) {
    await runLineRegions(s, options);
  }
  console.log('create stacked video');
  await stackVideos(
    signals.map((signal) => `data/${signal.id}_regions${fpsSuffix(options)}.mp4`),
    `data/combined_regions${fpsSuffix(options)}.mp4`
  );
}
