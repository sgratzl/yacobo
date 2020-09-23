import { useFallback } from '@/client/hooks';
import { extractDate, extractRegions } from '@/common/validator';
import { RegionsCompareOverview } from '@/client/pages/RegionsCompareOverview';
import type { NextPage } from 'next';

interface IProps {
  regions: string;
  date: string;
}

const Page: NextPage<IProps> = (props) => {
  const regions = useFallback(props.regions, extractRegions, []);
  const date = useFallback(props.date, extractDate, undefined);
  return <RegionsCompareOverview regions={regions} date={date} />;
};

Page.getInitialProps = async (ctx) => {
  return {
    regions: ctx.query.regions as string,
    date: ctx.query.date as string,
  };
};

export default Page;
