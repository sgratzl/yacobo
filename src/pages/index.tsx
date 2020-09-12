import { Row, Col } from 'antd';
import { max, parseJSON } from 'date-fns';
import { GetStaticProps } from 'next';
import BaseLayout from '../components/BaseLayout';
import SignalSection from '../components/SignalSection';
import { fetchMeta } from '../data';
import { signals } from '../data/constants';
import styles from './index.module.scss';

export default function Home({ dateString }: { dateString: string }) {
  const date = parseJSON(dateString);
  return (
    <BaseLayout title="My COVIDcast" mainActive="overview">
      <Row>
        {signals.map((s) => (
          <Col key={s.id} xs={24} sm={24} md={12} span={8} className={styles.col}>
            <SignalSection signal={s} date={date} />
          </Col>
        ))}
      </Row>
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
