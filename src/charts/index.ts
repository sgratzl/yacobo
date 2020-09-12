import { ICountyValue, IDateValue, fetchSignalMeta } from '../data';
import { TopLevelSpec } from 'vega-lite';
import { ISignal } from '../data/constants';

export async function createLineChart(signal: ISignal, values: IDateValue[]): Promise<TopLevelSpec> {
  const meta = await fetchSignalMeta(signal);
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    title: signal.label,
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
  };
}

export async function createMap(signal: ISignal, values: ICountyValue[]): Promise<TopLevelSpec> {
  const counties = (await import('us-atlas/counties-10m.json')).default;
  const meta = await fetchSignalMeta(signal);
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    title: signal.label,
    width: 500,
    height: 300,
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
          fields: ['value'],
        },
      },
    ],
    projection: {
      type: 'albersUsa',
    },
    mark: 'geoshape',
    encoding: {
      color: {
        field: 'value',
        type: 'quantitative',
        scale: {
          domainMax: Math.min(100, Math.ceil(meta.mean + 3 * meta.stdev)),
        },
      },
    },
  };
}
