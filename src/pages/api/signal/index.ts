import { NextApiRequest, NextApiResponse } from 'next';
import { fetchMeta } from '@/data';
import { withError } from '@/api/error';

export default withError(async (_req: NextApiRequest, res: NextApiResponse) => {
  const data = fetchMeta();
  return res.status(200).json(data);
});
