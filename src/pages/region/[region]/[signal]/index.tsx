import { useQueryParam } from '@/api/hooks';
import { extractRegion, extractSignal } from '@/api/validator';
import BaseLayout, { RegionSelect, SignalSelect } from '@/components/BaseLayout';

export default function Region() {
  const region = useQueryParam(extractRegion);
  const signal = useQueryParam(extractSignal);
  return (
    <BaseLayout
      pageTitle={`COVID ${region} - ${signal?.name}`}
      mainActive="region"
      title="COVID"
      subTitle={
        <>
          <RegionSelect region={region} path="/region/[region]/[signal]/[date]" />
          -
          <SignalSelect signal={signal} path="/region/[region]/[signal]/[date]" />
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
      ]}
    ></BaseLayout>
  );
}
