import { withMiddleware } from '@/api/middleware';
import { sendFormat } from '@/api/format';
import { extractDate, extractFormat, extractSignal } from '@/api/validator';
import { createMap } from '@/charts';
import { fetchAllCounties, formatAPIDate, LATEST } from '@/data';
import { differenceInDays } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);
  const signal = extractSignal(req);
  const data = await fetchAllCounties(signal.data, date);

  return sendFormat(req, res, format, data, {
    title: `${signal.id}-${formatAPIDate(date)}`,
    headers: ['region', 'value', 'stderr'],
    vega: () => createMap(signal, data),
    shortCache: differenceInDays(date, LATEST) < 2,
  });
});
