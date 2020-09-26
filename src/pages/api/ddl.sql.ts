import { withMiddleware } from '@/api/middleware';
import { CacheDuration } from '@/api/model';
import { DDL } from '@/api/send/sendSQL';
import { setCommonHeaders } from '@/api/send/setCommonHeaders';
import type { NextApiRequest, NextApiResponse } from 'next';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  setCommonHeaders(
    req,
    res,
    {
      title: 'YaCoBo Database Model',
      cache: CacheDuration.long,
      constantFields: {},
    },
    'sql'
  );
  res.setHeader('Content-Type', 'application/sql; charset=utf-8');
  res.send(DDL);
  res.end();
});
