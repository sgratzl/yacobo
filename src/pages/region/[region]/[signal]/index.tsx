import { fetchMinMaxDate } from '@/api/data';
import { CacheDuration } from '@/api/model';
import { useFallback } from '@/client/hooks';
import { ISerializedMinMax, useFetchMinMaxDate } from '@/client/utils';
import { extractRegion, extractSignal } from '@/common/validator';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { withContext } from '@/api/middleware';
import { RegionSignal } from '../../../../components/pages/RegionSignal';

interface IRegionSignalProps extends ISerializedMinMax {
  region: string;
  signal: string;
}

export const getStaticProps: GetStaticProps<IRegionSignalProps> = async (context) => {
  const data = await withContext(fetchMinMaxDate);
  return {
    props: {
      min: data.min.getTime(),
      max: data.max.getTime(),
      region: context.params!.region as string,
      signal: context.params!.signal as string,
    },
    revalidate: CacheDuration.short,
  };
};

export const getStaticPaths: GetStaticPaths<IRegionSignalProps & ParsedUrlQuery> = async () => {
  return {
    paths: [], // no favorite regions yet
    fallback: true,
  };
};

export default function RegionSignalWrapper(props: IRegionSignalProps) {
  const region = useFallback(props.region, extractRegion, undefined);
  const signal = useFallback(props.signal, extractSignal, undefined);

  return <RegionSignal region={region} signal={signal} />;
}
