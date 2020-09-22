import { useQueryParam } from '@/client/hooks';
import { extractDate, extractRegion } from '@/common/validator';
import { RegionDate } from '@/components/pages/RegionDate';

export default function RegionDateWrapper() {
  const region = useQueryParam(extractRegion);
  const date = useQueryParam(extractDate);
  return <RegionDate date={date} region={region} />;
}
