import { formatAPIDate } from '@/common';
import { GetStaticPaths, GetStaticProps } from 'next';
import { fetchMinMaxDate } from '@/api/data';
import { estimateDateToPreRender } from '@/api/model';
import { useFallback } from '@/client/hooks';
import { extractDate } from '@/common/validator';
import { ParsedUrlQuery } from 'querystring';
import { DateOverview } from '@/routes/DateOverview';

interface IDateOverviewProps {
  date: string;
}

export const getStaticProps: GetStaticProps<IDateOverviewProps> = async (context) => {
  return {
    props: {
      date: context.params!.date as string,
    },
  };
};

export const getStaticPaths: GetStaticPaths<IDateOverviewProps & ParsedUrlQuery> = async () => {
  const { max } = await fetchMinMaxDate();
  const datesToRender = estimateDateToPreRender(max);
  return {
    paths: datesToRender.map((date) => ({
      params: {
        date: formatAPIDate(date),
      },
    })),
    fallback: true,
  };
};

export default function DateOverviewWrapper(props: IDateOverviewProps) {
  const date = useFallback(props.date, extractDate, undefined);

  return <DateOverview date={date} />;
}
