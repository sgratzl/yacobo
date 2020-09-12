import { NextApiRequest, NextApiResponse } from 'next';
import { EARLIEST, fetchSignalCounty, LATEST } from '@/data';
import { extractFormat, extractRegion, extractSignal, Formats } from '@/api/validator';
import { sendCSV } from '@/api/format';
import { withError } from '@/api/error';

export default withError(async (req: NextApiRequest, res: NextApiResponse) => {
  const { param: signal, format } = extractFormat(req, 'signal', extractSignal);
  const region = extractRegion(req);
  const data = await fetchSignalCounty(signal.data, region, [EARLIEST, LATEST]);
  switch (format) {
    case Formats.csv:
      return sendCSV(data, ['date', 'value', 'stderr'], `${signal.id}-${region}`, res);
    default:
      return res.status(200).json(data);
  }
});
