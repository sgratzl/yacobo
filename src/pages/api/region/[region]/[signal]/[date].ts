import { IRequestContext, withMiddleware } from '@/api/middleware';
import { extractFormat, sendFormat } from '@/api/format';
import { extractDate, extractRegion, extractSignal } from '@/common/validator';
import { fetchSignalRegionDate } from '@/api/data';
import type { NextApiRequest, NextApiResponse } from 'next';
import { formatAPIDate } from '@/common';
import { estimateCacheDuration } from '@/api/model';
import { regionByID } from '@/model';

export default withMiddleware((req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);
  const signal = extractSignal(req);
  const region = extractRegion(req);
  const data = () => fetchSignalRegionDate(ctx, signal.data, region, date);
  return sendFormat(req, res, ctx, format, data, {
    title: `${region.name}-${signal.id}-${formatAPIDate(date)}`,
    headers: ['region', 'date', 'value', 'stderr'],
    cache: estimateCacheDuration(date),
    regions: regionByID,
  });
});
