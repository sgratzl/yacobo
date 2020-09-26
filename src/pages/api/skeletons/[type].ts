import type { NextApiRequest, NextApiResponse } from 'next';
import { IRequestContext, withMiddleware } from '@/api/middleware';
import { createSkeletonLineChart } from '@/charts/line';
import { CacheDuration } from '@/api/model';
import sendVega from '@/api/send/sendVega';
import { CustomHTTPError } from '@/common/error';
import { createSkeletonMap } from '@/charts/map';
import { Formats, extractFormat } from '@/api/format';
import { createSkeletonHistogramChart } from '@/charts/histogram';
import { createSkeletonHeatMapChart } from '@/charts/heatmap';

const factories = {
  map: createSkeletonMap,
  line: createSkeletonLineChart,
  histogram: createSkeletonHistogramChart,
  heatmap: createSkeletonHeatMapChart,
};

function extractType(type: string): keyof typeof factories {
  if (!type) {
    throw new CustomHTTPError(400, `type is missing`);
  }
  if (!Object.keys(factories).includes(type)) {
    throw new CustomHTTPError(400, `invalid type one of ${Object.keys(factories)} is missing`);
  }
  return type as keyof typeof factories;
}

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: type, format } = extractFormat(req, 'type', extractType, Formats.png);

  const factory = factories[type];

  return sendVega(
    req,
    res,
    ctx,
    format,
    () => Promise.resolve([]),
    (_data, options) => factory(options),
    {
      title: 'skeleton',
      skeleton: true,
      cache: CacheDuration.long,
      constantFields: {},
    }
  );
});
