import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/api/middleware';
import { sendVegaPNG } from '@/api/format';
import { createSkeletonMap } from '@/charts';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  return sendVegaPNG(req, res, createSkeletonMap(req.query.size === 'large' ? 2 : 1), {
    title: 'skeleton',
    cache: 'long',
  });
});