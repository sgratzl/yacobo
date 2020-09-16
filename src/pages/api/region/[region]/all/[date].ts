import { IRequestContext, withMiddleware } from '@/api/middleware';
import { sendFormat, extractFormat } from '@/api/format';
import { extractDate, extractRegion } from '@/common/validator';
import { fetchRegion } from '@/api/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { formatAPIDate } from '@/common';
import { signalByID } from '@/model/signals';
import { estimateCacheDuration } from '@/api/model';

export default withMiddleware((req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);
  const region = extractRegion(req);
  const data = () => fetchRegion(ctx, region, date);
  return sendFormat(req, res, ctx, format, data, {
    title: `${region.name}-${formatAPIDate(date)}`,
    headers: ['signal', 'value', 'stderr'],
    cache: estimateCacheDuration(date),
    signals: signalByID.bind(signalByID),
  });
});
