import { NextApiRequest, NextApiResponse } from 'next';
import { formatAPIDate } from '@/common';
import { withMiddleware } from '@/api/middleware';
import { redirectWithFormat } from '@/api/redirect';
import { fetchMinMaxDate } from '@/api/data';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  const { max: d } = await fetchMinMaxDate();
  return redirectWithFormat(req, res, `all/${formatAPIDate(d)}`);
});
