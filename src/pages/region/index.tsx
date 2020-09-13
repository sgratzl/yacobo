import BaseLayout, { RegionSelect } from '@/components/BaseLayout';

export default function Region() {
  return (
    <BaseLayout
      pageTitle={`COVID Single Region`}
      mainActive="region"
      title="COVID"
      subTitle={
        <>
          <RegionSelect path="/region/[region]" clearPath="/" />
        </>
      }
      breadcrumb={[
        {
          breadcrumbName: 'Single County',
          path: '/region/',
        },
      ]}
    ></BaseLayout>
  );
}
