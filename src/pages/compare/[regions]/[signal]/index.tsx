import { useFallback } from '@/client/hooks';
import { extractRegions, extractSignal } from '@/common/validator';
import { RegionsSignalCompare } from '@/client/pages/RegionsSignalCompare';
import type { NextPage } from 'next';

interface IProps {
  regions: string;
  signal: string;
}

const Page: NextPage<IProps> = (props) => {
  const regions = useFallback(props.regions, extractRegions, []);
  const signal = useFallback(props.signal, extractSignal, undefined);
  return <RegionsSignalCompare regions={regions} signal={signal} />;
};

Page.getInitialProps = async (ctx) => {
  return {
    regions: ctx.query.regions as string,
    signal: ctx.query.signal as string,
  };
};

export default Page;
