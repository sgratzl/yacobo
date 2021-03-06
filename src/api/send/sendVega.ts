import type { NextApiRequest, NextApiResponse } from 'next';
import type { TopLevelSpec } from 'vega-lite';
import { CustomHTTPError } from '../../common/error';
import type { IVegaOptions } from '@/charts';
import { setCommonHeaders } from './setCommonHeaders';
import { ICommonOptions, Formats, ILoadOptions } from '../format';
import type { View } from 'vega';
import type { IRequestContext } from '../middleware';
import { createCanvas, createVega } from '@/charts/vega';

export interface IVegaFactory<T> {
  (data: T[] | undefined, options: IVegaOptions): TopLevelSpec | Promise<TopLevelSpec>;
}

export interface IMultiVegaFactory<T> {
  default: IVegaFactory<T>;
  [chartType: string]: IVegaFactory<T>;
}

function pickFactory<T>(req: NextApiRequest, vega: IVegaFactory<T> | IMultiVegaFactory<T>) {
  if (typeof vega === 'function') {
    return vega;
  }
  const chart = (req.query.chart as string) ?? 'default';
  return vega[chart] ?? vega.default;
}

export default async function sendVega<T>(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: IRequestContext,
  format: Formats,
  data: () => Promise<T[]>,
  vega: IVegaFactory<T> | IMultiVegaFactory<T>,
  options: ICommonOptions & { skeleton?: boolean } & ILoadOptions
) {
  const vegaOptions = extractVegaOptions(req, ctx, format, options.focus);
  const vegaFactory = pickFactory(req, vega);
  if (format === Formats.vg && vegaOptions.plain) {
    // pure vega without data
    return sendVegaSpec(req, res, vegaFactory(undefined, vegaOptions), options);
  }

  const spec: TopLevelSpec = await vegaFactory(await data(), vegaOptions);

  if (format === Formats.vg) {
    return sendVegaSpec(req, res, spec, options);
  }
  const view = await createVega(spec, options.skeleton);

  if (format === Formats.svg) {
    return sendVegaSVG(req, res, view, options, vegaOptions);
  }

  try {
    const canvas = await createCanvas(view, vegaOptions.devicePixelRatio, format === Formats.pdf);

    switch (format) {
      case Formats.jpg:
        setCommonHeaders(req, res, options, 'jpg');
        res.setHeader('Content-Type', 'image/jpeg');
        canvas.createJPEGStream().pipe(res);
        break;
      case Formats.pdf:
        setCommonHeaders(req, res, options, 'pdf');
        res.setHeader('Content-Type', 'application/pdf');
        canvas
          .createPDFStream({
            title: options.title,
            keywords: 'covid-19, covidcast',
            creationDate: new Date(),
          })
          .pipe(res);
        break;
      default:
        setCommonHeaders(req, res, options, 'png');
        res.setHeader('Content-Type', 'image/png');
        canvas.createPNGStream().pipe(res);
        break;
    }
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

export function extractVegaOptions(
  req: NextApiRequest,
  ctx: IRequestContext,
  format: Formats,
  focus?: string
): IVegaOptions {
  return {
    scaleFactor: Number.parseInt((req.query.scale as string) ?? '1', 10),
    plain: req.query.plain != null,
    devicePixelRatio: Number.parseInt((req.query.dpr as string) ?? '1', 10),
    forImage: format !== Formats.vg,
    highlight: req.query.highlight as string,
    focus,
    ctx,
  };
}
