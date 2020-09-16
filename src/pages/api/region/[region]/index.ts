import { NextApiRequest, NextApiResponse } from 'next';
import { formatAPIDate } from '@/common';
import { withMiddleware } from '@/api/middleware';
import { redirectWithFormat } from '@/api/redirect';
import { fetchLatestDate } from '@/api/data';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  const d = await fetchLatestDate();
  return redirectWithFormat(req, res, `all/${formatAPIDate(d)}`);
});
