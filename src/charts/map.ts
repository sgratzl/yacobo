import { IRegionValue, fetchSignalMeta } from '../data';
import { TopLevelSpec } from 'vega-lite';
import { ISignal, ISignalMeta } from '../data/signals';
import { LayerSpec, UnitSpec } from 'vega-lite/build/src/spec';
import { DataSource } from 'vega-lite/build/src/data';
import { IVegaOptions, font } from '.';

const ZERO_COLOR = 'rgb(242,242,242)';
const STROKE = '#eaeaea';

const MAP_CHART_WIDTH = 500;
const MAP_CHART_HEIGHT = 300;

function genLayer(
  geoSource: DataSource,
  signal: ISignal,
  meta: ISignalMeta,
  feature: string,
  valuesSource: DataSource,
  mega = false,
  hidden = false
): LayerSpec | UnitSpec {
  return {
    data: {
      ...geoSource,
      format: {
        type: 'topojson',
        feature,
      },
    },
    transform: [
      ...(mega
        ? [
            {
              calculate: "datum.id + '000'",
              as: 'mega',
            },
          ]
        : []),
      {
        lookup: mega ? 'mega' : 'id',
        from: {
          data: {
            ...valuesSource,
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
          title: `of ${signal.data.maxValue.toLocaleString()} ${signal.data.unit}`,
          labelLimit: 30,
          tickMinStep: 1,
        },
      },
    },
  };
}

// const COUNTIES_URL = {
//   url: 'https://cdn.jsdelivr.net/npm/us-atlas/counties-10m.json',
// };

export async function createMap(signal: ISignal, values: IRegionValue[] | undefined, options: IVegaOptions) {
  const counties = (await import('us-atlas/counties-10m.json')).default;
  const meta = await fetchSignalMeta(signal);
  const stopCount = 70;
  const megaValues = (values ?? [])
    .filter((d) => d.region.endsWith('000'))
    .map((d) => ({ ...d, region: d.region.slice(0, -3) }));

  const source = {
    values: counties,
  };

  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    title: signal.name,
    width: MAP_CHART_WIDTH * options.scaleFactor,
    height: MAP_CHART_WIDTH * options.scaleFactor,
    datasets: {
      data: values ?? [],
    },
    data: { name: 'data' },
    layer: [
      {
        data: {
          ...source,
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

  if (!values || megaValues.length > 0) {
    spec.layer.push(genLayer(source, signal, meta, 'states', { name: 'data' }));
  }
  if (!values || values.length > 0) {
    spec.layer.push(genLayer(source, signal, meta, 'counties', { name: 'data' }, true));
  } else {
    // add a dummy layer such that we have the legend
    spec.layer.unshift(genLayer(source, signal, meta, 'nation', { values: [{ region: 'US', value: 0 }] }, false, true));
  }

  return spec;
}

export async function createSkeletonMap(options: IVegaOptions) {
  const counties = (await import('us-atlas/counties-10m.json')).default;

  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    width: MAP_CHART_WIDTH * options.scaleFactor,
    height: MAP_CHART_HEIGHT * options.scaleFactor,
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
