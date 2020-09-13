import { ICountyValue, IDateValue, fetchSignalMeta } from '../data';
import { TopLevelSpec } from 'vega-lite';
import { ISignal, ISignalMeta } from '../data/constants';
import { LayerSpec, UnitSpec } from 'vega-lite/build/src/spec';

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

const ZERO_COLOR = 'rgb(242,242,242)';
const STROKE = '#eaeaea';

function genLayer(
  counties: any,
  signal: ISignal,
  meta: ISignalMeta,
  feature: string,
  values: ICountyValue[],
  hidden = false
): LayerSpec | UnitSpec {
  return {
    data: {
      values: counties,
      format: {
        type: 'topojson',
        feature,
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
    mark: {
      type: 'geoshape',
      opacity: hidden ? 0 : 1,
    },
    encoding: {
      color: {
        condition: {
          test: {
            field: 'value',
            equal: 0,
          },
          value: ZERO_COLOR,
        },
        field: 'value',
        type: 'quantitative',
        scale: {
          domainMin: 0,
          domainMax: Math.min(signal.data.maxValue, Math.ceil(meta.mean + 3 * meta.stdev)),
          scheme: signal.colorScheme,
          clamp: true,
        },
        legend: {
          orient: 'right',
          titleAlign: 'center',
          titleFontWeight: 'normal',
          titleOrient: 'left',
          title: `of ${signal.data.maxValue.toLocaleString()} people`,
          labelLimit: 30,
          tickMinStep: 1,
        },
      },
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
          stroke: STROKE,
          color: {
            y2: 0.4,
            gradient: 'linear',
            stops: Array(stopCount + 1)
              .fill(0)
              .map((_, i) => ({ offset: i / stopCount, color: i % 2 === 0 ? '#eeeeee' : 'white' })),
          },
        },
      },
    ],
    config: {
      font,
      view: {
        stroke: null,
      },
    },
  };

  if (megaValues.length > 0) {
    spec.layer.push(genLayer(counties, signal, meta, 'states', megaValues));
  }
  if (values.length > 0) {
    spec.layer.push(genLayer(counties, signal, meta, 'counties', values));
  } else {
    // add a dummy layer such that we have the legend
    spec.layer.unshift(genLayer(counties, signal, meta, 'nation', [{ region: 'US', value: 0 }], true));
  }

  return spec;
}

export async function createSkeletonMap() {
  const counties = (await import('us-atlas/counties-10m.json')).default;

  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    width: 500,
    height: 300,
    data: {
      values: counties,
      format: {
        type: 'topojson',
        feature: 'counties',
      },
    },
    projection: {
      type: 'albersUsa',
    },
    mark: {
      type: 'geoshape',
      stroke: STROKE,
    },
    encoding: {
      color: {
        condition: {
          test: {
            field: 'value',
            valid: false,
          },
          value: ZERO_COLOR,
        },
        field: 'id',
        type: 'quantitative',
        scale: {
          domainMin: 0,
          domainMax: 10,
          scheme: [ZERO_COLOR, ZERO_COLOR] as any,
        },
        legend: {
          orient: 'right',
          titleAlign: 'center',
          titleFontWeight: 'normal',
          titleOrient: 'left',
          title: `of 100 people`,
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
  return spec;
}
