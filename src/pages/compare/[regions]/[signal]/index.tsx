import { fetchMinMaxDate } from '@/api/data';
import { CacheDuration } from '@/api/model';
import { useFallback } from '@/client/hooks';
import { ISerializedMinMax } from '@/client/utils';
import { extractRegions, extractSignal } from '@/common/validator';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { withContext } from '@/api/middleware';
import { RegionsSignalCompare } from '@/components/pages/RegionsSignalCompare';

interface IRegionsSignalProps extends ISerializedMinMax {
  regions: string;
  signal: string;
}

export const getStaticProps: GetStaticProps<IRegionsSignalProps> = async (context) => {
  const data = await withContext(fetchMinMaxDate);
  return {
    props: {
      min: data.min.valueOf(),
      max: data.max.valueOf(),
      regions: context.params!.regions as string,
      signal: context.params!.signal as string,
    },
    revalidate: CacheDuration.short,
  };
};

export const getStaticPaths: GetStaticPaths<IRegionsSignalProps & ParsedUrlQuery> = async () => {
  return {
    paths: [], // no favorite regions yet
    fallback: true,
  };
};

export default function RegionSignalWrapper(props: IRegionsSignalProps) {
  const regions = useFallback(props.regions, extractRegions, []);
  const signal = useFallback(props.signal, extractSignal, undefined);

  return <RegionsSignalCompare regions={regions} signal={signal} />;
}
