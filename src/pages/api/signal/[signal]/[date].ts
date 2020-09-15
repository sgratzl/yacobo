import { withMiddleware } from '@/api/middleware';
import { sendFormat } from '@/api/format';
import { extractDate, extractFormat, extractSignal } from '@/api/validator';
import { createMap } from '@/charts/map';
import { estimateCacheDuration, fetchAllRegions, formatAPIDate } from '@/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { regionByID } from '@/data/regions';

export default withMiddleware((req: NextApiRequest, res: NextApiResponse) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);
  const signal = extractSignal(req);
  const data = () => fetchAllRegions(signal.data, date);

  return sendFormat(req, res, format, data, {
    title: `${signal.id}-${formatAPIDate(date)}`,
    headers: ['region', 'value', 'stderr'],
    vega: createMap.bind(null, signal),
    cache: estimateCacheDuration(date),
    regions: regionByID,
  });
});
