import { startOfISODate, startOfISOToday } from '@/common/parseDates';
import { extractDateRange, IRegionDateValue, states } from '@/model';
import { differenceInDays } from 'date-fns';
import type { TopLevelSpec } from 'vega-lite';
import type { SchemeParams } from 'vega-lite/build/src/scale';
import { font, IVegaOptions } from '.';
import { fetchMeta } from '../api/data';
import { HIGHLIGHT_COLOR, ZERO_COLOR } from '../model/constants';
import { getValueDomain, ISignal } from '../model/signals';

const stateLookUp: Record<string, string> = {};
for (const state of states) {
  stateLookUp[state.id] = state.short;
}

function createHeatMapChartSpec(
  data: {
    title: string;
    description: string;
    values: IRegionDateValue[];
    minDate: Date;
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
  const max = startOfISOToday();

  const aspectRatio = 0.3;
  // TODO uses the county meta data

  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    ...(options.details ? meta : {}),
    width: Math.abs(differenceInDays(data.minDate, max)) * aspectRatio * 8 * options.scaleFactor,
    height: {
      step: 8 * options.scaleFactor,
    },
    data: {
      name: 'data',
      values: data.values.map((d) => ({ ...d, date: startOfISODate(d.date).valueOf() })),
    },
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
        field: 'region',
        type: 'nominal',
        scale: {
          domain: states.map((d) => d.id),
        },
        axis: {
          titleFontWeight: 'normal',
          title: 'State',
          labelExpr: `${JSON.stringify(stateLookUp)}[datum.value]`,
        },
      },
      fill: {
        condition: {
          test: 'datum.value === 0',
          value: ZERO_COLOR,
        },
        field: 'value',
        type: 'quantitative',
        scale: {
          domainMin: 0,
          domainMax: data.maxValue,
          clamp: true,
          scheme: data.colorScheme,
        },
        legend: {
          orient: 'right',
          titleAlign: 'center',
          titleFontWeight: 'normal',
          titleOrient: 'left',
          title: data.valueTitle,
          labelLimit: 30,
          tickMinStep: 0.1,
        },
      },
      stroke: {
        value: HIGHLIGHT_COLOR,
      },
      strokeOpacity: {
        condition: { selection: 'hover', value: 1 },
        value: 0,
      },
    },
    selection: {
      hover: {
        type: 'single',
        on: 'mouseover',
        empty: 'none',
        nearest: true,
        fields: ['region', 'date'],
      },
    },
    mark: {
      type: 'point',
      shape: `M-1,-1l${aspectRatio * 2},0l0,2l${-aspectRatio * 2},0Z`, //create a rect that is aspectRatio x full to avoid overlapping
      size: Math.pow(8 * options.scaleFactor, 2), // fit vertically
    },
    config: {
      font,
    },
  };
  return spec;
}

export async function createHeatMap(
  signal: ISignal,
  values: IRegionDateValue[] | undefined,
  options: IVegaOptions
): Promise<TopLevelSpec> {
  const metas = await fetchMeta(options.ctx);
  const meta = metas.find((d) => d.signal === signal.id)!;
  const minDate = extractDateRange(metas).min;

  const spec = createHeatMapChartSpec(
    {
      title: `${signal.name} - Overview`,
      description: signal.description(),
      values: values ?? [],
      minDate,
      maxValue: getValueDomain(signal, meta)[1],
      valueTitle: `of ${signal.data.maxValue.toLocaleString()} ${signal.data.unit}`,
      colorScheme: signal.colorScheme,
    },
    options
  );
  return spec;
}

export async function createSkeletonHeatMapChart(options: IVegaOptions): Promise<TopLevelSpec> {
  const metas = await fetchMeta(options.ctx);
  const minDate = extractDateRange(metas).min;
  return createHeatMapChartSpec(
    {
      title: 'Heatmap Chart',
      description: 'a skeleton of a heatmap',
      values: [],
      minDate,
      maxValue: 10,
      valueTitle: `of 100 people`,
      colorScheme: [ZERO_COLOR, ZERO_COLOR] as any,
    },
    options
  );
}
