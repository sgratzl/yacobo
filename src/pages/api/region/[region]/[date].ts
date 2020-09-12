import { NextApiRequest, NextApiResponse } from 'next';
import { fetchCounty, formatAPIDate } from '@/data';
import { extractDate, extractRegion } from '@/api/validator';
import { formatOutput } from '@/api/format';

export default (req: NextApiRequest, res: NextApiResponse) => {
  const region = extractRegion(req, res);
  if (!region) {
    return;
  }
  const date = extractDate(req, res);
  if (!date) {
    return;
  }
  const data = fetchCounty(region, date);
  return formatOutput(data, ['signal', 'value', 'stderr'], `${region}-${formatAPIDate(date)}`, req, res);
};
