import { useFallback } from '@/client/hooks';
import { extractDate, extractRegions, extractSignal } from '@/common/validator';
import { RegionsSignalDateCompare } from '@/components/pages/RegionsSignalDateCompare';
import type { NextPage } from 'next';

interface IProps {
  regions: string;
  signal: string;
  date: string;
}

const Page: NextPage<IProps> = (props) => {
  const regions = useFallback(props.regions, extractRegions, []);
  const signal = useFallback(props.signal, extractSignal, undefined);
  const date = useFallback(props.date, extractDate, undefined);
  return <RegionsSignalDateCompare regions={regions} signal={signal} date={date} />;
};

Page.getInitialProps = async (ctx) => {
  return {
    regions: ctx.query.regions as string,
    signal: ctx.query.signal as string,
    date: ctx.query.date as string,
  };
};

export default Page;
