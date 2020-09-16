import { NextApiRequest, NextApiResponse } from 'next';
import { TopLevelSpec } from 'vega-lite';
import { CustomHTTPError } from '../../common/error';
import { CacheDuration } from '../model';
import { IVegaOptions } from '@/charts';
import { getAsync, setAsync } from '@/api/redis';
import { setCommonHeaders } from './setCommonHeaders';
import { ICommonOptions, Formats } from '../format';
import { resolve } from 'path';
import type { View } from 'vega';
import type { Canvas } from 'canvas';

// follow https://medium.com/@adamhooper/fonts-in-node-canvas-bbf0b6b0cabf
process.env.PANGOCAIRO_BACKEND = 'fontconfig';
process.env.FONTCONFIG_PATH = resolve(__dirname, './public/fonts');

function generateSpecKey(url: string, format: Formats, options: IVegaOptions) {
  const extension = url.lastIndexOf('.');
  const base = extension >= 0 ? url.slice(0, extension - 1) : url;
  return `${base}.${format}?scale=${options.scaleFactor}${options.details ? '&details' : ''}`;
}

export default async function sendVega<T>(
  req: NextApiRequest,
  res: NextApiResponse,
  format: Formats,
  data: () => Promise<T[]>,
  vega: (data: T[] | undefined, options: IVegaOptions) => TopLevelSpec | Promise<TopLevelSpec>,
  options: ICommonOptions
) {
  const vegaOptions = extractVegaOptions(req);
  if (format === Formats.vg && !vegaOptions.details) {
    // pure vega without data
    return sendVegaSpec(req, res, vega(undefined, vegaOptions), options);
  }

  const specKey = generateSpecKey(req.url!, Formats.vg, vegaOptions);
  const cachedSpec = await getAsync(specKey);
  const spec: TopLevelSpec = cachedSpec ? JSON.parse(cachedSpec) : await vega(await data(), vegaOptions);
  if (!cachedSpec) {
    await setAsync(specKey, JSON.stringify(spec), 'EX', options.cache ?? CacheDuration.short);
  }
  if (format === Formats.vg) {
    return sendVegaSpec(req, res, spec, options);
  }
  const view = await createVega(spec);

  if (format === Formats.svg) {
    return sendVegaSVG(req, res, view, options, vegaOptions);
  }
  return sendVegaPNG(req, res, view, options, vegaOptions);
}

async function createVega(spec: TopLevelSpec | Promise<TopLevelSpec>) {
  const vegaLiteSpec = await spec;
  const { compile } = await import('vega-lite');
  const s = compile(vegaLiteSpec).spec;

  const { View, parse } = await import('vega');
  const runtime = parse(s);
  return new View(runtime, {
    renderer: 'none',
  });
}

async function sendVegaPNG(
  req: NextApiRequest,
  res: NextApiResponse,
  vega: View,
  options: ICommonOptions,
  vegaOptions: IVegaOptions
) {
  try {
    const canvas = ((await vega.toCanvas(vegaOptions.devicePixelRatio)) as unknown) as Canvas;
    setCommonHeaders(req, res, options, 'png');
    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);
  } catch (err) {
    throw new CustomHTTPError(500, err.message);
  }
}

async function sendVegaSpec(
  req: NextApiRequest,
  res: NextApiResponse,
  spec: TopLevelSpec | Promise<TopLevelSpec>,
  options: ICommonOptions
) {
  try {
    const vegaLiteSpec = await spec;
    setCommonHeaders(req, res, options, 'vg.json');
    res.setHeader('Content-Type', 'application/json');
    res.json(vegaLiteSpec);
  } catch (err) {
    throw new CustomHTTPError(500, err.message);
  }
}

async function sendVegaSVG(
  req: NextApiRequest,
  res: NextApiResponse,
  vega: View,
  options: ICommonOptions,
  vegaOptions: IVegaOptions
) {
  try {
    const svg = await vega.toSVG(vegaOptions.scaleFactor);
    setCommonHeaders(req, res, options, 'svg');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
    res.end();
  } catch (err) {
    throw new CustomHTTPError(500, err.message);
  }
}

export function extractVegaOptions(req: NextApiRequest): IVegaOptions {
  return {
    scaleFactor: Number.parseInt((req.query.scale as string) ?? '1', 10),
    details: req.query.details != null,
    devicePixelRatio: Number.parseInt((req.query.dpr as string) ?? '1', 10),
  };
}
