import { NextApiRequest, NextApiResponse } from 'next';
import { LATEST } from '@/data';
import { formatISODate } from '@/ui/utils';
import { withError } from '@/api/error';
import { redirectWithFormat } from '@/api/redirect';

export default withError((req: NextApiRequest, res: NextApiResponse) => {
  return redirectWithFormat(req, res, formatISODate(LATEST));
});
