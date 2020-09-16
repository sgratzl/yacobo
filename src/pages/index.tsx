import { fetchMinMaxDate } from '@/api/data';
import { CacheDuration } from '@/api/model';
import { ISerializedMinMax, useFetchMinMaxDate } from '@/client/utils';
import { GetStaticProps } from 'next';
import { DateOverview } from '@/components/pages/DateOverview';

export const getStaticProps: GetStaticProps<ISerializedMinMax> = async () => {
  const data = await fetchMinMaxDate();
  return {
    props: {
      min: data.min.getTime(),
      max: data.max.getTime(),
    },
    // re generate every 12h or so
    revalidate: CacheDuration.short,
  };
};

export default function Home(props: ISerializedMinMax) {
  const { max: date } = useFetchMinMaxDate(props);
  return <DateOverview date={date} />;
}
