import { fetchMinMaxDate } from '@/api/data';
import { CacheDuration } from '@/api/model';
import { useFallback } from '@/client/hooks';
import { ISerializedMinMax, useFetchMinMaxDate } from '@/client/utils';
import { extractSignal } from '@/common/validator';
import { signals } from '@/model/signals';
import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { SignalDate } from '@/components/pages/SignalDate';

interface ISignalProps extends ISerializedMinMax {
  signal: string;
}

export const getStaticProps: GetStaticProps<ISignalProps> = async (context) => {
  const data = await fetchMinMaxDate();
  return {
    props: {
      signal: context.params!.signal as string,
      min: data.min.getTime(),
      max: data.max.getTime(),
    },
    revalidate: CacheDuration.short,
  };
};

export const getStaticPaths: GetStaticPaths<{ signal: string } & ParsedUrlQuery> = async () => {
  return {
    paths: signals.map((signal) => ({
      params: {
        signal: signal.id,
      },
    })),
    fallback: true,
  };
};

export default function Signal(props: ISignalProps) {
  const { max: date } = useFetchMinMaxDate(props);
  const signal = useFallback(props.signal, extractSignal, signals[0]);
  return <SignalDate signal={signal} date={date} />;
}
