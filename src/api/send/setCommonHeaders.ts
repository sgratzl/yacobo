import type { NextApiRequest, NextApiResponse } from 'next';
import type { ICommonOptions } from '../format';
import { CacheDuration } from '../model';

export function setCommonHeaders(
  req: NextApiRequest,
  res: NextApiResponse,
  options: ICommonOptions,
  extension: string
) {
  res.status(200);
  if (req.query.download != null) {
    res.setHeader('Content-Disposition', `attachment; filename="${options.title}.${extension}"`);
  }
  const maxAge = options.cache ?? CacheDuration.medium;
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}`);
  } else {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}`);
  }
}
