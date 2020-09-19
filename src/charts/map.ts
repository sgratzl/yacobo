import { LinearGradient, UrlData } from 'vega';
import { InlineData, NamedData } from 'vega-lite/build/src/data';
import { SchemeParams } from 'vega-lite/build/src/scale';
import { LayerSpec, TopLevel, UnitSpec } from 'vega-lite/build/src/spec';
import { font, IVegaOptions } from '.';
import { fetchSignalMeta } from '../api/data';
import { getValueDomain, IRegionValue, ISignal } from '../model';

const ZERO_COLOR = 'rgb(242,242,242)';
const STROKE = '#eaeaea';

const MAP_CHART_WIDTH = 500;
const MAP_CHART_HEIGHT = 300;

function createBaseMap(data: { title: string; description: string }, options: IVegaOptions): TopLevel<LayerSpec> {
  const meta = {
    title: data.title,
    description: data.description,
  };
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

export const COUNTIES_URL: UrlData = {
  name: 'data',
  url: 'https://cdn.jsdelivr.net/npm/us-atlas/counties-10m.json',
};

async function chooseDataSource(options: IVegaOptions) {
  if (options.details || !options.forImage) {
    return COUNTIES_URL;
  }
  const values = (await import('us-atlas/counties-10m.json')).default;
  return {
    values,
  };
}
const missingStopCount = 70;
const missingGradient: LinearGradient = {
  y2: 1,
  gradient: 'linear',
  stops: Array(missingStopCount + 1)
    .fill(0)
    .map((_, i) => ({ offset: i / missingStopCount, color: i % 2 === 0 ? '#eeeeee' : 'white' })),
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
  hasStdErr: boolean;
  mega?: boolean;
  interactive?: boolean;
}): UnitSpec | LayerSpec {
  const r: UnitSpec | LayerSpec = {
    data: {
      ...data.dataSource,
      name: data.feature,
      format: {
        type: 'topojson',
        feature: data.feature,
      },
    },
    mark: {
      type: 'geoshape',
      stroke: STROKE,
      opacity: data.hidden ? 0 : 1,
      tooltip: {
        content: 'data',
      },
    },
    encoding: {
      color: {
        condition: {
          test: 'datum.value === 0',
          value: ZERO_COLOR,
        },
        field: 'value',
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

  if (data.interactive) {
    r.selection = {
      hover: {
        type: 'single',
        on: 'mouseover',
        empty: 'none',
        fields: ['region'],
      },
    };
    r.encoding!.stroke = {
      condition: {
        selection: 'hover',
        value: 'orange',
      },
      value: STROKE,
    };
    r.encoding!.strokeWidth = {
      condition: {
        selection: 'hover',
        value: 2,
      },
      value: 1,
    };
  } else if (data.mega) {
    r.selection = {
      hoverMega: {
        type: 'single',
        on: 'mouseover',
        empty: 'none',
        fields: ['region'],
      },
    };
  }

  if (data.valuesSource) {
    if (data.mega) {
      r.transform = [
        {
          calculate: "datum.id + '000'",
          as: 'mega',
        },
        {
          lookup: 'mega',
          from: {
            data: {
              ...data.valuesSource,
            },
            key: 'region',
            fields: ['region', 'value', data.hasStdErr ? ['stderr'] : []].flat(),
          },
        },
      ];
    } else {
      r.transform = [
        {
          lookup: 'id',
          from: {
            data: {
              ...data.valuesSource,
            },
            key: 'region',
            fields: ['region', 'value', data.hasStdErr ? ['stderr'] : []].flat(),
          },
        },
      ];
    }
  }

  return r;
}

export async function createMap(signal: ISignal, values: IRegionValue[] | undefined, options: IVegaOptions) {
  const meta = await fetchSignalMeta(options.ctx, signal);
  const data = {
    dataSource: await chooseDataSource(options),
    maxValue: getValueDomain(signal, meta)[1],
    valueTitle: `of ${signal.data.maxValue.toLocaleString()} ${signal.data.unit}`,
    colorScheme: signal.colorScheme,
    title: signal.name,
    description: signal.description(),
    hasStdErr: signal.data.hasStdErr,
    forImage: true,
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
          name: 'missing',
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
        interactive: true,
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
    feature: 'nation',
    maxValue: 10,
    valueTitle: 'of 100 people',
    title: 'US Map',
    description: 'Skeleton Map',
    colorScheme: [ZERO_COLOR, ZERO_COLOR] as any,
    firstLayer: true,
    hasStdErr: false,
    forImage: true,
  };

  const spec = createBaseMap(data, options);
  spec.layer.push({
    ...createLayer(data),
    transform: [
      {
        calculate: '0',
        as: 'value',
      },
    ],
  });
  return spec;
}
