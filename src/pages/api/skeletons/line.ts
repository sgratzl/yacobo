import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/api/middleware';
import { sendVegaPNG, extractVegaOptions } from '@/api/format';
import { createSkeletonLineChart } from '@/charts/line';
import { CacheDuration } from '@/data/constants';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  const options = extractVegaOptions(req);
  return sendVegaPNG(req, res, createSkeletonLineChart(options), {
    title: 'skeleton',
    cache: CacheDuration.long,
    ...options,
  });
});
