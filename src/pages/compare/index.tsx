import { fetchMinMaxDate } from '@/api/data';
import { CacheDuration } from '@/api/model';
import { useFetchDateRange } from '@/client/utils';
import type { GetStaticProps } from 'next';
import { CompareOverview } from '@/components/pages/CompareOverview';
import { withContext } from '@/api/middleware';
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
  const data = useFetchDateRange(props);
  return <CompareOverview date={data.default} dynamic={data} />;
}
