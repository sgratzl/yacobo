import { withMiddleware } from '@/api/middleware';
import { sendFormat } from '@/api/format';
import { extractDate, extractFormat, extractRegion, extractSignal } from '@/api/validator';
import { estimateCacheDuration, fetchSignalRegion } from '@/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { formatISODate } from '@/ui/utils';
import { signalByID } from '@/data/signals';

export default withMiddleware((req: NextApiRequest, res: NextApiResponse) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);
  const signal = extractSignal(req);
  const region = extractRegion(req);
  const data = () => fetchSignalRegion(signal.data, region, date);
  return sendFormat(req, res, format, data, {
    title: `${region.name}-${signal.id}-${formatISODate(date)}`,
    headers: ['value', 'stderr'],
    cache: estimateCacheDuration(date),
    signals: signalByID.bind(signalByID),
  });
});
