import type { NextApiRequest, NextApiResponse } from 'next';
import type { ICommonOptions } from '../format';
import { setCommonHeaders } from './setCommonHeaders';

// eslint-disable-next-line @typescript-eslint/ban-types
export default function sendJSON<T extends object>(
  req: NextApiRequest,
  res: NextApiResponse,
  data: T[],
  options: ICommonOptions
) {
  setCommonHeaders(req, res, options, 'json');
  res.json(data);
}
