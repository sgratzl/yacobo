import { IRequestContext, withMiddleware } from '@/api/middleware';
import { sendFormat, extractFormat } from '@/api/format';
import { extractDate, extractSignal } from '@/common/validator';
import { createMap } from '@/charts/map';
import { fetchAllRegions } from '@/api/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { regionByID } from '@/model/regions';
import { formatAPIDate } from '@/common';
import { estimateCacheDuration } from '@/api/model';

export default withMiddleware((req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);
  const signal = extractSignal(req);
  const data = () => fetchAllRegions(ctx, signal.data, date);

  return sendFormat(req, res, ctx, format, data, {
    title: `${signal.id}-${formatAPIDate(date)}`,
    headers: ['region', 'value', 'stderr'],
    vega: createMap.bind(null, signal),
    cache: estimateCacheDuration(date),
    regions: regionByID,
  });
});
