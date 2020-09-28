import type { Canvas } from 'canvas';
import type { View } from 'vega';
import type { TopLevelSpec } from 'vega-lite';
import { initCanvas } from 'yacobo-font-canvas-helper';

export async function createVega(spec: TopLevelSpec | Promise<TopLevelSpec>, skeleton?: boolean) {
  const vegaLiteSpec = await spec;
  if (skeleton) {
    vegaLiteSpec.background = 'transparent';
  }
  const { compile } = await import('vega-lite');
  const s = compile(vegaLiteSpec).spec;

  const { View, parse } = await import('vega');
  const runtime = parse(s);
  return new View(runtime, {
    renderer: 'none',
  });
}

export async function createCanvas(view: View, devicePixelRatio: number, pdf: boolean) {
  initCanvas();
  const canvasOptions = pdf ? { type: 'pdf' } : undefined;
  const canvas = ((await view.toCanvas(devicePixelRatio, canvasOptions)) as unknown) as Canvas;

  return canvas;
}
