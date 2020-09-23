import type { NextApiRequest, NextApiResponse } from 'next';
import { formatAPIDate } from '@/common';
import { IRequestContext, withMiddleware } from '@/api/middleware';
import { redirectWithFormat } from '@/api/redirect';
import { fetchMinMaxDate } from '@/api/data';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { default: d } = await fetchMinMaxDate(ctx);
  return redirectWithFormat(req, res, `date/${formatAPIDate(d)}`);
});
