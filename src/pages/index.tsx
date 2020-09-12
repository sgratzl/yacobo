import { max, parseJSON } from 'date-fns';
import { GetStaticProps } from 'next';
import BaseLayout from '../components/BaseLayout';
import SignalSection from '../components/SignalSection';
import { fetchMeta } from '../data';
import { signals } from '../data/constants';

export default function Home({ dateString }: { dateString: string }) {
  const date = parseJSON(dateString);
  return (
    <BaseLayout title="My COVIDcast" mainActive="overview">
      {signals.map((s) => (
        <SignalSection key={s.id} signal={s} date={date} />
      ))}
    </BaseLayout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // Get external data from the file system, API, DB, etc.
  const data = await fetchMeta();

  const maxDate = max(data.map((d) => d.meta.maxTime));
  // The value of the `props` key will be
  //  passed to the `Home` component
  return {
    props: {
      dateString: maxDate.getTime(),
    },
  };
};
