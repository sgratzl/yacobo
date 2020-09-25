import { IRequestContext, withMiddleware } from '@/api/middleware';
import { extractFormat, sendFormat } from '@/api/format';
import { extractDateOrMagic, extractRegion, extractSignal } from '@/common/validator';
import { fetchSignalRegionDate, resolveMetaSignalDate } from '@/api/data';
import type { NextApiRequest, NextApiResponse } from 'next';
import { formatAPIDate } from '@/common';
import { estimateCacheDuration } from '@/api/model';
import { regionByID } from '@/model';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: dateOrMagic, format } = extractFormat(req, 'date', extractDateOrMagic);
  const signal = extractSignal(req);
  const date = dateOrMagic instanceof Date ? dateOrMagic : await resolveMetaSignalDate(dateOrMagic, ctx, signal);

  const region = extractRegion(req);
  const data = () => fetchSignalRegionDate(ctx, signal, region, date);
  return sendFormat(req, res, ctx, format, data, {
    title: `${region.name}-${signal.id}-${formatAPIDate(date)}`,
    headers: ['region', 'date', 'value', 'stderr'],
    cache: estimateCacheDuration(date),
    regions: regionByID,
  });
});
