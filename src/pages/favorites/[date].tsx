import { formatAPIDate } from '@/common';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { fetchMinMaxDate } from '@/api/data';
import { estimateDateToPreRender } from '@/api/model';
import { useFallback } from '@/client/hooks';
import { extractDate } from '@/common/validator';
import type { ParsedUrlQuery } from 'querystring';
import { withContext } from '@/api/middleware';
import FavoritesOverview from '@/client/pages/FavoritesOverview';

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
  const { default: latest } = await withContext(fetchMinMaxDate);
  const datesToRender = estimateDateToPreRender(latest);
  return {
    paths: datesToRender.map((date) => ({
      params: {
        date: formatAPIDate(date),
      },
    })),
    fallback: true,
  };
};

export default function FavoritesOverviewWrapper(props: IDateOverviewProps) {
  const date = useFallback(props.date, extractDate, undefined);

  return <FavoritesOverview date={date} />;
}
