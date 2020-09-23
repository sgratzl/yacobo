import { formatValue } from '@/common';
import type { ISignal } from '@/model';
import { Statistic } from 'antd';

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
