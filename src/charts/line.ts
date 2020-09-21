import { fetchMeta } from '../api/data';
import { TopLevelSpec } from 'vega-lite';
import { selectEarliestDate } from '../model/constants';
import { getValueDomain, ISignal } from '../model/signals';
import { IVegaOptions, font } from '.';
import { IDateValue, IRegion } from '@/model';
import { startOfISODate, startOfISOToday } from '@/common/parseDates';
import { parseISO } from 'date-fns';

const LINE_CHART_WIDTH = 400;
const LINE_CHART_HEIGHT = 200;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function createLineChartSpec(
  data: {
    title: string;
    description: string;
    values: IDateValue[];
    minDate: Date;
    maxValue: number;
    valueTitle: string;
    hasStdErr: boolean;
  },
  options: IVegaOptions
): TopLevelSpec {
  const meta = {
    title: data.title,
    description: data.description,
  };
  const max = startOfISOToday();
  const dataMin = startOfISODate(data.values[0]?.date ?? data.minDate);
  const dataMax = startOfISODate(data.values[data.values.length - 1]?.date ?? max);
  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    ...(options.details ? meta : {}),
    width: LINE_CHART_WIDTH * options.scaleFactor,
    height: LINE_CHART_HEIGHT * options.scaleFactor,
    data: {
      sequence: {
        start: dataMin.valueOf(),
        stop: dataMax.valueOf() + MS_PER_DAY,
        step: MS_PER_DAY, // 1 day
        as: 'date',
      },
    },
    transform: [
      {
        lookup: 'date',
        from: {
          data: {
            name: 'data',
            values: data.values.map((d) => ({ ...d, date: startOfISODate(d.date).valueOf() })),
          },
          key: 'date',
          fields: ['value', data.hasStdErr ? ['stderr'] : []].flat(),
        },
      },
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
          tickMinStep: 1,
        },
      },
    },
    layer: [
      {
        mark: {
          type: 'area',
          interpolate: 'linear',
          color: 'grey',
          opacity: 0.25,
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
          color: 'grey',
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
          type: 'point',
          stroke: null,
          tooltip: { content: 'data' },
        },
        encoding: {
          fill: {
            condition: {
              selection: 'hover',
              value: 'orange',
            },
            value: 'grey',
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
  options: IVegaOptions
): Promise<TopLevelSpec> {
  const metas = await fetchMeta(options.ctx);
  const meta = metas.find((d) => d.signal === signal.id)!;
  const minDate = selectEarliestDate(metas);
  return createLineChartSpec(
    {
      title: `${region.name} - ${signal.name}`,
      description: signal.description(),
      values: values ?? [],
      minDate,
      maxValue: getValueDomain(signal, meta)[1],
      valueTitle: `of ${signal.data.maxValue.toLocaleString()} ${signal.data.unit}`,
      hasStdErr: signal.data.hasStdErr,
    },
    options
  );
}

export async function createSkeletonLineChart(options: IVegaOptions): Promise<TopLevelSpec> {
  const metas = await fetchMeta(options.ctx);
  const minDate = selectEarliestDate(metas);
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
