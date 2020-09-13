import { Col, Row } from 'antd';
import { parseJSON } from 'date-fns';
import { GetStaticProps } from 'next';
import BaseLayout, { DateSelect } from '../components/BaseLayout';
import SignalSection from '../components/SignalSection';
import { fetchLatestDate } from '../data';
import { signals } from '../data/constants';
import { formatLocal } from '../ui/utils';
import styles from './index.module.scss';

export default function Home({ dateString }: { dateString: string }) {
  const date = parseJSON(dateString);

  return (
    <BaseLayout
      pageTitle={`COVID as of ${formatLocal(date)}`}
      mainActive="overview"
      backIcon={false}
      title="COVID"
      subTitle={
        <>
          as of
          <DateSelect date={date} path="/history/[date]" />
        </>
      }
      breadcrumb={[]}
    >
      <Row>
        {signals.map((s) => (
          <Col key={s.id} xs={24} sm={24} md={12} lg={8} className={styles.col}>
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
