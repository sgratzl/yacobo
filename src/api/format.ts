import { NextApiRequest, NextApiResponse } from 'next';
import { csvFormat } from 'd3-dsv';
import { View, parse } from 'vega';
import { compile, TopLevelSpec } from 'vega-lite';
import { Canvas } from 'canvas';
import { CustomHTTPError } from './error';
import { Formats } from './validator';
import { ISignal } from '../data/constants';
import { IRegion, isCountyRegion } from '../data/regions';

export interface ICommonOptions {
  title: string;
  cache?: 'short' | 'medium' | 'long';
  signals?: (signal: string) => ISignal | undefined;
  regions?: (region: string) => IRegion;
}

const maxAges = {
  short: 12 * 60 * 60,
  medium: 48 * 60 * 60, // default
  long: 96 * 60 * 60,
};

function setCommonHeaders(req: NextApiRequest, res: NextApiResponse, options: ICommonOptions, extension: string) {
  res.status(200);
  if (req.query.download != null) {
    res.setHeader('Content-Disposition', `attachment; filename="${options.title}.${extension}"`);
  }
  const maxAge = maxAges[options.cache ?? 'medium'];
  res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-max-age=${maxAge}`);
}

function sendJSON<T>(req: NextApiRequest, res: NextApiResponse, data: T[], options: ICommonOptions) {
  setCommonHeaders(req, res, options, 'json');
  if (req.query.details == null || (!options.signals && !options.regions)) {
    res.json(data);
    return;
  }
  // inject details
  let data2: any[] = data;
  if (options.signals) {
    data2 = data.map((row: any) => ({
      ...row,
      signalName: options.signals!(row.signal)!.name,
    }));
  }
  if (options.regions) {
    data2 = data.map((row: any) => {
      const region = options.regions!(row.region);
      return {
        ...row,
        regionName: region.name,
        regionPopulation: region.population,
        ...(isCountyRegion(region) ? { regionState: region.state.short } : {}),
      };
    });
  }
  res.json(data2);
}

// eslint-disable-next-line @typescript-eslint/ban-types
function sendCSV<T extends object>(
  req: NextApiRequest,
  res: NextApiResponse,
  data: T[],
  headers: (keyof T)[],
  options: ICommonOptions & {
    details?: Map<string, IRegion | ISignal>;
  }
) {
  setCommonHeaders(req, res, options, 'csv');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  if (req.query.details == null || (!options.signals && !options.regions)) {
    res.send(csvFormat(data, headers));
    res.end();
    return;
  }
  // inject details
  let data2: any[] = data;
  const headers2: string[] = headers.map(String);
  if (options.signals) {
    headers2.splice(headers2.indexOf('signal'), 0, 'signalName');
    data2 = data.map((row: any) => ({
      ...row,
      signalName: options.signals!(row.signal)!.name,
    }));
  }
  if (options.regions) {
    headers2.splice(headers2.indexOf('region'), 0, 'regionName', 'regionPopulation');
    if (data.length > 0 && isCountyRegion(options.regions!((data[0] as any).region)!)) {
      headers2.splice(headers2.indexOf('regionPopulation'), 0, 'regionState');
    }
    data2 = data.map((row: any) => {
      const region = options.regions!(row.region);
      return {
        ...row,
        regionName: region.name,
        regionPopulation: region.population,
        ...(isCountyRegion(region) ? { state: region.state.short } : {}),
      };
    });
  }
  res.send(csvFormat(data2, headers2));
  res.end();
}

async function createVega(req: NextApiRequest, spec: TopLevelSpec | Promise<TopLevelSpec>) {
  const vegaLiteSpec = await spec;
  if (req.query.details == null) {
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

export async function sendVegaPNG(
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
  data: () => Promise<T[]>,
  options: ICommonOptions & {
    headers: (keyof T)[];
    vega?: (data: T[]) => TopLevelSpec | Promise<TopLevelSpec>;
  }
) {
  const d = await data();
  switch (format) {
    case Formats.csv:
      return sendCSV(req, res, d, options.headers, options);
    case Formats.png:
      if (options.vega) {
        return sendVegaPNG(req, res, options.vega(d), options);
      }
      break;
    case Formats.svg:
      if (options.vega) {
        return sendVegaSVG(req, res, options.vega(d), options);
      }
      break;
  }
  return sendJSON(req, res, d, options);
}
