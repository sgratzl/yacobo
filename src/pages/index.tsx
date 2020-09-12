import { GetStaticProps } from 'next';
import Head from 'next/head';
import SignalSection from '../components/SignalSection';
import { fetchMeta } from '../data';
import { ISignal } from '../data/constants';
import styles from '../styles/Home.module.css';

export default function Home({ data }: { data: ISignal[] }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>My COVIDcast</title>
      </Head>
      <h1>My COVIDCast</h1>
      <main className={styles.main}>
        {data.map((s) => (
          <SignalSection key={s.id} signal={s} />
        ))}
      </main>
      <footer></footer>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // Get external data from the file system, API, DB, etc.
  const data = await fetchMeta();

  // The value of the `props` key will be
  //  passed to the `Home` component
  return {
    props: {
      data,
    },
  };
};
