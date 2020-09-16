import { fetchMinMaxDate } from '@/api/data';
import { CacheDuration } from '@/api/model';
import { useFallback } from '@/client/hooks';
import { ISerializedMinMax, useFetchMinMaxDate } from '@/client/utils';
import { extractRegion, extractSignal } from '@/common/validator';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { RegionSignalDate } from '@/routes/RegionSignalDate';

interface IRegionSignalProps extends ISerializedMinMax {
  region: string;
  signal: string;
}

export const getStaticProps: GetStaticProps<IRegionSignalProps> = async (context) => {
  const data = await fetchMinMaxDate();
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

export default function RegionSignal(props: IRegionSignalProps) {
  const { min: date } = useFetchMinMaxDate(props);
  const region = useFallback(props.region, extractRegion, undefined);
  const signal = useFallback(props.signal, extractSignal, undefined);

  return <RegionSignalDate region={region} signal={signal} date={date} />;
}
