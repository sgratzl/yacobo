import { formatLocal, formatValue } from '@/common';
import { ISignal, regionByID } from '@/model';
import { Statistic } from 'antd';

export function dateValueTooltip(datum: { date: number; value?: number | null; stderr?: number | null }) {
  return formatLocal(new Date(datum.date));
}

export function regionValueTooltip(datum: { region: string; value?: number | null }) {
  const region = regionByID(datum.region);
  return region.name;
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
