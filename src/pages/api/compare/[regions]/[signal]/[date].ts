import { fetchSignalRegions, resolveMetaSignalDate } from '@/api/data';
import { extractFormat, sendFormat } from '@/api/format';
import { IRequestContext, withMiddleware } from '@/api/middleware';
import { estimateCacheDuration } from '@/api/model';
import { regionDateSummaryDates } from '@/common/helpers';
import { extractDateOrMagic, extractRegions, extractSignal } from '@/common/validator';
import type { NextApiRequest, NextApiResponse } from 'next';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: dateOrMagic, format } = extractFormat(req, 'date', extractDateOrMagic);
  const signal = extractSignal(req);
  const date = dateOrMagic instanceof Date ? dateOrMagic : await resolveMetaSignalDate(dateOrMagic, ctx, signal);
  const regions = extractRegions(req);
  const data = () => fetchSignalRegions(ctx, signal, regions, regionDateSummaryDates(date));

  return sendFormat(req, res, ctx, format, data, {
    title: `${signal.id}-${regions.map((d) => d.name).join(',')}`,
    // vega: createSignalMultiLineChart.bind(null, signal, regions),
    cache: estimateCacheDuration(date),
    constantFields: {
      signal: signal.id,
    },
  });
});
