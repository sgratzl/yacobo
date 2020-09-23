import { fetchMinMaxDate } from '@/api/data';
import { CacheDuration } from '@/api/model';
import { useFetchMinMaxDate } from '@/client/utils';
import type { GetStaticProps } from 'next';
import { DateOverview } from '@/components/pages/DateOverview';
import { withContext } from '@/api/middleware';
import { ISerializedDateRange, serializeDateRange } from '@/common/range';

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
  return <DateOverview date={data.latest} dynamic={data} />;
}
