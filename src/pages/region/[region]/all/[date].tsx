import { useFallback } from '@/client/hooks';
import { extractDate, extractRegion } from '@/common/validator';
import { GetStaticProps, GetStaticPaths } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { RegionDate } from '@/routes/RegionDate';

interface IRegionDateProps {
  region: string;
  date: string;
}

export const getStaticProps: GetStaticProps<IRegionDateProps> = async (context) => {
  return {
    props: {
      region: context.params!.region as string,
      date: context.params!.date as string,
    },
  };
};

export const getStaticPaths: GetStaticPaths<IRegionDateProps & ParsedUrlQuery> = async () => {
  return {
    paths: [], // no favorite regions yet
    fallback: true,
  };
};

export default function RegionDateWrapper(props: IRegionDateProps) {
  const region = useFallback(props.region, extractRegion, undefined);
  const date = useFallback(props.region, extractDate, undefined);
  return <RegionDate date={date} region={region} />;
}
