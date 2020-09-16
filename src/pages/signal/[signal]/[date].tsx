import { useFallback } from '@/client/hooks';
import { extractDate, extractSignal } from '@/common/validator';
import { signals } from '@/model/signals';
import { formatAPIDate } from '@/common';
import { GetStaticProps, GetStaticPaths } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { fetchMinMaxDate } from '@/api/data';
import { SignalDate } from '@/components/pages/SignalDate';

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
  const { max } = await fetchMinMaxDate();
  return {
    paths: signals.map((signal) => ({
      params: {
        signal: signal.id,
        date: formatAPIDate(max),
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
