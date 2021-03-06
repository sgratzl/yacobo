import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchMeta } from '@/api/data';
import { IRequestContext, withMiddleware } from '@/api/middleware';
import { Formats, sendCustomFormat } from '@/api/format';
import { CacheDuration } from '@/api/model';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  return sendCustomFormat(req, res, Formats.json, () => fetchMeta(ctx), {
    title: 'signals',
    headers: ['signal', 'mean', 'stdev', 'minTime', 'maxTime'],
    cache: CacheDuration.short,
    constantFields: {},
  });
});
