import { NextApiResponse } from 'next';
import { csvFormat } from 'd3-dsv';
import { View, parse } from 'vega';
import { compile, TopLevelSpec } from 'vega-lite';
import { Canvas } from 'canvas';
import { CustomHTTPError } from './error';

// eslint-disable-next-line @typescript-eslint/ban-types
export function sendCSV<T extends object>(res: NextApiResponse, data: T[], headers: (keyof T)[], title?: string) {
  res.status(200);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  if (title) {
    res.setHeader('Content-Disposition', `attachment; filename="${title}.csv"`);
  }
  res.send(csvFormat(data, headers));
  res.end();
}

async function createVega(spec: TopLevelSpec | Promise<TopLevelSpec>) {
  const vegaLiteSpec = await spec;
  const vegaSpec = compile(vegaLiteSpec).spec;
  const runtime = parse(vegaSpec);
  return new View(runtime, {
    renderer: 'none',
  });
}

export async function sendVegaPNG(res: NextApiResponse, spec: TopLevelSpec | Promise<TopLevelSpec>, title?: string) {
  try {
    const view = await createVega(spec);
    const canvas = await view.toCanvas();
    const stream = ((canvas as unknown) as Canvas).createPNGStream();
    res.status(200);
    res.setHeader('Content-Type', 'image/png');
    if (title) {
      res.setHeader('Content-Disposition', `attachment; filename="${title}.png"`);
    }
    stream.pipe(res);
  } catch (err) {
    throw new CustomHTTPError(500, err.message);
  }
}

export async function sendVegaSVG(res: NextApiResponse, spec: TopLevelSpec | Promise<TopLevelSpec>, title?: string) {
  try {
    const view = await createVega(spec);
    const svg = await view.toSVG();
    res.status(200);
    res.setHeader('Content-Type', 'image/svg+xml');
    if (title) {
      res.setHeader('Content-Disposition', `attachment; filename="${title}.svg"`);
    }
    res.send(svg);
    res.end();
  } catch (err) {
    throw new CustomHTTPError(500, err.message);
  }
}
