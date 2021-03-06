import { fetchMinMaxDate } from '@/api/data';
import { CacheDuration } from '@/api/model';
import { useFallback } from '@/client/hooks';
import { useFetchDateRange } from '@/client/utils';
import { extractRegions } from '@/common/validator';
import type { GetStaticPaths, GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { withContext } from '@/api/middleware';
import { RegionsCompareOverview } from '@/client/pages/RegionsCompareOverview';
import { ISerializedDateRange, serializeDateRange } from '@/model';

interface IRegionsProps extends ISerializedDateRange {
  regions: string;
}

export const getStaticProps: GetStaticProps<IRegionsProps> = async (context) => {
  const data = await withContext(fetchMinMaxDate).then(serializeDateRange);
  return {
    props: {
      ...data,
      regions: context.params!.regions as string,
    },
    revalidate: CacheDuration.short,
  };
};

export const getStaticPaths: GetStaticPaths<IRegionsProps & ParsedUrlQuery> = async () => {
  return {
    paths: [], // no favorite regions yet
    fallback: true,
  };
};

export default function RegionSignalWrapper(props: IRegionsProps) {
  const regions = useFallback(props.regions, extractRegions, []);
  const data = useFetchDateRange(props);
  return <RegionsCompareOverview regions={regions} date={data.default} dynamic={data} />;
}
