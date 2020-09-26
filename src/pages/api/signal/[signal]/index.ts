import type { NextApiRequest, NextApiResponse } from 'next';
import { IRequestContext, withMiddleware } from '@/api/middleware';
import { fetchAllRegionsHistory } from '@/api/data';
import { extractSignal } from '@/common/validator';
import { extractFormat, sendFormat } from '@/api/format';
import { historyRange } from '@/model';
import { createHeatMap } from '@/charts/heatmap';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: signal, format } = extractFormat(req, 'signal', extractSignal);

  const data = () => fetchAllRegionsHistory(ctx, signal, historyRange());

  const vegaFactory = createHeatMap.bind(null, signal);
  return sendFormat(req, res, ctx, format, data, {
    title: signal.id,
    vega: vegaFactory,
    constantFields: { signal: signal.id },
  });
});
