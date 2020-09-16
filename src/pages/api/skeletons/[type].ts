import { NextApiRequest, NextApiResponse } from 'next';
import { IRequestContext, withMiddleware } from '@/api/middleware';
import { createSkeletonLineChart } from '@/charts/line';
import { CacheDuration } from '@/api/model';
import sendVega from '@/api/send/sendVega';
import { CustomHTTPError } from '@/common/error';
import { createSkeletonMap } from '@/charts/map';
import { Formats, extractFormat } from '@/api/format';

function extractType(type: string): 'line' | 'map' {
  if (!type) {
    throw new CustomHTTPError(400, `type is missing`);
  }
  if (type !== 'line' && type !== 'map') {
    throw new CustomHTTPError(400, `invalid type one of line,map is missing`);
  }
  return type;
}

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: type, format } = extractFormat(req, 'type', extractType, Formats.png);

  const factory = type === 'line' ? createSkeletonLineChart : createSkeletonMap;
  return sendVega(
    req,
    res,
    ctx,
    format,
    () => Promise.resolve([]),
    (_data, options) => factory(options),
    {
      title: 'skeleton',
      cache: CacheDuration.long,
    }
  );
});
