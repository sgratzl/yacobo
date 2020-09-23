import { IRequestContext, withMiddleware } from '@/api/middleware';
import { sendFormat, extractFormat } from '@/api/format';
import { extractDate, extractSignal } from '@/common/validator';
import { createMap } from '@/charts/map';
import { fetchAllRegions } from '@/api/data';
import type { NextApiRequest, NextApiResponse } from 'next';
import { regionByID } from '@/model/regions';
import { formatAPIDate } from '@/common';
import { estimateCacheDuration } from '@/api/model';
import { createHistogramChart } from '@/charts/histogram';

export default withMiddleware((req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);
  const signal = extractSignal(req);
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
