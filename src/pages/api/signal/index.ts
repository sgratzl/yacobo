import { NextApiRequest, NextApiResponse } from 'next';
import { fetchMeta } from '@/data';
import { withMiddleware } from '@/api/middleware';
import { sendFormat } from '@/api/format';
import { Formats } from '@/api/validator';
import { CacheDuration } from '@/data/constants';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  return sendFormat(req, res, Formats.json, fetchMeta, {
    title: `signals`,
    headers: ['signal', 'mean', 'stdev', 'minTime', 'maxTime'],
    // vega: () => createMap(signal, data),
    cache: CacheDuration.short,
  });
});
