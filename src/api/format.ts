import { NextApiRequest, NextApiResponse } from 'next';
import { csvFormat } from 'd3-dsv';
import { View, parse } from 'vega';
import { compile, TopLevelSpec } from 'vega-lite';
import { Canvas } from 'canvas';
import { CustomHTTPError } from './error';
import { Formats } from './validator';

export interface ICommonOptions {
  title: string;
  shortCache?: boolean;
}

const HOURS_12_IN_SEC = 12 * 60 * 60;
const HOURS_48_IN_SEC = 48 * 60 * 60;

function setCommonHeaders(req: NextApiRequest, res: NextApiResponse, options: ICommonOptions, extension: string) {
  res.status(200);
  if (req.query.download != null) {
    res.setHeader('Content-Disposition', `attachment; filename="${options.title}.${extension}"`);
  }
  res.setHeader(
    'Cache-Control',
    `public, max-age=${options.shortCache ? HOURS_12_IN_SEC : HOURS_48_IN_SEC}, s-max-age=${
      options.shortCache ? HOURS_12_IN_SEC : HOURS_48_IN_SEC
    }`
  );
}

function sendJSON<T>(req: NextApiRequest, res: NextApiResponse, data: T[], options: ICommonOptions) {
  setCommonHeaders(req, res, options, 'json');
  res.json(data);
}

// eslint-disable-next-line @typescript-eslint/ban-types
function sendCSV<T extends object>(
  req: NextApiRequest,
  res: NextApiResponse,
  data: T[],
  headers: (keyof T)[],
  options: ICommonOptions
) {
  setCommonHeaders(req, res, options, 'csv');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.send(csvFormat(data, headers));
  res.end();
}

async function createVega(req: NextApiRequest, spec: TopLevelSpec | Promise<TopLevelSpec>) {
  const vegaLiteSpec = await spec;
  if (req.query.plain != null) {
    // delete title and description
    delete vegaLiteSpec.title;
    delete vegaLiteSpec.description;
  }
  const vegaSpec = compile(vegaLiteSpec).spec;
  const runtime = parse(vegaSpec);
  return new View(runtime, {
    renderer: 'none',
  });
}

async function sendVegaPNG(
  req: NextApiRequest,
  res: NextApiResponse,
  spec: TopLevelSpec | Promise<TopLevelSpec>,
  options: ICommonOptions
) {
  try {
    const view = await createVega(req, spec);
    const scale = req.query.scale ? Number.parseInt(req.query.scale as string, 10) : 1;
    const canvas = await view.toCanvas(scale);
    const stream = ((canvas as unknown) as Canvas).createPNGStream();
    setCommonHeaders(req, res, options, 'png');
    res.setHeader('Content-Type', 'image/png');
    stream.pipe(res);
  } catch (err) {
    throw new CustomHTTPError(500, err.message);
  }
}

async function sendVegaSVG(
  req: NextApiRequest,
  res: NextApiResponse,
  spec: TopLevelSpec | Promise<TopLevelSpec>,
  options: ICommonOptions
) {
  try {
    const view = await createVega(req, spec);
    const svg = await view.toSVG();
    setCommonHeaders(req, res, options, 'svg');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
    res.end();
  } catch (err) {
    throw new CustomHTTPError(500, err.message);
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export async function sendFormat<T extends object>(
  req: NextApiRequest,
  res: NextApiResponse,
  format: Formats,
  data: T[],
  options: ICommonOptions & {
    headers: (keyof T)[];
    vega?: (data: T[]) => TopLevelSpec | Promise<TopLevelSpec>;
  }
) {
  switch (format) {
    case Formats.csv:
      return sendCSV(req, res, data, options.headers, options);
    case Formats.png:
      if (options.vega) {
        return sendVegaPNG(req, res, options.vega(data), options);
      }
      break;
    case Formats.svg:
      if (options.vega) {
        return sendVegaSVG(req, res, options.vega(data), options);
      }
      break;
  }
  return sendJSON(req, res, data, options);
}
