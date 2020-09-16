import { NextApiRequest, NextApiResponse } from 'next';
import { TopLevelSpec } from 'vega-lite';
import { Canvas } from 'canvas';
import { CustomHTTPError } from '../error';
import { CacheDuration } from '../../data/constants';
import { IVegaOptions } from '@/charts';
import { getAsync, setAsync } from '@/data/redis';
import { setCommonHeaders } from './setCommonHeaders';
import { ICommonOptions, Formats } from '../format';

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
  // need a spec with data with cached
  // device pixel ratio doesn't matter
  console.log(req.url);
  const specKey = `${req.url}.vg?d=${vegaOptions.details}&s=${vegaOptions.scaleFactor}`;
  const svgKey = specKey.replace('.vg', '.svg');

  if (format === Formats.png || format === Formats.svg) {
    // maybe cached the SVG
    const cachedSVG = await getAsync(svgKey);
    if (cachedSVG) {
      if (format === Formats.svg) {
        return sendVegaSVG(req, res, cachedSVG, options);
      } else {
        return sendVegaPNG(req, res, cachedSVG, { ...options, ...vegaOptions });
      }
    }
  }
  const cachedSpec = await getAsync(specKey);
  const spec: TopLevelSpec = cachedSpec ? JSON.parse(cachedSpec) : await vega(await data(), vegaOptions);
  if (!cachedSpec) {
    await setAsync(specKey, JSON.stringify(spec), 'EX', options.cache ?? CacheDuration.short);
  }
  if (format === Formats.vg) {
    return sendVegaSpec(req, res, spec, options);
  }
  const svg = await createVegaSVG(spec, vegaOptions);
  await setAsync(svgKey, svg, 'EX', options.cache ?? CacheDuration.short);
  if (format === Formats.svg) {
    return sendVegaSVG(req, res, svg, options);
  }
  return sendVegaPNG(req, res, svg, { ...options, ...vegaOptions });
}

async function createVegaSVG(spec: TopLevelSpec | Promise<TopLevelSpec>, options: IVegaOptions) {
  const vegaLiteSpec = await spec;
  const { compile } = await import('vega-lite');
  const s = compile(vegaLiteSpec).spec;

  const { View, parse } = await import('vega');
  const runtime = parse(s);
  const view = new View(runtime, {
    renderer: 'none',
  });
  return view.toSVG(options.devicePixelRatio);
}

async function sendVegaPNG(
  req: NextApiRequest,
  res: NextApiResponse,
  svg: string,
  options: ICommonOptions & IVegaOptions
) {
  try {
    const dpi = options.devicePixelRatio;
    const { default: sharp } = await import('sharp');
    const svgBuffer = Buffer.from(svg);
    setCommonHeaders(req, res, options, 'png');
    res.setHeader('Content-Type', 'image/png');
    sharp(svgBuffer, {
      density: 72 * dpi,
    })
      .png()
      .pipe(res);
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

async function sendVegaSVG(req: NextApiRequest, res: NextApiResponse, svg: string, options: ICommonOptions) {
  try {
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
