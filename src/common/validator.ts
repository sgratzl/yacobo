import { parseISO } from 'date-fns';
import { CustomHTTPError } from './error';
import { COMPARE_COLORS, regionByID, signalByID } from '../model';

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

export function extractRegions(res: string | IRouterLike) {
  const regions = typeof res === 'string' ? res : (res.query.regions as string);
  if (!regions) {
    throw new CustomHTTPError(400, `regions "${regions}" missing`);
  }
  const regionObjects = regions.split(',').map(regionByID);
  if (regionObjects.length === 0 || regionObjects.some((d) => d == null)) {
    throw new CustomHTTPError(400, `regions "${regions}" missing or some are not valid`);
  }
  if (regionObjects.length > COMPARE_COLORS.length) {
    throw new CustomHTTPError(400, `regions "${regions}" at most ${COMPARE_COLORS.length} values`);
  }
  return regionObjects;
}

export function extractDate(res: string | IRouterLike) {
  const queryDate = typeof res === 'string' ? res : (res.query.date as string);
  const date = parseISO(queryDate);
  if (!date || Number.isNaN(date.valueOf())) {
    throw new CustomHTTPError(400, `bad date "${queryDate}"`);
  }
  return date;
}

export function extractDateOrMagic(res: string | IRouterLike) {
  const queryDate = typeof res === 'string' ? res : (res.query.date as string);
  if (queryDate === 'latest') {
    return 'latest';
  }
  if (queryDate === 'earliest') {
    return 'earliest';
  }
  return extractDate(res);
}
