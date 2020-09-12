import { NextApiRequest, NextApiResponse } from 'next';
import { fetchMeta } from '@/data';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const r = await fetchMeta();
  res.statusCode = 200;
  res.json(r);
};
