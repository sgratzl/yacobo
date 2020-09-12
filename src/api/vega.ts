import { NextApiResponse } from 'next';
import { View, parse } from 'vega';
import { compile, TopLevelSpec } from 'vega-lite';
import { Canvas } from 'canvas';

export function formatPNG(spec: TopLevelSpec, res: NextApiResponse) {
  const view = new View(parse(compile(spec).spec), {
    renderer: 'none',
  });
  return view
    .toCanvas()
    .then((canvas) => {
      const stream = ((canvas as unknown) as Canvas).createPNGStream();
      res.status(200);
      res.setHeader('Content-Type', 'image/png');
      stream.pipe(res);
    })
    .catch((err) => {
      res.status(500).json({ message: err.toString() });
    });
}
