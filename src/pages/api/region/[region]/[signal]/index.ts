import { IRequestContext, withMiddleware } from '@/api/middleware';
import { sendFormat, extractFormat } from '@/api/format';
import { extractRegion, extractSignal } from '@/common/validator';
import { createSignalLineChart } from '@/charts/line';
import { fetchSignalRegion } from '@/api/data';
import type { NextApiRequest, NextApiResponse } from 'next';
import { CacheDuration } from '@/api/model';
import { historyRange } from '@/model';

export default withMiddleware((req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: signal, format } = extractFormat(req, 'signal', extractSignal);
  const region = extractRegion(req);
  const data = () => fetchSignalRegion(ctx, signal, region, historyRange());

  return sendFormat(req, res, ctx, format, data, {
    title: `${signal.id}-${region.name}`,
    vega: createSignalLineChart.bind(null, region, signal),
    cache: CacheDuration.short,
    constantFields: {
      signal: signal.id,
      region: region.id,
    },
  });
});
