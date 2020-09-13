import { NextApiRequest, NextApiResponse } from 'next';
import { fetchMeta } from '@/data';
import { withMiddleware } from '@/api/middleware';

export default withMiddleware(async (_req: NextApiRequest, res: NextApiResponse) => {
  const data = fetchMeta();
  return res.status(200).json(data);
});
