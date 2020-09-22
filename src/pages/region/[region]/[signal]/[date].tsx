import { useQueryParam } from '@/client/hooks';
import { extractDate, extractRegion, extractSignal } from '@/common/validator';
import { RegionSignalDate } from '@/components/pages/RegionSignalDate';

export default function RegionSignalDateWrapper() {
  const region = useQueryParam(extractRegion);
  const signal = useQueryParam(extractSignal);
  const date = useQueryParam(extractDate);

  return <RegionSignalDate region={region} signal={signal} date={date} />;
}
