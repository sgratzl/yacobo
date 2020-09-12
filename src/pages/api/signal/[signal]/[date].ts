import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllCounties, formatAPIDate } from '@/data';
import { extractDate, extractSignal } from '@/api/validator';
import { formatOutput } from '@/api/format';

export default (req: NextApiRequest, res: NextApiResponse) => {
  const signal = extractSignal(req, res);
  if (!signal) {
    return;
  }
  const date = extractDate(req, res);
  if (!date) {
    return;
  }
  const data = fetchAllCounties(signal.data, date);
  return formatOutput(data, ['region', 'value', 'stderr'], `${signal}-${formatAPIDate(date)}`, req, res);
};
