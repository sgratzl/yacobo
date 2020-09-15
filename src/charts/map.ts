import { LinearGradient, UrlData } from 'vega';
import { InlineData, NamedData } from 'vega-lite/build/src/data';
import { SchemeParams } from 'vega-lite/build/src/scale';
import { LayerSpec, TopLevel, UnitSpec } from 'vega-lite/build/src/spec';
import { font, IVegaOptions } from '.';
import { fetchSignalMeta, IRegionValue } from '../data';
import { ISignal } from '../data/signals';

const ZERO_COLOR = 'rgb(242,242,242)';
const STROKE = '#eaeaea';

const MAP_CHART_WIDTH = 500;
const MAP_CHART_HEIGHT = 300;

function createBaseMap(meta: { title: string; description: string }, options: IVegaOptions): TopLevel<LayerSpec> {
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    width: MAP_CHART_WIDTH * options.scaleFactor,
    height: MAP_CHART_HEIGHT * options.scaleFactor,
    ...(options.details ? meta : {}),
    projection: {
      type: 'albersUsa',
    },
    layer: [],
    config: {
      font,
      view: {
        stroke: null,
      },
    },
  };
}

async function chooseDataSource(options: IVegaOptions) {
  if (options.details) {
    return COUNTIES_URL;
  }
  const values = (await import('us-atlas/counties-10m.json')).default;
  return {
    values,
  };
}
const missingStopCount = 70;
const missingGradient: LinearGradient = {
  y2: 0.4,
  gradient: 'linear',
  stops: Array(missingStopCount + 1)
    .fill(0)
    .map((_, i) => ({ offset: i / missingStopCount, color: i % 2 === 0 ? '#eeeeee' : 'white' })),
};

const COUNTIES_URL: UrlData = {
  name: 'data',
  url: 'https://cdn.jsdelivr.net/npm/us-atlas/counties-10m.json',
};

function createLayer(data: {
  dataSource: UrlData | InlineData;
  feature: string;
  colorScheme: string | SchemeParams;
  maxValue: number;
  valueTitle: string;
  firstLayer: boolean;
  hidden?: boolean;
  valuesSource?: NamedData;
  mega?: boolean;
}): UnitSpec | LayerSpec {
  return {
    data: {
      ...data.dataSource,
      format: {
        type: 'topojson',
        feature: data.feature,
      },
    },
    transform: data.valuesSource
      ? [
          data.mega
            ? [
                {
                  calculate: "datum.id + '000'",
                  as: 'mega',
                },
              ]
            : [],
          {
            lookup: data.mega ? 'mega' : 'id',
            from: {
              data: {
                ...data.valuesSource,
              },
              key: 'region',
              fields: ['value', 'stderr'],
            },
          },
        ].flat()
      : [],
    mark: {
      type: 'geoshape',
      stroke: STROKE,
      opacity: data.hidden ? 0 : 1,
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
        ...(data.firstLayer
          ? {
              scale: {
                domainMin: 0,
                domainMax: data.maxValue,
                scheme: data.colorScheme,
                clamp: true,
              },
              legend: {
                orient: 'right',
                titleAlign: 'center',
                titleFontWeight: 'normal',
                titleOrient: 'left',
                title: data.valueTitle,
                labelLimit: 30,
                tickMinStep: 1,
              },
            }
          : {}),
      },
    },
  };
}

export async function createMap(signal: ISignal, values: IRegionValue[] | undefined, options: IVegaOptions) {
  const meta = await fetchSignalMeta(signal);
  const data = {
    dataSource: await chooseDataSource(options),
    maxValue: Math.min(signal.data.maxValue, Math.ceil(meta.mean + 3 * meta.stdev)),
    valueTitle: `of ${signal.data.maxValue.toLocaleString()} ${signal.data.unit}`,
    colorScheme: signal.colorScheme,
    title: signal.name,
    description: signal.description(),
    valuesSource: {
      name: 'data',
    },
  };

  const spec: TopLevel<LayerSpec> = {
    ...createBaseMap(data, options),
    datasets: {
      data: values ? (values.length === 0 ? [{ region: 'US', value: 0 }] : values) : [],
    },
    layer: [
      {
        data: {
          ...data.dataSource,
          format: {
            type: 'topojson',
            feature: 'nation',
          },
        },
        mark: {
          type: 'geoshape',
          stroke: STROKE,
          color: missingGradient,
        },
      },
    ],
  };

  if (!values || (values && values.length > 0)) {
    spec.layer.push(
      createLayer({
        ...data,
        feature: 'states',
        firstLayer: true,
        mega: true,
      })
    );

    spec.layer.push(
      createLayer({
        ...data,
        feature: 'counties',
        firstLayer: false,
      })
    );
  } else {
    // add a dummy layer such that we have the legend
    spec.layer.unshift(
      createLayer({
        ...data,
        feature: 'nation',
        firstLayer: true,
        hidden: true,
      })
    );
  }

  return spec;
}

export async function createSkeletonMap(options: IVegaOptions) {
  const data = {
    dataSource: await chooseDataSource(options),
    feature: 'counties',
    maxValue: 10,
    valueTitle: 'of 100 people',
    colorScheme: [ZERO_COLOR, ZERO_COLOR] as any,
    title: 'US Map',
    description: 'Skeleton Map',
    firstLayer: true,
  };

  const spec = createBaseMap(data, options);
  spec.layer.push(createLayer(data));
  return spec;
}
