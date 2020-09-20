import { IRequestContext, withMiddleware } from '@/api/middleware';
import { sendFormat, extractFormat } from '@/api/format';
import { extractDate } from '@/common/validator';
import { fetchAllRegions } from '@/api/data';
import { NextApiRequest, NextApiResponse } from 'next';
import { signals } from '@/model/signals';
import { regionByID } from '@/model/regions';
import { IRegionValue } from '@/model';
import { formatAPIDate } from '@/common';
import { estimateCacheDuration } from '@/api/model';

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

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse, ctx: IRequestContext) => {
  const { param: date, format } = extractFormat(req, 'date', extractDate);

  const data = () => Promise.all(signals.map((signal) => fetchAllRegions(ctx, signal.data, date))).then(merge);

  return sendFormat(req, res, ctx, format, data, {
    title: `all-${formatAPIDate(date)}`,
    headers: [
      'region',
      ...signals.map((signal) => (signal.data.hasStdErr ? [signal.id, `${signal.id}_stderr`] : signal.id)),
    ].flat(),
    // vega: () => createMap(signal, data),
    cache: estimateCacheDuration(date),
    regions: regionByID,
  });
});