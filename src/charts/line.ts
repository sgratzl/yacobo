import { fetchMeta } from '../api/data';
import type { TopLevelSpec } from 'vega-lite';
import { COMPARE_COLORS, DEFAULT_CHART_AREA_OPACITY, DEFAULT_CHART_COLOR, HIGHLIGHT_COLOR } from '../model/constants';
import { axisTitle, getValueDomain, ISignal } from '../model/signals';
import { IVegaOptions, font } from '.';
import { extractDateRange, IDateValue, IRegion, IRegionDateValue } from '@/model';
import { imputeMissing, startOfISODate, startOfISOToday } from '@/common/parseDates';
import { parseISO } from 'date-fns';
import type { LayerSpec, TopLevel } from 'vega-lite/build/src/spec';

const LINE_CHART_WIDTH = 400;
const LINE_CHART_HEIGHT = 200;

function createLineChartSpec(
  data: {
    title: string;
    description: string;
    values: IDateValue[];
    minDate: Date;
    maxValue: number;
    valueTitle: string;
    hasStdErr: boolean;
    hasRegion?: boolean;
    signalTitle?: boolean;
  },
  options: IVegaOptions
): TopLevel<LayerSpec> {
  const meta = {
    title: data.signalTitle ? { text: { expr: 'title' } } : data.title,
    description: data.description,
  };
  const max = startOfISOToday();

  const spec: TopLevel<LayerSpec> = {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    ...(!options.plain ? meta : {}),
    width: LINE_CHART_WIDTH * options.scaleFactor,
    height: LINE_CHART_HEIGHT * options.scaleFactor,
    data: {
      name: 'data',
      values: data.values.map((d) => ({ ...d, date: startOfISODate(d.date).valueOf() })),
    },
    transform: [
      {
        calculate: 'datum.value == null ? null : datum.value - datum.stderr',
        as: 'stderr_min',
      },
      {
        calculate: 'datum.value == null ? null : datum.value + datum.stderr',
        as: 'stderr_max',
      },
    ],
    encoding: {
      x: {
        field: 'date',
        type: 'temporal',
        scale: {
          domainMin: data.minDate.valueOf(),
          domainMax: max.valueOf(),
        },
        axis: {
          titleFontWeight: 'normal',
          title: `Date`,
          format: '%m/%d',
          formatType: 'time',
          tickCount: 'month',
        },
      },
      y: {
        field: 'value',
        type: 'quantitative',
        scale: {
          domainMin: 0,
          domainMax: data.maxValue,
          clamp: true,
        },
        axis: {
          titleFontWeight: 'normal',
          title: data.valueTitle,
          minExtent: 25,
          tickMinStep: 0.1,
        },
      },
      color: {
        value: DEFAULT_CHART_COLOR,
      },
    },
    layer: [
      {
        mark: {
          type: 'area',
          interpolate: 'linear',
          opacity: DEFAULT_CHART_AREA_OPACITY,
        },
        encoding: {
          y: {
            field: 'stderr_min',
          },
          y2: {
            field: 'stderr_max',
          },
        },
      },
      {
        mark: {
          type: 'line',
          interpolate: 'linear',
          point: 'transparent',
          strokeCap: 'square',
        },
      },
      {
        selection: {
          grid: {
            type: 'interval',
            bind: 'scales',
            encodings: ['x'],
          },
          hover: {
            type: 'single',
            on: 'mouseover',
            empty: 'none',
            nearest: true,
            fields: ['date'],
            ...(options.highlight
              ? {
                  init: {
                    date: startOfISODate(parseISO(options.highlight)).valueOf(),
                  },
                }
              : {}),
          },
        },
        mark: {
          type: 'circle',
          stroke: null,
          tooltip: { content: 'data' },
        },
        encoding: {
          color: {
            condition: {
              selection: 'hover',
              value: HIGHLIGHT_COLOR,
            },
            value: DEFAULT_CHART_COLOR,
          },
        },
      },
    ],
    config: {
      font,
    },
  };

  if (!data.hasStdErr) {
    // area layer
    spec.layer.shift();
    // area transforms
    spec.transform?.splice(1, 2);
  }

  return spec;
}

export async function createSignalLineChart(
  region: IRegion,
  signal: ISignal,
  values: IDateValue[] | undefined,
  options: IVegaOptions,
  signalTitle = false
): Promise<TopLevelSpec> {
  const metas = await fetchMeta(options.ctx);
  const meta = metas.find((d) => d.signal === signal.id)!;
  const minDate = extractDateRange(metas).min;
  return createLineChartSpec(
    {
      title: `${region.name} - ${signal.name}`,
      signalTitle,
      description: signal.description(),
      values: imputeMissing(values ?? [], {}),
      minDate,
      maxValue: getValueDomain(signal, meta)[1],
      valueTitle: axisTitle(signal),
      hasStdErr: signal.data.hasStdErr,
    },
    options
  );
}

export async function createSignalMultiLineChart(
  signal: ISignal,
  regions: IRegion[],
  values: IRegionDateValue[] | undefined,
  options: IVegaOptions
): Promise<TopLevelSpec> {
  const metas = await fetchMeta(options.ctx);
  const meta = metas.find((d) => d.signal === signal.id)!;
  const minDate = extractDateRange(metas).min;

  const spec = createLineChartSpec(
    {
      title: `${regions.map((r) => r.name).join(' vs. ')} - ${signal.name}`,
      description: signal.description(),
      values: imputeMissing(values ?? [], { region: 'T' }, 'region'),
      minDate,
      maxValue: getValueDomain(signal, meta)[1],
      valueTitle: axisTitle(signal),
      hasStdErr: signal.data.hasStdErr,
      hasRegion: true,
    },
    options
  );

  const regionLookup: Record<string, string> = {};
  regions.forEach((region) => (regionLookup[region.id] = region.name));

  spec.encoding!.color = {
    field: 'region',
    type: 'ordinal',
    scale: {
      domain: regions.map((d) => d.id),
      range: COMPARE_COLORS,
    },
    legend: !options.plain
      ? {
          title: 'Region',
          symbolOpacity: 1,
          labelExpr: `${JSON.stringify(regionLookup)}[datum.value]`,
          orient: 'bottom',
          titleOrient: 'left',
        }
      : null,
  };
  spec.layer[spec.layer.length - 1].encoding!.color = {
    condition: {
      selection: 'hover',
      value: HIGHLIGHT_COLOR,
    },
    field: 'region',
    type: 'ordinal',
  };

  return spec;
}

export async function createSkeletonLineChart(options: IVegaOptions): Promise<TopLevelSpec> {
  const metas = await fetchMeta(options.ctx);
  const minDate = extractDateRange(metas).min;
  return createLineChartSpec(
    {
      title: 'Line Chart',
      description: 'a skeleton of a line chart',
      values: [],
      minDate,
      maxValue: 10,
      valueTitle: `of 100 people`,
      hasStdErr: false,
    },
    options
  );
}
