import { csvFormat } from 'd3-dsv';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ICommonOptions } from '../format';
import { setCommonHeaders } from './setCommonHeaders';

// eslint-disable-next-line @typescript-eslint/ban-types
export default function sendCSV<T extends object>(
  req: NextApiRequest,
  res: NextApiResponse,
  data: T[],
  headers: (keyof T)[],
  options: ICommonOptions
) {
  setCommonHeaders(req, res, options, 'csv');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.send(csvFormat(data, headers));
  res.end();
}
