import { formatLocal } from '@/common';
import type { IRegionValue } from '@/model';
import type { TopLevelSpec } from 'vega-lite';
import type { SchemeParams } from 'vega-lite/build/src/scale';
import { font, IVegaOptions } from '.';
import { fetchMeta } from '../api/data';
import { HIGHLIGHT_COLOR, HISTOGRAM_BINS, MAX_BIN_FREQUENCY, ZERO_COLOR } from '../model/constants';
import { axisTitle, getValueDomain, ISignal } from '../model/signals';

const HISTOGRAM_WIDTH = 400;
const HISTOGRAM_HEIGHT = 200;

function createHistogramSpec(
  data: {
    title: string;
    description: string;
    values: IRegionValue[];
    maxValue: number;
    valueTitle: string;
    colorScheme: string | SchemeParams;
  },
  options: IVegaOptions
) {
  const meta = {
    title: data.title,
    description: data.description,
  };
  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    ...(!options.plain ? meta : {}),
    width: HISTOGRAM_WIDTH * options.scaleFactor,
    height: HISTOGRAM_HEIGHT * options.scaleFactor,
    data: {
      name: 'data',
      values: data.values,
    },
    transform: [
      {
        filter: "substring(datum.region, 0, -3) !== '000' && datum.value != null",
      },
      {
        calculate: `min(${data.maxValue}, max(0, datum.value))`,
        as: 'c_value',
      },
      {
        bin: {
          extent: [0, data.maxValue],
          maxbins: HISTOGRAM_BINS,
        },
        field: 'c_value',
        as: 'bin_value',
      },
      {
        aggregate: [
          { op: 'count', as: '_count' },
          {
            op: 'values',
            as: 'values',
          },
        ],
        groupby: ['bin_value', 'bin_value_end'],
      },
      {
        joinaggregate: [{ op: 'sum', field: '_count', as: '_total' }],
      },
      {
        calculate: 'datum._count/datum._total',
        as: '_percent',
      },
      {
        calculate: '(datum.bin_value + datum.bin_value_end)/2',
        as: 'bin_value_mid',
      },
    ],
    selection: {
      hover: {
        type: 'single',
        on: 'mouseover',
        empty: 'none',
        nearest: true,
        fields: ['bin_value', 'bin_value_end'],
      },
    },
    encoding: {
      stroke: {
        value: HIGHLIGHT_COLOR,
      },
      strokeOpacity: {
        condition: { selection: 'hover', value: 1 },
        value: 0,
      },
      x: {
        field: 'bin_value',
        type: 'quantitative',
        bin: { binned: true },
        scale: {
          domainMin: 0,
          clamp: true,
        },
        axis: {
          titleFontWeight: 'normal',
          title: data.valueTitle,
          minExtent: 25,
          tickMinStep: 0.1,
        },
      },
      x2: {
        field: 'bin_value_end',
      },
      y: {
        field: '_percent',
        type: 'quantitative',
        scale: {
          domain: [0, MAX_BIN_FREQUENCY],
          clamp: true,
        },
        axis: {
          titleFontWeight: 'normal',
          title: 'relative frequency',
          minExtent: 25,
          format: '.1~%',
        },
      },
      color: {
        field: 'bin_value_mid',
        type: 'quantitative',
        scale: {
          domainMin: 0,
          domainMax: data.maxValue,
          clamp: true,
          scheme: data.colorScheme,
        },
        legend: null,
      },
    },
    mark: {
      type: 'bar',
      tooltip: {
        content: 'data',
      },
    },
    config: {
      font,
    },
  };
  return spec;
}

export async function createHistogramChart(
  signal: ISignal,
  date: Date,
  values: IRegionValue[] | undefined,
  options: IVegaOptions
): Promise<TopLevelSpec> {
  const metas = await fetchMeta(options.ctx);
  const meta = metas.find((d) => d.signal === signal.id)!;
  // TODO highlight
  return createHistogramSpec(
    {
      title: `${signal.name} as of ${formatLocal(date)}`,
      description: signal.description(),
      values: values ?? [],
      maxValue: getValueDomain(signal, meta)[1],
      colorScheme: signal.colorScheme,
      valueTitle: axisTitle(signal),
    },
    options
  );
}

export async function createSkeletonHistogramChart(options: IVegaOptions): Promise<TopLevelSpec> {
  return createHistogramSpec(
    {
      title: 'Histogram',
      description: 'a skeleton of a histogram',
      values: [],
      maxValue: 10,
      colorScheme: [ZERO_COLOR, ZERO_COLOR] as any,
      valueTitle: `of 100 people`,
    },
    options
  );
}
