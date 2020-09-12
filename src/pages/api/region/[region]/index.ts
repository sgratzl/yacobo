import { NextApiRequest, NextApiResponse } from 'next';
import { formatAPIDate, LATEST } from '@/data';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  return res.redirect(`${req.url!}/${formatAPIDate(LATEST)}`);
};
