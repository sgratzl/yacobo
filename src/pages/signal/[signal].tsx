import { fetchMinMaxDate } from '@/api/data';
import { CacheDuration } from '@/api/model';
import { useFallback } from '@/client/hooks';
import { ISerializedMinMax, useFetchMinMaxDate } from '@/client/utils';
import { extractSignal } from '@/common/validator';
import { signals } from '@/model/signals';
import type { GetStaticPaths, GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { SignalDate } from '@/components/pages/SignalDate';
import { withContext } from '@/api/middleware';

interface ISignalProps extends ISerializedMinMax {
  signal: string;
}

export const getStaticProps: GetStaticProps<ISignalProps> = async (context) => {
  const data = await withContext(fetchMinMaxDate);
  return {
    props: {
      signal: context.params!.signal as string,
      min: data.min.valueOf(),
      max: data.max.valueOf(),
    },
    revalidate: CacheDuration.short,
  };
};

export const getStaticPaths: GetStaticPaths<{ signal: string } & ParsedUrlQuery> = async () => {
  return {
    paths:
      process.env.NODE_ENV === 'development'
        ? []
        : signals.map((signal) => ({
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
