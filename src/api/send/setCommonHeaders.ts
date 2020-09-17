import { NextApiRequest, NextApiResponse } from 'next';
import { ICommonOptions } from '../format';
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
    res.setHeader('Cache-Control', `public, s-maxage=${Math.floor(maxAge / 60)}, stale-while-revalidate`);
  } else {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${Math.floor(maxAge / 60)}`);
  }
}
