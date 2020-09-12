import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllCounties, formatAPIDate } from '@/data';
import { extractDate, extractFormat, extractSignal, Formats } from '@/api/validator';
import { sendCSV } from '@/api/format';
import { withError } from '@/api/error';

export default withError(async (req: NextApiRequest, res: NextApiResponse) => {
  const { param: signal, format } = extractFormat(req, 'signal', extractSignal);
  const date = extractDate(req);
  const data = await fetchAllCounties(signal.data, date);
  switch (format) {
    case Formats.csv:
      return sendCSV(data, ['region', 'value', 'stderr'], `${signal}-${formatAPIDate(date)}`, res);
    default:
      return res.status(200).json(data);
  }
});
