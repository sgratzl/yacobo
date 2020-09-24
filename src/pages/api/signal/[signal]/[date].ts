import { IRequestContext, withMiddleware } from '@/api/middleware';
import { sendFormat, extractFormat } from '@/api/format';
import { extractDateOrMagic, extractSignal } from '@/common/validator';
import { createMap } from '@/charts/map';
import { fetchAllRegions, resolveMetaSignalDate } from '@/api/data';
import type { NextApiRequest, NextApiResponse } from 'next';
import { regionByID } from '@/model/regions';
import { formatAPIDate } from '@/common';
import { estimateCacheDuration } from '@/api/model';
import { createHistogramChart } from '@/charts/histogram';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: dateOrMagic, format } = extractFormat(req, 'date', extractDateOrMagic);
  const signal = extractSignal(req);
  const date = dateOrMagic instanceof Date ? dateOrMagic : await resolveMetaSignalDate(dateOrMagic, ctx, signal);

  const data = () => fetchAllRegions(ctx, signal.data, date);

  const vegaFactory =
    req.query.chart === 'histogram'
      ? createHistogramChart.bind(null, signal, date)
      : createMap.bind(null, signal, date);

  return sendFormat(req, res, ctx, format, data, {
    title: `${signal.id}-${formatAPIDate(date)}`,
    headers: ['region', 'value', 'stderr'],
    vega: vegaFactory,
    cache: estimateCacheDuration(date),
    regions: regionByID,
  });
});
