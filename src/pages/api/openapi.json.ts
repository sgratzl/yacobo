import { withMiddleware } from '@/api/middleware';
import { CacheDuration } from '@/api/model';
import api from '@/api/openapi.json';
import { NextApiRequest, NextApiResponse } from 'next';
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

  // parameters
  // details
  // scale
  // download
  // highlight
  // dpr

  if (process.env.NODE_ENV === 'production') {
    api.servers.shift(); // shift local host
  }

  // generate CSV entries
  generateFormatPaths(paths);

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
  value: { get: { summary: string; parameters?: any[]; responses: any } }
) {
  const g = value.get;
  paths[`${key}.${format}`] = {
    get: {
      summary: `${g.summary} as ${format.toUpperCase()} file`,
      parameters: g.parameters ?? [],
      responses: {
        ...g.responses,
        '200': {
          $ref: `#/components/responses/${format.toUpperCase()}`,
        },
      },
    },
  };
}

const noImages = ['/signal/date/{date}', '/signal'];

function generateFormatPaths(paths: Record<string, any>) {
  Object.entries(api.paths).forEach(([key, value]) => {
    generateFormatPath(paths, 'csv', key, value);
    // image formats
    if (!noImages.includes(key)) {
      generateFormatPath(paths, 'png', key, value);
      generateFormatPath(paths, 'vg', key, value);
      generateFormatPath(paths, 'jpg', key, value);
      generateFormatPath(paths, 'pdf', key, value);
    }
  });
  delete paths['/signal.csv'];
}
