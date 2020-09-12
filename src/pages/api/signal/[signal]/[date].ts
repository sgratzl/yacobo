import { withError } from '@/api/error';
import { sendFormat } from '@/api/format';
import { extractDate, extractFormat, extractSignal } from '@/api/validator';
import { createMap } from '@/charts';
import { fetchAllCounties, formatAPIDate } from '@/data';
import { NextApiRequest, NextApiResponse } from 'next';

export default withError(async (req: NextApiRequest, res: NextApiResponse) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);
  const signal = extractSignal(req);
  const data = await fetchAllCounties(signal.data, date);

  return sendFormat(req, res, format, data, {
    title: `${signal.id}-${formatAPIDate(date)}`,
    headers: ['region', 'value', 'stderr'],
    vega: () => createMap(signal, data),
  });
});
