import { useFallback } from '@/client/hooks';
import { extractDate, extractRegions } from '@/common/validator';
import type { GetStaticPaths, GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { RegionsCompareOverview } from '@/components/pages/RegionsCompareOverview';

interface IRegionsDateProps {
  regions: string;
  date: string;
}

export const getStaticProps: GetStaticProps<IRegionsDateProps> = async (context) => {
  return {
    props: {
      regions: context.params!.regions as string,
      date: context.params!.date as string,
    },
  };
};

export const getStaticPaths: GetStaticPaths<IRegionsDateProps & ParsedUrlQuery> = async () => {
  return {
    paths: [], // no favorite regions yet
    fallback: true,
  };
};

export default function RegionSignalDateWrapper(props: IRegionsDateProps) {
  const regions = useFallback(props.regions, extractRegions, []);
  const date = useFallback(props.date, extractDate, undefined);

  return <RegionsCompareOverview regions={regions} date={date} />;
}
