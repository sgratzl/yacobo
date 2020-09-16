import { NextApiRequest, NextApiResponse } from 'next';
import { IRequestContext, withMiddleware } from '@/api/middleware';
import { redirectWithFormat } from '@/api/redirect';
import { fetchSignalMeta } from '@/api/data';
import { extractSignal } from '@/common/validator';
import { extractFormat } from '@/api/format';
import { formatAPIDate } from '@/common';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: signal } = extractFormat(req, 'signal', extractSignal);
  const d = await fetchSignalMeta(ctx, signal);
  return redirectWithFormat(req, res, formatAPIDate(d.maxTime));
});
