import { withMiddleware } from '@/api/middleware';
import { sendFormat } from '@/api/format';
import { extractDate, extractFormat } from '@/api/validator';
import { cacheMode, fetchAllCounties, formatAPIDate, IRegionValue } from '@/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { signals } from '@/data/constants';
import { regionByID } from '@/data/regions';

function merge(all: IRegionValue[][]) {
  const regions = new Map<string, { region: string } & Record<string, string | number | undefined | null>>();
  signals.forEach((signal, i) => {
    const data = all[i]!;
    for (const row of data) {
      const region = row.region;
      if (!regions.has(region)) {
        regions.set(region, { region });
      }
      const targetRow = regions.get(region)!;
      targetRow[signal.id] = row.value;
      if (signal.data.hasStdErr) {
        targetRow[`${signal.id}_stderr`] = row.stderr;
      }
    }
  });
  return Array.from(regions.values()).sort((a, b) => a.region!.localeCompare(b.region!));
}

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);
  const all = await Promise.all(signals.map((signal) => fetchAllCounties(signal.data, date)));

  const data = merge(all);

  return sendFormat(req, res, format, data, {
    title: `all-${formatAPIDate(date)}`,
    headers: [
      'region',
      ...signals.map((signal) => (signal.data.hasStdErr ? [signal.id, `${signal.id}_stderr`] : signal.id)),
    ].flat(),
    // vega: () => createMap(signal, data),
    cache: cacheMode(date),
    regions: regionByID,
  });
});
