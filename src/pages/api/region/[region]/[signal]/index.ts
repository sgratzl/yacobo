import { withMiddleware } from '@/api/middleware';
import { sendFormat } from '@/api/format';
import { extractFormat, extractRegion, extractSignal } from '@/api/validator';
import { createLineChart } from '@/charts';
import { fetchSignalRegion } from '@/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { endOfToday, startOfDay } from 'date-fns';
import { CacheDuration } from '@/data/constants';

export default withMiddleware((req: NextApiRequest, res: NextApiResponse) => {
  const { param: signal, format } = extractFormat(req, 'signal', extractSignal);
  const region = extractRegion(req);
  const data = () => fetchSignalRegion(signal.data, region, [startOfDay(new Date(2020, 1, 1)), endOfToday()]);

  return sendFormat(req, res, format, data, {
    title: `${signal.id}-${region.name}`,
    headers: ['date', 'value', 'stderr'],
    vega: createLineChart.bind(null, signal),
    cache: CacheDuration.short,
  });
});
