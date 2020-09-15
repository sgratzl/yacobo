import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/api/middleware';
import { extractVegaOptions, sendVegaPNG } from '@/api/format';
import { createSkeletonMap } from '@/charts/map';
import { CacheDuration } from '@/data/constants';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  const options = extractVegaOptions(req);
  return sendVegaPNG(req, res, createSkeletonMap(options), {
    title: 'skeleton',
    cache: CacheDuration.long,
    ...options,
  });
});
