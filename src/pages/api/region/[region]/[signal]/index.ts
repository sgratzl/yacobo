import { withMiddleware } from '@/api/middleware';
import { sendFormat } from '@/api/format';
import { extractFormat, extractRegion, extractSignal } from '@/api/validator';
import { createLineChart } from '@/charts';
import { EARLIEST, fetchSignalRegion } from '@/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { endOfToday } from 'date-fns';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  const { param: signal, format } = extractFormat(req, 'signal', extractSignal);
  const region = extractRegion(req);
  const data = await fetchSignalRegion(signal.data, region, [EARLIEST, endOfToday()]);

  return sendFormat(req, res, format, data, {
    title: `${signal.id}-${region.name}`,
    headers: ['date', 'value', 'stderr'],
    vega: (data) => createLineChart(signal, data, req.query.size === 'large' ? 2 : 1),
    cache: 'short',
  });
});
