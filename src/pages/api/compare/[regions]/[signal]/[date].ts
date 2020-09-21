import { fetchSignalRegions } from '@/api/data';
import { extractFormat, sendFormat } from '@/api/format';
import { IRequestContext, withMiddleware } from '@/api/middleware';
import { estimateCacheDuration } from '@/api/model';
import { regionDateSummaryDates } from '@/common/helpers';
import { extractDate, extractRegions, extractSignal } from '@/common/validator';
import { regionByID } from '@/model/regions';
import { NextApiRequest, NextApiResponse } from 'next';

export default withMiddleware((req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);
  const signal = extractSignal(req);
  const regions = extractRegions(req);
  const data = () => fetchSignalRegions(ctx, signal, regions, regionDateSummaryDates(date));

  return sendFormat(req, res, ctx, format, data, {
    title: `${signal.id}-${regions.map((d) => d.name).join(',')}`,
    headers: ['region', 'date', 'value', 'stderr'],
    // vega: createSignalMultiLineChart.bind(null, signal, regions),
    cache: estimateCacheDuration(date),
    regions: regionByID,
  });
});
