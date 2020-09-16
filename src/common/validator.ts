import { parseISO } from 'date-fns';
import { CustomHTTPError } from './error';
import { regionByID, signalByID } from '../model';

export interface IRouterLike {
  query: { [key: string]: string | string[] | undefined };
}

export function extractSignal(res: string | IRouterLike) {
  const querySignal = typeof res === 'string' ? res : (res.query.signal as string);
  const signal = signalByID(querySignal);
  if (!signal) {
    throw new CustomHTTPError(400, `signal "${querySignal}" not found`);
  }
  return signal;
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
