import { NextApiRequest, NextApiResponse } from 'next';
import { TopLevelSpec } from 'vega-lite';
import { CustomHTTPError } from '../../common/error';
import { IVegaOptions } from '@/charts';
import { setCommonHeaders } from './setCommonHeaders';
import { ICommonOptions, Formats } from '../format';
import type { View } from 'vega';
import { Canvas, registerFont } from 'canvas';
import { IRequestContext } from '../middleware';
import { existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

let vegaInited = false;
function initVega() {
  console.error('init canvas');
  if (vegaInited) {
    return;
  }
  console.error('init canvas do');
  vegaInited = false;
  // follow https://medium.com/@adamhooper/fonts-in-node-canvas-bbf0b6b0cabf
  // process.env.PANGOCAIRO_BACKEND = 'fontconfig';
  // process.env.FONTCONFIG_PATH = resolve('./public/fonts');
  console.error(readdirSync(__dirname));
  const file = join(process.cwd(), './public/fonts/Roboto-Regular.ttf');
  console.error(resolve(file) + existsSync(file).toString());
  if (existsSync(file)) {
    registerFont(file, { family: 'Roboto' });
  }
}

export default async function sendVega<T>(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: IRequestContext,
  format: Formats,
  data: () => Promise<T[]>,
  vega: (data: T[] | undefined, options: IVegaOptions) => TopLevelSpec | Promise<TopLevelSpec>,
  options: ICommonOptions
) {
  const vegaOptions = extractVegaOptions(req, ctx);
  if (format === Formats.vg && !vegaOptions.details) {
    // pure vega without data
    return sendVegaSpec(req, res, vega(undefined, vegaOptions), options);
  }

  const spec: TopLevelSpec = await vega(await data(), vegaOptions);

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
  initVega();
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

export function extractVegaOptions(req: NextApiRequest, ctx: IRequestContext): IVegaOptions {
  return {
    scaleFactor: Number.parseInt((req.query.scale as string) ?? '1', 10),
    details: req.query.details != null,
    devicePixelRatio: Number.parseInt((req.query.dpr as string) ?? '1', 10),
    ctx,
  };
}
