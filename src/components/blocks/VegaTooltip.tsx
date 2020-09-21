import { formatLocal, formatValue } from '@/common';
import { isFakeRegion, ISignal, regionByID } from '@/model';
import { Statistic } from 'antd';

export function dateValueTooltip(datum: { date: number }) {
  return `${formatLocal(new Date(datum.date))} (Click to select)`;
}

export function regionValueTooltip(datum: { region: string }) {
  const region = regionByID(datum.region);
  return `${region.name}${!isFakeRegion(region) ? ' (Click to select)' : ''}`;
}

export function regionDateValueTooltip(datum: { region: string; date: number }) {
  const region = regionByID(datum.region);
  return `${region.name} as of ${formatLocal(new Date(datum.date))} ${
    !isFakeRegion(region) ? ' (Click to select)' : ''
  }`;
}

export function valueTooltipContent(
  signal: ISignal | undefined,
  datum: { value?: number | null; stderr?: number | null }
) {
  return (
    <Statistic
      value={formatValue(datum.value)}
      suffix={`of ${formatValue(signal?.data.maxValue ?? 100)} ${signal?.data.unit ?? 'people'}`}
    />
  );
}
