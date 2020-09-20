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
      title: 'OpenAPI Spec',
      cache: CacheDuration.long,
    },
    'json'
  );

  const paths: Record<string, any> = {
    ...api.paths,
  };

  // generate CSV entries
  generateCSVPaths(paths);

  // inject valid signals
  api.components.parameters.signal.schema.enum = signals.map((d) => d.id);
  signals.forEach((signal) => {
    api.components.schemas.MultiSignal.properties[signal.id] = {
      type: 'number',
      nullable: true,
    };
    if (signal.data.hasStdErr) {
      api.components.schemas.MultiSignal.properties[`${signal.id}_stderr`] = {
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

function generateCSVPaths(paths: Record<string, any>) {
  Object.entries(api.paths).forEach(([key, value]) => {
    const g = value.get;
    paths[`${key}.csv`] = {
      get: {
        summary: `${g.summary} as CSV file`,
        parameters: (g as any).parameters ?? [],
        responses: {
          ...g.responses,
          '200': {
            $ref: '#/components/responses/CSVFile',
          },
        },
      },
    };
  });
  delete paths['/signal.csv'];
}
