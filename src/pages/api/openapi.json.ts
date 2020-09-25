import { withMiddleware } from '@/api/middleware';
import { CacheDuration } from '@/api/model';
import api from '@/api/openapi.json';
import type { NextApiRequest, NextApiResponse } from 'next';
import { setCommonHeaders } from '@/api/send/setCommonHeaders';
import { signals } from '@/model';

export default withMiddleware(async (req: NextApiRequest, res: NextApiResponse) => {
  setCommonHeaders(
    req,
    res,
    {
      title: 'openapi',
      cache: CacheDuration.long,
    },
    'json'
  );

  const paths: Record<string, any> = {
    ...api.paths,
  };

  if (process.env.NODE_ENV === 'production') {
    api.servers.shift(); // shift local host
  }

  // generate CSV entries
  generateFormatPaths(paths);

  Object.values(paths).forEach((paths) => {
    // inject download option
    paths.get.parameters.push({
      $ref: '#/components/parameters/download',
    });
  });

  // inject valid signals
  api.components.parameters.signal.schema.enum = signals.map((d) => d.id);
  signals.forEach((signal) => {
    (api.components.schemas.MultiSignal.properties as any)[signal.id] = {
      type: 'number',
      nullable: true,
    };
    if (signal.data.hasStdErr) {
      (api.components.schemas.MultiSignal.properties as any)[`${signal.id}_stderr`] = {
        type: 'number',
        nullable: true,
      };
    }
    (api.components.parameters.signal.examples as any)[signal.id] = {
      value: signal.id,
      description: signal.name,
    };
  });

  res.json({
    ...api,
    paths,
  });
});

function generateFormatPath(
  paths: Record<string, any>,
  format: string,
  key: string,
  value: { get: { summary: string; parameters?: any[]; responses: any } },
  parameters: { $ref: string }[] = [],
  details = true
) {
  const g = value.get;
  const cleaned = (g.parameters ?? []).filter((d) => details || d.$ref.endsWith('plain'));
  paths[`${key}.${format}`] = {
    get: {
      summary: `${g.summary} as ${format.toUpperCase()} file`,
      parameters: [...cleaned, ...parameters],
      responses: {
        ...g.responses,
        '200': {
          $ref: `#/components/responses/${format.toUpperCase()}`,
        },
      },
    },
  };
}

const noImages = ['/signal/date/{date}', '/signal', 'compare/{regions}/{signal}/{date}'];

const imageParams = [
  {
    $ref: '#/components/parameters/scale',
  },
  {
    $ref: '#/components/parameters/dpr',
  },
  // parameters
  // highlightRegion
  // highlightDate
  // chart
];

function generateFormatPaths(paths: Record<string, any>) {
  Object.entries(api.paths).forEach(([key, value]) => {
    generateFormatPath(paths, 'csv', key, value);
    // image formats
    if (noImages.includes(key)) {
      return;
    }

    const params = [
      ...imageParams,
      {
        $ref: `#/components/parameters/highlight${key.includes('{date}') ? 'Region' : 'Date'}`,
      },
    ];

    if (key === '/signal/{signal}/{date}') {
      params.push({
        $ref: '#/components/parameters/chart',
      });
    }

    generateFormatPath(paths, 'png', key, value, params);
    generateFormatPath(paths, 'jpg', key, value, params);
    generateFormatPath(paths, 'pdf', key, value, params);

    generateFormatPath(
      paths,
      'vg',
      key,
      value,
      [
        ...params,
        {
          $ref: '#/components/parameters/detailsVG',
        },
      ],
      false
    );
  });
  delete paths['/signal.csv'];
}
