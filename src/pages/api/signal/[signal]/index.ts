import { NextApiRequest, NextApiResponse } from 'next';
import { formatISODate } from '@/ui/utils';
import { withError } from '@/api/error';
import { redirectWithFormat } from '@/api/redirect';
import { fetchLatestDate } from '@/data';

export default withError(async (req: NextApiRequest, res: NextApiResponse) => {
  const d = await fetchLatestDate();
  return redirectWithFormat(req, res, formatISODate(d));
});
