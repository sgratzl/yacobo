import { useFallback } from '@/client/hooks';
import { extractDate, extractRegion } from '@/common/validator';
import { RegionDate } from '@/components/pages/RegionDate';
import type { NextPage } from 'next';

interface IProps {
  region: string;
  date: string;
}

const Page: NextPage<IProps> = (props) => {
  const region = useFallback(props.region, extractRegion, undefined);
  const date = useFallback(props.date, extractDate, undefined);
  return <RegionDate date={date} region={region} />;
};

Page.getInitialProps = async (ctx) => {
  return {
    region: ctx.query.region as string,
    date: ctx.query.date as string,
  };
};

export default Page;
