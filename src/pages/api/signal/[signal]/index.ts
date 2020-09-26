import type { NextApiRequest, NextApiResponse } from 'next';
import { IRequestContext, withMiddleware } from '@/api/middleware';
import { fetchAllRegionsHistory } from '@/api/data';
import { extractSignal } from '@/common/validator';
import { extractFormat, ILoadOptions, sendFormat } from '@/api/format';
import { historyRange, regionByID, toState } from '@/model';
import { createHeatMap } from '@/charts/heatmap';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: signal, format } = extractFormat(req, 'signal', extractSignal);

  const data = (options: ILoadOptions) =>
    fetchAllRegionsHistory(ctx, signal, historyRange(), options.focus ? regionByID(options.focus) : undefined);

  const focus = req.query.focus ? toState(regionByID(req.query.focus as string)!) : undefined;
  const vegaFactory = createHeatMap.bind(null, signal);
  return sendFormat(req, res, ctx, format, data, {
    title: `${signal.id}${focus ? `- ${focus.id} - ${focus.name}` : ''}`,
    vega: vegaFactory,
    constantFields: { signal: signal.id },
  });
});
