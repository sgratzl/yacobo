import { NextApiRequest, NextApiResponse } from 'next';
import { csvFormat } from 'd3-dsv';

// eslint-disable-next-line @typescript-eslint/ban-types
export async function formatOutput<T extends object>(
  out: Promise<T[]>,
  headers: (keyof T)[],
  title: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = await out;
  if (req.query.format === 'csv') {
    res.status(200);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${title}.csv"`);
    res.send(csvFormat(data, headers));
    res.end();
  }
  return res.status(200).json(data);
}
