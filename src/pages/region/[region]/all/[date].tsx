import { useQueryParam } from '@/api/hooks';
import { extractDate, extractRegion } from '@/api/validator';
import BaseLayout, { DateSelect, RegionSelect } from '@/components/BaseLayout';
import { formatISODate, formatLocal } from '@/ui/utils';

export default function Region() {
  const region = useQueryParam(extractRegion);
  const date = useQueryParam(extractDate);
  const apiDate = formatISODate(date);
  return (
    <BaseLayout
      pageTitle={`COVID ${region?.name} as of ${formatLocal(date)}`}
      mainActive="region"
      title="COVID"
      subTitle={
        <>
          <RegionSelect region={region} path="/region/[region]" clearPath="/history/[date]" />
          as of
          <DateSelect date={date} path="/region/[region]/all/[date]" clearPath="/region/[region]" />
        </>
      }
      breadcrumb={[
        {
          breadcrumbName: region?.name ?? '',
          path: '/region/[region]',
        },
        {
          breadcrumbName: apiDate,
          path: '/region/[region]/all/[date]',
        },
      ]}
    ></BaseLayout>
  );
}
