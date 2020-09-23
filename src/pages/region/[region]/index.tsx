import { fetchMinMaxDate } from '@/api/data';
import { useFallback } from '@/client/hooks';
import { useFetchDateRange } from '@/client/utils';
import { extractRegion } from '@/common/validator';
import type { GetStaticPaths, GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { RegionDate } from '@/components/pages/RegionDate';
import { withContext } from '@/api/middleware';
import { ISerializedDateRange, serializeDateRange } from '@/model';

interface IRegionProps extends ISerializedDateRange {
  region: string;
}

export const getStaticProps: GetStaticProps<IRegionProps> = async (context) => {
  const data = await withContext(fetchMinMaxDate).then(serializeDateRange);
  return {
    props: {
      ...data,
      region: context.params!.region as string,
    },
  };
};

export const getStaticPaths: GetStaticPaths<IRegionProps & ParsedUrlQuery> = async () => {
  return {
    paths: [], // no favorite regions yet
    fallback: true,
  };
};

export default function Region(props: IRegionProps) {
  const data = useFetchDateRange(props);
  const region = useFallback(props.region, extractRegion, undefined);
  return <RegionDate region={region} date={data.default} dynamic={data} />;
}
