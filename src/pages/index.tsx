import { Row, Col } from 'antd';
import { parseJSON } from 'date-fns';
import { GetStaticProps } from 'next';
import BaseLayout from '../components/BaseLayout';
import SignalSection from '../components/SignalSection';
import { fetchLatestDate } from '../data';
import { signals } from '../data/constants';
import { formatLocal } from '../ui/utils';
import styles from './index.module.scss';

export default function Home({ dateString }: { dateString: string }) {
  const date = parseJSON(dateString);
  return (
    <BaseLayout title={`COVID as of ${formatLocal(date)}`} mainActive="overview" breadcrumbs={[]}>
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
  const date = await fetchLatestDate();
  // The value of the `props` key will be
  //  passed to the `Home` component
  return {
    props: {
      dateString: date.getTime(),
    },
  };
};
