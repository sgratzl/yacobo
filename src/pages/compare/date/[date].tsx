import { useFallback } from '@/client/hooks';
import { extractDate } from '@/common/validator';
import { CompareOverview } from '@/components/pages/CompareOverview';
import type { NextPage } from 'next';

interface IProps {
  date: string;
}

const Page: NextPage<IProps> = (props) => {
  const date = useFallback(props.date, extractDate, undefined);
  return <CompareOverview date={date} />;
};

Page.getInitialProps = async (ctx) => {
  return {
    date: ctx.query.date as string,
  };
};

export default Page;
