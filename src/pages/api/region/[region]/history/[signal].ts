import { NextApiRequest, NextApiResponse } from 'next';
import { EARLIEST, fetchSignalCounty, LATEST } from '@/data';
import { extractFormat, extractRegion, extractSignal, extractTitle, Formats } from '@/api/validator';
import { sendCSV, sendVegaPNG, sendVegaSVG } from '@/api/format';
import { withError } from '@/api/error';
import { createLineChart } from '@/charts';

export default withError(async (req: NextApiRequest, res: NextApiResponse) => {
  const { param: signal, format } = extractFormat(req, 'signal', extractSignal);
  const region = extractRegion(req);
  const title = extractTitle(req, `${signal.id}-${region}`);
  const data = await fetchSignalCounty(signal.data, region, [EARLIEST, LATEST]);
  switch (format) {
    case Formats.csv:
      return sendCSV(res, data, ['date', 'value', 'stderr'], title);
    case Formats.png:
      return sendVegaPNG(res, createLineChart(signal, data), title);
    case Formats.svg:
      return sendVegaSVG(res, createLineChart(signal, data), title);
    default:
      return res.status(200).json(data);
  }
});
