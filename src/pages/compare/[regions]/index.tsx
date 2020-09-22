import { fetchMinMaxDate } from '@/api/data';
import { CacheDuration } from '@/api/model';
import { useFallback } from '@/client/hooks';
import { ISerializedMinMax, useFetchMinMaxDate } from '@/client/utils';
import { extractRegions } from '@/common/validator';
import type { GetStaticPaths, GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { withContext } from '@/api/middleware';
import { RegionsCompareOverview } from '@/components/pages/RegionsCompareOverview';

interface IRegionsProps extends ISerializedMinMax {
  regions: string;
}

export const getStaticProps: GetStaticProps<IRegionsProps> = async (context) => {
  const data = await withContext(fetchMinMaxDate);
  return {
    props: {
      min: data.min.valueOf(),
      max: data.max.valueOf(),
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
  const { max: date } = useFetchMinMaxDate(props);
  return <RegionsCompareOverview regions={regions} date={date} dynamic />;
}
