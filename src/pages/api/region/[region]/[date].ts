import { NextApiRequest, NextApiResponse } from 'next';
import { fetchCounty, formatAPIDate } from '@/data';
import { extractDate, extractFormat, extractRegion, extractTitle, Formats } from '@/api/validator';
import { sendCSV } from '@/api/format';
import { withError } from '@/api/error';

export default withError(async (req: NextApiRequest, res: NextApiResponse) => {
  const { param: region, format } = extractFormat(req, 'region', extractRegion);
  const date = extractDate(req);
  const title = extractTitle(req, `${region}-${formatAPIDate(date)}`);
  const data = await fetchCounty(region, date);
  switch (format) {
    case Formats.csv:
      return sendCSV(res, data, ['signal', 'value', 'stderr'], title);
    default:
      return res.status(200).json(data);
  }
});
