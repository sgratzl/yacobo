import { useQueryParam } from '@/client/hooks';
import { extractDate, extractRegions, extractSignal } from '@/common/validator';
import { RegionsSignalDateCompare } from '@/components/pages/RegionsSignalDateCompare';

export default function RegionSignalDateWrapper() {
  const regions = useQueryParam(extractRegions, []);
  const signal = useQueryParam(extractSignal);
  const date = useQueryParam(extractDate);

  return <RegionsSignalDateCompare regions={regions} signal={signal} date={date} />;
}
