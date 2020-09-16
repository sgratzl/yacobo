import { NextApiRequest, NextApiResponse } from 'next';
import { withMiddleware } from '@/api/middleware';
import { createSkeletonLineChart } from '@/charts/line';
import { CacheDuration } from '@/data/constants';
import sendVega from '@/api/send/sendVega';
import { extractFormat } from '@/api/validator';
import { CustomHTTPError } from '@/api/error';
import { createSkeletonMap } from '@/charts/map';
import { Formats } from '@/api/format';

function extractType(type: string): 'line' | 'map' {
  if (!type) {
    throw new CustomHTTPError(400, `type is missing`);
  }
  if (type !== 'line' && type !== 'map') {
    throw new CustomHTTPError(400, `invalid type one of line,map is missing`);
  }
  return type;
}

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  const { param: type, format } = extractFormat(req, 'type', extractType, Formats.png);

  const factory = type === 'line' ? createSkeletonLineChart : createSkeletonMap;
  return sendVega(
    req,
    res,
    format,
    () => Promise.resolve([]),
    (_data, options) => factory(options),
    {
      title: 'skeleton',
      cache: CacheDuration.long,
    }
  );
});
