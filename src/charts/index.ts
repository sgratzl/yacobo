import { ICountyValue, IDateValue, fetchSignalMeta } from '../data';
import { TopLevelSpec } from 'vega-lite';
import { ISignal } from '../data/constants';

const font = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`;

export async function createLineChart(signal: ISignal, values: IDateValue[]): Promise<TopLevelSpec> {
  const meta = await fetchSignalMeta(signal);
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    title: signal.name,
    data: { values },
    width: 400,
    height: 200,
    encoding: {
      color: {
        value: 'grey',
      },
      x: {
        field: 'date',
        type: 'temporal',
        axis: {
          title: null,
          format: '%m/%d',
          formatType: 'time',
          tickCount: 'month',
        },
      },
      y: {
        field: 'value',
        type: 'quantitative',
        scale: {
          domainMax: Math.min(100, Math.ceil(meta.mean + 3 * meta.stdev)),
        },
        axis: {
          title: null,
          tickCount: 3,
          minExtent: 25,
        },
      },
    },
    mark: {
      type: 'line',
      interpolate: 'linear',
    },
    config: {
      font,
    },
  };
}

export async function createMap(signal: ISignal, values: ICountyValue[]) {
  const counties = (await import('us-atlas/counties-10m.json')).default;
  const meta = await fetchSignalMeta(signal);
  const stopCount = 70;
  const megaValues = values
    .filter((d) => d.region.endsWith('000'))
    .map((d) => ({ ...d, region: d.region.slice(0, -3) }));

  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    title: signal.name,
    width: 500,
    height: 300,
    layer: [
      {
        data: {
          values: counties,
          format: {
            type: 'topojson',
            feature: 'nation',
          },
        },
        projection: {
          type: 'albersUsa',
        },
        mark: {
          type: 'geoshape',
          color: {
            y2: 0.4,
            gradient: 'linear',
            stops: Array(stopCount + 1)
              .fill(0)
              .map((_, i) => ({ offset: i / stopCount, color: i % 2 === 0 ? '#eeeeee' : 'white' })),
          },
        },
      },
      {
        data: {
          values: counties,
          format: {
            type: 'topojson',
            feature: 'states',
          },
        },
        transform: [
          {
            lookup: 'id',
            from: {
              data: {
                values: megaValues,
              },
              key: 'region',
              fields: ['value', 'stderr'],
            },
          },
        ],
        projection: {
          type: 'albersUsa',
        },
        mark: 'geoshape',
      },
      {
        data: {
          values: counties,
          format: {
            type: 'topojson',
            feature: 'counties',
          },
        },
        transform: [
          {
            lookup: 'id',
            from: {
              data: {
                values,
              },
              key: 'region',
              fields: ['value', 'stderr'],
            },
          },
        ],
        projection: {
          type: 'albersUsa',
        },
        mark: 'geoshape',
      },
    ],
    encoding: {
      color: {
        condition: {
          test: {
            field: 'value',
            equal: 0,
          },
          value: 'rgb(242,242,242)',
        },
        field: 'value',
        type: 'quantitative',
        scale: {
          domainMin: 0,
          domainMax: Math.min(signal.data.maxValue, Math.ceil(meta.mean + 3 * meta.stdev)),
          scheme: signal.colorScheme,
        },
        legend: {
          orient: 'right',
          title: null,
          labelLimit: 30,
          tickMinStep: 1,
        },
      },
    },
    config: {
      font,
      view: {
        stroke: null,
      },
    },
  };

  if (values.length === 0) {
    // only missing
    spec.layer.splice(1, 2);
  } else if (megaValues.length === 0) {
    spec.layer.splice(1, 2);
  }

  return spec;
}
