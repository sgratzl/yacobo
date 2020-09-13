import { withMiddleware } from '@/api/middleware';
import { sendFormat } from '@/api/format';
import { extractDate, extractFormat, extractSignal } from '@/api/validator';
import { createMap } from '@/charts';
import { cacheMode, fetchAllCounties, formatAPIDate } from '@/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { regionByID } from '@/data/regions';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);
  const signal = extractSignal(req);
  const data = await fetchAllCounties(signal.data, date);

  return sendFormat(req, res, format, data, {
    title: `${signal.id}-${formatAPIDate(date)}`,
    headers: ['region', 'value', 'stderr'],
    vega: () => createMap(signal, data, req.query.size === 'large' ? 2 : 1),
    cache: cacheMode(date),
    regions: regionByID,
  });
});
