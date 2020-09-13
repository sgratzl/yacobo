import { useQueryParam } from '@/api/hooks';
import { extractDate, extractRegion, extractSignal } from '@/api/validator';
import BaseLayout, { DateSelect, RegionSelect, SignalSelect } from '@/components/BaseLayout';
import { formatISODate, formatLocal } from '@/ui/utils';

export default function Region() {
  const region = useQueryParam(extractRegion);
  const signal = useQueryParam(extractSignal);
  const date = useQueryParam(extractDate);
  const apiDate = formatISODate(date);
  return (
    <BaseLayout
      pageTitle={`COVID ${region} - ${signal?.name} as of ${formatLocal(date)}`}
      mainActive="region"
      title="COVID"
      subTitle={
        <>
          <RegionSelect region={region} path="/region/[region]/[signal]/[date]" />
          -
          <SignalSelect signal={signal} path="/region/[region]/[signal]/[date]" />
          as of
          <DateSelect date={date} path="/region/[region]/[signal]/[date]" />
        </>
      }
      breadcrumb={[
        {
          breadcrumbName: region?.name ?? '',
          path: '/region/[region]',
        },
        {
          breadcrumbName: signal?.name ?? '',
          path: '/region/[region]/[signal]',
        },
        {
          breadcrumbName: apiDate,
          path: '/region/[region]/[signal]/[date]',
        },
      ]}
    ></BaseLayout>
  );
}
