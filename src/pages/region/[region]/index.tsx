import { fetchMinMaxDate } from '@/api/data';
import { useFallback } from '@/client/hooks';
import { ISerializedMinMax, useFetchMinMaxDate } from '@/client/utils';
import { extractRegion } from '@/common/validator';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { RegionDate } from '@/components/pages/RegionDate';
import { withContext } from '@/api/middleware';

interface IRegionProps extends ISerializedMinMax {
  region: string;
}

export const getStaticProps: GetStaticProps<IRegionProps> = async (context) => {
  const data = await withContext(fetchMinMaxDate);
  return {
    props: {
      min: data.min.valueOf(),
      max: data.max.valueOf(),
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
  const { max: date } = useFetchMinMaxDate(props);
  const region = useFallback(props.region, extractRegion, undefined);
  return <RegionDate region={region} date={date} dynamic />;
}
