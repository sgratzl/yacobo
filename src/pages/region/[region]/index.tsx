import { fetchMinMaxDate } from '@/api/data';
import { useQueryParam } from '@/client/hooks';
import { ISerializedMinMax, useFetchMinMaxDate } from '@/client/utils';
import { extractRegion } from '@/common/validator';
import BaseLayout, { RegionSelect } from '@/components/BaseLayout';
import { GetStaticProps } from 'next';

export default function Region(props: ISerializedMinMax) {
  const date = useFetchMinMaxDate(props);
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

export const getStaticProps: GetStaticProps<ISerializedMinMax> = async (context) => {
  const data = await fetchMinMaxDate();
  return {
    props: {
      min: data.min.getTime(),
      max: data.max.getTime(),
    },
  };
};
