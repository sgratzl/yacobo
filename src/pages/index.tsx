import { Col, Row } from 'antd';
import BaseLayout, { DateSelect } from '../components/BaseLayout';
import SignalSection from '../components/SignalSection';
import { signals } from '../data/constants';
import { formatLocal, useFetchLatestDate } from '../ui/utils';
import styles from './index.module.scss';

export default function Home() {
  const date = useFetchLatestDate();
  return (
    <BaseLayout
      pageTitle={`COVID${date ? ` as of ${formatLocal(date)}` : ''}`}
      mainActive="overview"
      backIcon={false}
      title="COVID"
      subTitle={
        date ? (
          <>
            as of
            <DateSelect date={date} path="/history/[date]" />
          </>
        ) : undefined
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
