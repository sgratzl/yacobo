import { useFallback } from '@/client/hooks';
import { extractDate, extractRegions, extractSignal } from '@/common/validator';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { RegionsSignalDateCompare } from '@/components/pages/RegionsSignalDateCompare';

interface IRegionsSignalDateProps {
  regions: string;
  signal: string;
  date: string;
}

export const getStaticProps: GetStaticProps<IRegionsSignalDateProps> = async (context) => {
  return {
    props: {
      regions: context.params!.regions as string,
      signal: context.params!.signal as string,
      date: context.params!.date as string,
    },
  };
};

export const getStaticPaths: GetStaticPaths<IRegionsSignalDateProps & ParsedUrlQuery> = async () => {
  return {
    paths: [], // no favorite regions yet
    fallback: true,
  };
};

export default function RegionSignalDateWrapper(props: IRegionsSignalDateProps) {
  const regions = useFallback(props.regions, extractRegions, []);
  const signal = useFallback(props.signal, extractSignal, undefined);
  const date = useFallback(props.date, extractDate, undefined);

  return <RegionsSignalDateCompare regions={regions} signal={signal} date={date} />;
}
