import { useQueryParam } from '@/client/hooks';
import { extractDate, extractRegions } from '@/common/validator';
import { RegionsCompareOverview } from '@/components/pages/RegionsCompareOverview';

export default function RegionSignalDateWrapper() {
  const regions = useQueryParam(extractRegions, []);
  const date = useQueryParam(extractDate);

  return <RegionsCompareOverview regions={regions} date={date} />;
}
