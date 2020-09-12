import { withError } from '@/api/error';
import { sendFormat } from '@/api/format';
import { extractDate, extractFormat, extractRegion } from '@/api/validator';
import { fetchCounty } from '@/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { formatISODate } from '@/ui/utils';

export default withError(async (req: NextApiRequest, res: NextApiResponse) => {
  const { param: region, format } = extractFormat(req, 'region', extractRegion);
  const date = extractDate(req);
  const data = await fetchCounty(region, date);
  return sendFormat(req, res, format, data, {
    title: `${region}-${formatISODate(date)}`,
    headers: ['signal', 'value', 'stderr'],
  });
});
