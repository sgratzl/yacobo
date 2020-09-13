import { parseISO } from 'date-fns';
import { CustomHTTPError } from './error';
import { signalByID } from '../data/constants';
import { regionByID } from '../data/regions';

interface IRouterLike {
  query: { [key: string]: string | string[] | undefined };
}

export function extractSignal(res: string | IRouterLike) {
  const querySignal = typeof res === 'string' ? res : (res.query.signal as string);
  const signal = signalByID.get(querySignal);
  if (!signal) {
    throw new CustomHTTPError(400, `signal "${querySignal}" not found`);
  }
  return signal;
}

export enum Formats {
  png = 'png',
  svg = 'svg',
  json = 'json',
  csv = 'csv',
}

export function extractFormat<S extends string, V>(res: IRouterLike, key: S, resolver: (value: string) => V) {
  const param = res.query[key] as string;
  if (!param) {
    throw new CustomHTTPError(400, `missing ${key}`);
  }
  const d = param.lastIndexOf('.');
  if (d < 0) {
    return {
      param: resolver(param),
      format: Formats.json,
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

export function extractRegion(res: string | IRouterLike) {
  const region = typeof res === 'string' ? res : (res.query.region as string);
  if (!region) {
    throw new CustomHTTPError(400, `region "${region}" missing`);
  }
  return regionByID(region);
}

export function extractDate(res: string | IRouterLike) {
  const queryDate = typeof res === 'string' ? res : (res.query.date as string);
  const date = parseISO(queryDate);
  if (!date || Number.isNaN(date.getTime())) {
    throw new CustomHTTPError(400, `bad date "${queryDate}"`);
  }
  return date;
}
