import { NextApiRequest, NextApiResponse } from 'next';
import { fetchMeta } from '@/data';
import { withMiddleware } from '@/api/middleware';
import { sendFormat } from '@/api/format';
import { Formats } from '@/api/validator';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await fetchMeta();
  return sendFormat(req, res, Formats.json, data, {
    title: `signals`,
    headers: ['signal', 'mean', 'stdev', 'minTime', 'maxTime'],
    // vega: () => createMap(signal, data),
    cache: 'short',
  });
});
