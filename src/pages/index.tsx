import { fetchMinMaxDate } from '@/api/data';
import { CacheDuration } from '@/api/model';
import { ISerializedMinMax, useFetchMinMaxDate } from '@/client/utils';
import { GetStaticProps } from 'next';
import { DateOverview } from '@/components/pages/DateOverview';
import { withContext } from '@/api/middleware';

export const getStaticProps: GetStaticProps<ISerializedMinMax> = async () => {
  const data = await withContext(fetchMinMaxDate);
  return {
    props: {
      min: data.min.valueOf(),
      max: data.max.valueOf(),
    },
    // re generate every 12h or so
    revalidate: CacheDuration.short,
  };
};

export default function Home(props: ISerializedMinMax) {
  const { max: date } = useFetchMinMaxDate(props);
  return <DateOverview date={date} dynamic />;
}
