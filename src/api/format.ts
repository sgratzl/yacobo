import type { NextApiRequest, NextApiResponse } from 'next';
import { CustomHTTPError } from '../common/error';
import type { IRouterLike } from '../common/validator';
import type { ITripleValue } from '../model';
import type { IRequestContext } from './middleware';
import type { CacheDuration } from './model';
import { injectCustomDetails, injectDetails } from './send/injectDetails';
import sendCSV from './send/sendCSV';
import sendJSON from './send/sendJSON';
import sendSQL from './send/sendSQL';
import sendVega, { IMultiVegaFactory, IVegaFactory } from './send/sendVega';

export enum Formats {
  png = 'png',
  svg = 'svg',
  json = 'json',
  csv = 'csv',
  vg = 'vg',
  jpg = 'jpg',
  pdf = 'pdf',
  sql = 'sql',
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
  constantFields: { date?: Date; signal?: string; region?: string };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export async function sendFormat<T extends ITripleValue>(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: IRequestContext,
  format: Formats,
  loadData: () => Promise<T[]>,
  options: ICommonOptions & {
    vega?: IVegaFactory<T> | IMultiVegaFactory<T>;
  }
) {
  if (format === Formats.csv || format === Formats.json || format === Formats.sql) {
    let data = await loadData();
    let headers: (keyof T)[] = ['value', 'stderr'];

    if (req.query.plain == null && format !== Formats.sql) {
      // details
      const r = injectDetails(data, options.constantFields);
      data = r.data;
      headers = r.headers as (keyof T)[];
    } else {
      const dynamicFields = (['region', 'signal', 'date'] as const).filter((d) => options.constantFields[d] != null);
      headers = [dynamicFields, headers].flat();
    }
    if (format === Formats.csv) {
      return sendCSV(req, res, data, headers as (keyof T)[], options);
    } else if (format === Formats.sql) {
      return sendSQL(req, res, data, options);
    }
    return sendJSON(req, res, data, options);
  }
  // vega like
  if (!options.vega) {
    return res.status(404).json({ message: 'image formats not available' });
  }
  return sendVega(req, res, ctx, format, loadData, options.vega, options);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export async function sendCustomFormat<T extends object>(
  req: NextApiRequest,
  res: NextApiResponse,
  format: Formats,
  loadData: () => Promise<T[]>,
  options: ICommonOptions & {
    headers: (keyof T)[];
  }
) {
  if (format === Formats.csv || format === Formats.json) {
    let data = await loadData();
    let headers = options.headers;

    if (req.query.plain == null) {
      // details
      const r = injectCustomDetails(data, options.headers);
      data = r.data;
      headers = r.headers as (keyof T)[];
    }
    if (format === Formats.csv) {
      return sendCSV(req, res, data, headers as (keyof T)[], options);
    }
    return sendJSON(req, res, data, options);
  }
  // vega like
  return res.status(404).json({ message: 'image formats not available' });
}
