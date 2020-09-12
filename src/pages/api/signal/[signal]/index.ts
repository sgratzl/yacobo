import { NextApiRequest, NextApiResponse } from 'next';
import { formatAPIDate, LATEST } from '@/data';

export default (req: NextApiRequest, res: NextApiResponse) => {
  return res.redirect(`${req.url!}/${formatAPIDate(LATEST)}`);
};
