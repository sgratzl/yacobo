import { ICountyValue, IDateValue } from '../data';
import { TopLevelSpec } from 'vega-lite';

export function createLineChart(signal: { label: string }, values: IDateValue[]): TopLevelSpec {
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

export async function createMap(signal: { label: string }, values: ICountyValue[]): Promise<TopLevelSpec> {
  const counties = (await import('us-atlas/counties-10m.json')).default;
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
      },
    },
  };
}
