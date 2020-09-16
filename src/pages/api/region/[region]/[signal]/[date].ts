import { withMiddleware } from '@/api/middleware';
import { extractFormat, sendFormat } from '@/api/format';
import { extractDate, extractRegion, extractSignal } from '@/common/validator';
import { fetchSignalRegion } from '@/api/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { formatAPIDate } from '@/common';
import { signalByID } from '@/model/signals';
import { estimateCacheDuration } from '@/api/model';

export default withMiddleware((req: NextApiRequest, res: NextApiResponse) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);
  const signal = extractSignal(req);
  const region = extractRegion(req);
  const data = () => fetchSignalRegion(signal.data, region, date);
  return sendFormat(req, res, format, data, {
    title: `${region.name}-${signal.id}-${formatAPIDate(date)}`,
    headers: ['value', 'stderr'],
    cache: estimateCacheDuration(date),
    signals: signalByID.bind(signalByID),
  });
});
