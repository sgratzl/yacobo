import { withError } from '@/api/error';
import { sendFormat } from '@/api/format';
import { extractFormat, extractRegion, extractSignal } from '@/api/validator';
import { createLineChart } from '@/charts';
import { EARLIEST, fetchSignalCounty, LATEST } from '@/data';
import { NextApiRequest, NextApiResponse } from 'next';

export default withError(async (req: NextApiRequest, res: NextApiResponse) => {
  const { param: signal, format } = extractFormat(req, 'signal', extractSignal);
  const region = extractRegion(req);
  const data = await fetchSignalCounty(signal.data, region, [EARLIEST, LATEST]);

  return sendFormat(req, res, format, data, {
    title: `${signal.id}-${region}`,
    headers: ['date', 'value', 'stderr'],
    vega: (data) => createLineChart(signal, data),
  });
});
