import { NextApiRequest, NextApiResponse } from 'next';
import { fetchMeta } from '@/api/data';
import { IRequestContext, withMiddleware } from '@/api/middleware';
import { Formats, sendFormat } from '@/api/format';
import { CacheDuration } from '@/api/model';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  return sendFormat(req, res, ctx, Formats.json, () => fetchMeta(ctx), {
    title: `signals`,
    headers: ['signal', 'mean', 'stdev', 'minTime', 'maxTime'],
    // vega: () => createMap(signal, data),
    cache: CacheDuration.short,
  });
});
