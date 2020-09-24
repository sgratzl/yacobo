import { IRequestContext, withMiddleware } from '@/api/middleware';
import { sendFormat, extractFormat } from '@/api/format';
import { extractDateOrMagic, extractRegion } from '@/common/validator';
import { fetchRegion, resolveMetaDate } from '@/api/data';
import type { NextApiRequest, NextApiResponse } from 'next';
import { formatAPIDate } from '@/common';
import { signalByID } from '@/model/signals';
import { estimateCacheDuration } from '@/api/model';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: dateOrMagic, format } = extractFormat(req, 'date', extractDateOrMagic);
  const date = dateOrMagic instanceof Date ? dateOrMagic : await resolveMetaDate(dateOrMagic, ctx);
  const region = extractRegion(req);
  const data = () => fetchRegion(ctx, region, date);
  return sendFormat(req, res, ctx, format, data, {
    title: `${region.name}-${formatAPIDate(date)}`,
    headers: ['signal', 'value', 'stderr'],
    cache: estimateCacheDuration(date),
    signals: signalByID,
  });
});
