import { NextApiRequest, NextApiResponse } from 'next';
import { EARLIEST, fetchSignalCounty, LATEST } from '@/data';
import { extractRegion, extractSignal } from '@/api/validator';
import { formatOutput } from '@/api/format';

export default (req: NextApiRequest, res: NextApiResponse) => {
  const signal = extractSignal(req, res);
  if (!signal) {
    return;
  }
  const region = extractRegion(req, res);
  if (!region) {
    return;
  }
  const data = fetchSignalCounty(signal.data, region, [EARLIEST, LATEST]);
  return formatOutput(data, ['date', 'value', 'stderr'], `${signal.id}-${region}`, req, res);
};
