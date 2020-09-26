import { startOfISODate, startOfISOToday } from '@/common/parseDates';
import {
  extractDateRange,
  IRegion,
  IRegionDateValue,
  isCountyRegion,
  isStateRegion,
  regionByID,
  states,
} from '@/model';
import { differenceInDays } from 'date-fns';
import type { TopLevelSpec } from 'vega-lite';
import type { SchemeParams } from 'vega-lite/build/src/scale';
import { font, IVegaOptions } from '.';
import { fetchMeta } from '../api/data';
import { HIGHLIGHT_COLOR, ZERO_COLOR } from '../model/constants';
import { axisTitle, getValueDomain, ISignal } from '../model/signals';

const DEFAULT_PIXEL_SIZE = 8;

const stateLookup: Record<string, string> = {};
for (const region of states) {
  stateLookup[region.id] = region.short;
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
    regions: IRegion[];
    regionTitle: string;
    regionLookup?: Record<string, string>;
  },
  options: IVegaOptions
) {
  const meta = {
    title: data.title,
    description: data.description,
  };
  const max = startOfISOToday();

  // TODO uses the county meta data
  const xPixels = Math.abs(differenceInDays(data.minDate, max));
  const yPixels = data.regions.length;

  let pixelSize = DEFAULT_PIXEL_SIZE * options.scaleFactor;
  let aspectRatio = 0.3;

  while (yPixels * pixelSize > 500 && pixelSize > 1) {
    // need to rescale
    pixelSize--;
  }
  if (pixelSize < DEFAULT_PIXEL_SIZE) {
    // need to adapt aspect ratio
    aspectRatio *= DEFAULT_PIXEL_SIZE / pixelSize;
  }

  const spec: TopLevelSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    ...(!options.plain ? meta : {}),
    width: xPixels * pixelSize * aspectRatio,
    height: yPixels * pixelSize,
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
          domain: data.regions.map((d) => d.id),
        },
        axis: {
          titleFontWeight: 'normal',
          title: data.regionTitle,
          ...(data.regionLookup ? { labelExpr: `${JSON.stringify(data.regionLookup)}[datum.value]` } : {}),
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
      size: Math.pow(pixelSize, 2), // fit vertically
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

  const focus = options.focus ? regionByID(options.focus) : undefined;
  const state = isCountyRegion(focus) ? focus.state : isStateRegion(focus) ? focus : undefined;

  const spec = createHeatMapChartSpec(
    {
      title: `${signal.name} - ${state?.name ?? 'US States'}`,
      description: signal.description(),
      values: values ?? [],
      minDate,
      maxValue: getValueDomain(signal, meta)[1],
      valueTitle: axisTitle(signal),
      colorScheme: signal.colorScheme,
      regionTitle: state ? `Counties of ${state.name}` : 'US State',
      regions: state ? state.counties : states,
      regionLookup: state ? undefined : stateLookup,
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
      regionTitle: 'State',
      regions: states,
    },
    options
  );
}
