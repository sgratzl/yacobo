import { useFallback } from '@/client/hooks';
import { extractDate, extractSignal } from '@/common/validator';
import { signals } from '@/model/signals';
import { formatAPIDate } from '@/common';
import type { GetStaticProps, GetStaticPaths } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { fetchMinMaxDate } from '@/api/data';
import { SignalDate } from '@/client/pages/SignalDate';
import { withContext } from '@/api/middleware';

export interface ISignalDateProps {
  signal: string;
  date: string;
}

export const getStaticProps: GetStaticProps<ISignalDateProps> = async (context) => {
  return {
    props: {
      signal: context.params!.signal as string,
      date: context.params!.date as string,
    },
  };
};

export const getStaticPaths: GetStaticPaths<ISignalDateProps & ParsedUrlQuery> = async () => {
  const { default: latest } = await withContext(fetchMinMaxDate);
  return {
    paths:
      process.env.NODE_ENV === 'development'
        ? []
        : signals.map((signal) => ({
            params: {
              signal: signal.id,
              date: formatAPIDate(latest),
            },
          })),
    fallback: true,
  };
};

export default function SignalDateWrapper(props: ISignalDateProps) {
  const signal = useFallback(props.signal, extractSignal, signals[0]);
  const date = useFallback(props.date, extractDate, undefined);
  return <SignalDate signal={signal} date={date} />;
}
