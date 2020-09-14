import { withMiddleware } from '@/api/middleware';
import { sendFormat } from '@/api/format';
import { extractDate, extractFormat, extractRegion } from '@/api/validator';
import { cacheMode, fetchRegion } from '@/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { formatISODate } from '@/ui/utils';
import { signalByID } from '@/data/constants';

export default withMiddleware((req: NextApiRequest, res: NextApiResponse) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);
  const region = extractRegion(req);
  const data = () => fetchRegion(region, date);
  return sendFormat(req, res, format, data, {
    title: `${region.name}-${formatISODate(date)}`,
    headers: ['signal', 'value', 'stderr'],
    cache: cacheMode(date),
    signals: signalByID.get.bind(signalByID),
  });
});
