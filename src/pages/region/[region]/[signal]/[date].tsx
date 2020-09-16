import { useFallback } from '@/client/hooks';
import { extractDate, extractRegion, extractSignal } from '@/common/validator';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { RegionSignalDate } from '@/routes/RegionSignalDate';

interface IRegionSignalDateProps {
  region: string;
  signal: string;
  date: string;
}

export const getStaticProps: GetStaticProps<IRegionSignalDateProps> = async (context) => {
  return {
    props: {
      region: context.params!.region as string,
      signal: context.params!.signal as string,
      date: context.params!.date as string,
    },
  };
};

export const getStaticPaths: GetStaticPaths<IRegionSignalDateProps & ParsedUrlQuery> = async () => {
  return {
    paths: [], // no favorite regions yet
    fallback: true,
  };
};

export default function RegionSignalDateWrapper(props: IRegionSignalDateProps) {
  const region = useFallback(props.region, extractRegion, undefined);
  const signal = useFallback(props.signal, extractSignal, undefined);
  const date = useFallback(props.date, extractDate, undefined);

  return <RegionSignalDate region={region} signal={signal} date={date} />;
}
