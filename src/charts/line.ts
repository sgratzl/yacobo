import { fetchMeta } from '../api/data';
import { TopLevelSpec } from 'vega-lite';
import { selectEarliestDate } from '../model/constants';
import { ISignal } from '../model/signals';
import { startOfToday } from 'date-fns';
import { IVegaOptions, font } from '.';
import { IDateValue } from '@/model';

const LINE_CHART_WIDTH = 400;
const LINE_CHART_HEIGHT = 200;

function createLineChartSpec(
  data: { title: string; description: string; values: any[]; minDate: Date; maxValue: number; valueTitle: string },
  options: IVegaOptions
): TopLevelSpec {
  const meta = {
    title: data.title,
    description: data.description,
  };
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    ...(options.details ? meta : {}),

    datasets: {
      data: data.values,
    },
    data: { name: 'data' },
    width: LINE_CHART_WIDTH * options.scaleFactor,
    height: LINE_CHART_HEIGHT * options.scaleFactor,
    encoding: {
      color: {
        value: 'grey',
      },
      x: {
        field: 'date',
        type: 'temporal',
        scale: {
          domainMin: data.minDate.getTime(),
          domainMax: startOfToday().getTime(),
          clamp: true,
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
    mark: {
      type: 'line',
      interpolate: 'linear',
    },
    config: {
      font,
    },
  };
}

export async function createSignalLineChart(
  signal: ISignal,
  values: IDateValue[] | undefined,
  options: IVegaOptions
): Promise<TopLevelSpec> {
  const metas = await fetchMeta();
  const meta = metas.find((d) => d.signal === signal.id)!;
  const minDate = selectEarliestDate(metas);
  return createLineChartSpec(
    {
      title: signal.name,
      description: signal.description(),
      values: values ?? [],
      minDate,
      maxValue: Math.min(100, Math.ceil(meta.mean + 3 * meta.stdev)),
      valueTitle: `of ${signal.data.maxValue.toLocaleString()} ${signal.data.unit}`,
    },
    options
  );
}

export async function createSkeletonLineChart(options: IVegaOptions): Promise<TopLevelSpec> {
  const metas = await fetchMeta();
  const minDate = selectEarliestDate(metas);
  return createLineChartSpec(
    {
      title: 'Line Chart',
      description: 'a skeleton of a line chart',
      values: [],
      minDate,
      maxValue: 10,
      valueTitle: `of 100 people`,
    },
    options
  );
}
