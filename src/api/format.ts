import { NextApiResponse } from 'next';
import { csvFormat } from 'd3-dsv';

// eslint-disable-next-line @typescript-eslint/ban-types
export function sendCSV<T extends object>(data: T[], headers: (keyof T)[], title: string, res: NextApiResponse) {
  res.status(200);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${title}.csv"`);
  res.send(csvFormat(data, headers));
  res.end();
}
