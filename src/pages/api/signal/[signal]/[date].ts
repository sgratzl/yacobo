import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllCounties, formatAPIDate } from '@/data';
import { extractDate, extractFormat, extractSignal, extractTitle, Formats } from '@/api/validator';
import { sendCSV, sendVegaPNG, sendVegaSVG } from '@/api/format';
import { withError } from '@/api/error';
import { createMap } from '@/charts';

export default withError(async (req: NextApiRequest, res: NextApiResponse) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);
  const signal = extractSignal(req);
  const title = extractTitle(req, `${signal}-${formatAPIDate(date)}`);
  const data = await fetchAllCounties(signal.data, date);
  switch (format) {
    case Formats.csv:
      return sendCSV(res, data, ['region', 'value', 'stderr'], title);
    case Formats.png:
      return sendVegaPNG(res, createMap(signal, data), title);
    case Formats.svg:
      return sendVegaSVG(res, createMap(signal, data), title);
    default:
      return res.status(200).json(data);
  }
});
