import { useFallback } from '@/client/hooks';
import { extractRegion, extractSignal } from '@/common/validator';
import { RegionSignal } from '@/client/pages/RegionSignal';
import type { NextPage } from 'next';

interface IProps {
  region: string;
  signal: string;
}

const Page: NextPage<IProps> = (props) => {
  const region = useFallback(props.region, extractRegion, undefined);
  const signal = useFallback(props.signal, extractSignal, undefined);
  return <RegionSignal region={region} signal={signal} />;
};

Page.getInitialProps = async (ctx) => {
  return {
    region: ctx.query.region as string,
    signal: ctx.query.signal as string,
  };
};

export default Page;
