import { useQueryParam } from '@/client/hooks';
import { extractRegions, extractSignal } from '@/common/validator';
import { RegionsSignalCompare } from '@/components/pages/RegionsSignalCompare';

export default function RegionSignalWrapper() {
  const regions = useQueryParam(extractRegions, []);
  const signal = useQueryParam(extractSignal);

  return <RegionsSignalCompare regions={regions} signal={signal} />;
}
