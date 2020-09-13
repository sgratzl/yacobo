import { NextApiRequest, NextApiResponse } from 'next';
import { formatISODate } from '@/ui/utils';
import { withMiddleware } from '@/api/middleware';
import { redirectWithFormat } from '@/api/redirect';
import { fetchSignalMeta } from '@/data';
import { extractFormat, extractSignal } from '@/api/validator';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  const { param: signal } = extractFormat(req, 'signal', extractSignal);
  const d = await fetchSignalMeta(signal);
  return redirectWithFormat(req, res, formatISODate(d.maxTime));
});
