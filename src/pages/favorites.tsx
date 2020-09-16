import { fetchMinMaxDate } from '@/api/data';
import { CacheDuration } from '@/api/model';
import { ISerializedMinMax, useFetchMinMaxDate } from '@/client/utils';
import { GetStaticProps } from 'next';
import { withContext } from '@/api/middleware';
import dynamic from 'next/dynamic';

export const getStaticProps: GetStaticProps<ISerializedMinMax> = async () => {
  const data = await withContext(fetchMinMaxDate);
  return {
    props: {
      min: data.min.getTime(),
      max: data.max.getTime(),
    },
    // re generate every 12h or so
    revalidate: CacheDuration.short,
  };
};

const Favorites = dynamic(() => import('@/components/pages/FavoritesOverview'), {
  ssr: false,
});

export default function Home(props: ISerializedMinMax) {
  const { max: date } = useFetchMinMaxDate(props);
  return <Favorites date={date} />;
}
