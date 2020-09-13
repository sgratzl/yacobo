import { useQueryParam } from '@/api/hooks';
import { extractRegion } from '@/api/validator';
import BaseLayout, { RegionSelect } from '@/components/BaseLayout';

export default function Region() {
  const region = useQueryParam(extractRegion);
  return (
    <BaseLayout
      pageTitle={`COVID ${region?.name}`}
      mainActive="region"
      title="COVID"
      subTitle={
        <>
          <RegionSelect region={region} path="/region/[region]" clearPath="/region" />
        </>
      }
      breadcrumb={[
        {
          breadcrumbName: region?.name ?? '',
          path: '/region/[region]',
        },
      ]}
    ></BaseLayout>
  );
}
