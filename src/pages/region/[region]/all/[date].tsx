import { useQueryParam } from '@/client/hooks';
import { extractDate, extractRegion } from '@/common/validator';
import BaseLayout, { DateSelect, RegionSelect } from '@/components/BaseLayout';
import { formatAPIDate, formatLocal } from '@/common';

export default function Region() {
  const region = useQueryParam(extractRegion);
  const date = useQueryParam(extractDate);
  const apiDate = formatAPIDate(date);
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
