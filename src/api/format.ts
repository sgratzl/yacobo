import { IVegaOptions } from '@/charts';
import { NextApiRequest, NextApiResponse } from 'next';
import { TopLevelSpec } from 'vega-lite';
import { CustomHTTPError } from '../common/error';
import { IRouterLike } from '../common/validator';
import { IRegion, ISignal } from '../model';
import { IRequestContext } from './middleware';
import { CacheDuration } from './model';
import sendCSV from './send/sendCSV';
import sendJSON from './send/sendJSON';
import sendVega from './send/sendVega';

export enum Formats {
  png = 'png',
  svg = 'svg',
  json = 'json',
  csv = 'csv',
  vg = 'vg',
  jpg = 'jpg',
  pdf = 'pdf',
}

export function extractFormat<S extends string, V>(
  res: IRouterLike,
  key: S,
  resolver: (value: string) => V,
  defaultFormat = Formats.json
) {
  const param = res.query[key] as string;
  if (!param) {
    throw new CustomHTTPError(400, `missing ${key}`);
  }
  const d = param.lastIndexOf('.');
  if (d < 0) {
    return {
      param: resolver(param),
      format: defaultFormat,
    };
  }
  const format = Formats[(param.slice(d + 1) as unknown) as keyof typeof Formats] as Formats;
  if (!format) {
    throw new CustomHTTPError(
      400,
      `invalid format "${param.slice(d + 1)}", supported: ${Object.keys(Formats).join(',')}`
    );
  }
  return {
    param: resolver(param.slice(0, d)),
    format,
  };
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
  ctx: IRequestContext,
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
  return sendVega(req, res, ctx, format, data, options.vega, options);
}
