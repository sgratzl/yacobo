import { NextApiRequest, NextApiResponse } from 'next';
import { CacheDuration } from '../../data/constants';
import { ICommonOptions } from '../format';

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
  res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-max-age=${maxAge}`);
}
