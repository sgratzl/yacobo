import { IRequestContext, withMiddleware } from '@/api/middleware';
import { sendFormat, extractFormat } from '@/api/format';
import { extractRegion, extractSignal } from '@/common/validator';
import { createSignalLineChart } from '@/charts/line';
import { fetchSignalRegion } from '@/api/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { endOfToday, startOfDay } from 'date-fns';
import { CacheDuration } from '@/api/model';

export default withMiddleware((req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: signal, format } = extractFormat(req, 'signal', extractSignal);
  const region = extractRegion(req);
  const data = () => fetchSignalRegion(ctx, signal.data, region, [startOfDay(new Date(2020, 1, 1)), endOfToday()]);

  return sendFormat(req, res, ctx, format, data, {
    title: `${signal.id}-${region.name}`,
    headers: ['date', 'value', 'stderr'],
    vega: createSignalLineChart.bind(null, signal),
    cache: CacheDuration.short,
  });
});
