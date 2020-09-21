import { IRequestContext, withMiddleware } from '@/api/middleware';
import { sendFormat, extractFormat } from '@/api/format';
import { extractRegions, extractSignal } from '@/common/validator';
import { fetchSignalRegions } from '@/api/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { regionByID } from '@/model/regions';
import { CacheDuration } from '@/api/model';
import { createSignalMultiLineChart } from '@/charts/line';

export default withMiddleware((req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: regions, format } = extractFormat(req, 'regions', extractRegions);
  const signal = extractSignal(req);
  const data = () => fetchSignalRegions(ctx, signal, regions);

  return sendFormat(req, res, ctx, format, data, {
    title: `${signal.id}-${regions.map((d) => d.name).join(',')}`,
    headers: ['region', 'date', 'value', 'stderr'],
    vega: createSignalMultiLineChart.bind(null, signal, regions),
    cache: CacheDuration.short,
    regions: regionByID,
  });
});
