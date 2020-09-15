import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/api/middleware';
import { sendVegaPNG } from '@/api/format';
import { createSkeletonLineChart } from '@/charts';
import { CacheDuration } from '@/data/constants';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  return sendVegaPNG(req, res, createSkeletonLineChart(req.query.size === 'large' ? 2 : 1), {
    title: 'skeleton',
    cache: CacheDuration.long,
  });
});
