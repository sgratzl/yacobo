import { NextApiRequest, NextApiResponse } from 'next';
import { formatISODate } from '@/ui/utils';
import { withMiddleware } from '@/api/middleware';
import { redirectWithFormat } from '@/api/redirect';
import { fetchLatestDate } from '@/data';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  const d = await fetchLatestDate();
  return redirectWithFormat(req, res, `all/${formatISODate(d)}`);
});
