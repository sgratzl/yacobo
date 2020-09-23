import { useFallback } from '@/client/hooks';
import { extractDate, extractRegion, extractSignal } from '@/common/validator';
import { RegionSignalDate } from '@/components/pages/RegionSignalDate';
import type { NextPage } from 'next';

interface IProps {
  region: string;
  date: string;
  signal: string;
}

const Page: NextPage<IProps> = (props) => {
  const region = useFallback(props.region, extractRegion, undefined);
  const signal = useFallback(props.signal, extractSignal, undefined);
  const date = useFallback(props.date, extractDate, undefined);
  return <RegionSignalDate region={region} signal={signal} date={date} />;
};

Page.getInitialProps = async (ctx) => {
  return {
    region: ctx.query.region as string,
    date: ctx.query.date as string,
    signal: ctx.query.signal as string,
  };
};

export default Page;
