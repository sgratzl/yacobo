import { fetchMinMaxDate } from '@/api/data';
import { CacheDuration } from '@/api/model';
import { useFetchMinMaxDate } from '@/client/utils';
import type { GetStaticProps } from 'next';
import { withContext } from '@/api/middleware';
import FavoritesOverview from '@/components/pages/FavoritesOverview';
import { ISerializedDateRange, serializeDateRange } from '@/model';

export const getStaticProps: GetStaticProps<ISerializedDateRange> = async () => {
  const data = await withContext(fetchMinMaxDate).then(serializeDateRange);
  return {
    props: data,
    // re generate every 12h or so
    revalidate: CacheDuration.short,
  };
};

export default function Home(props: ISerializedDateRange) {
  const data = useFetchMinMaxDate(props);
  return <FavoritesOverview date={data.default} dynamic={data} />;
}
