import { NextApiRequest, NextApiResponse } from 'next';
import { TopLevelSpec } from 'vega-lite';
import { CacheDuration } from '../data/constants';
import { ISignal } from '../data/signals';
import { IRegion } from '../data/regions';
import { IVegaOptions } from '@/charts';
import sendCSV from './send/sendCSV';
import sendJSON from './send/sendJSON';
import sendVega from './send/sendVega';

export enum Formats {
  png = 'png',
  svg = 'svg',
  json = 'json',
  csv = 'csv',
  vg = 'vg',
}

export interface ICommonOptions {
  title: string;
  cache?: CacheDuration;
  signals?: (signal: string) => ISignal | undefined;
  regions?: (region: string) => IRegion;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export async function sendFormat<T extends object>(
  req: NextApiRequest,
  res: NextApiResponse,
  format: Formats,
  data: () => Promise<T[]>,
  options: ICommonOptions & {
    headers: (keyof T)[];
    vega?: (data: T[] | undefined, options: IVegaOptions) => TopLevelSpec | Promise<TopLevelSpec>;
  }
) {
  if (format === Formats.csv) {
    return sendCSV(req, res, await data(), options.headers, options);
  }
  if (format === Formats.json) {
    return sendJSON(req, res, await data(), options);
  }
  // vega like
  if (!options.vega) {
    return res.status(404).json({ message: 'image formats not available' });
  }
  return sendVega(req, res, format, data, options.vega, options);
}
