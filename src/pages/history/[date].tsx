import { useQueryParam } from '@/client/hooks';
import { extractDate } from '@/common/validator';
import BaseLayout, { DateSelect } from '@/components/BaseLayout';
import SignalSection from '@/components/SignalSection';
import { signals } from '@/model/signals';
import { formatAPIDate, formatLocal } from '@/common';
import { Col, Row } from 'antd';
import styles from '../index.module.scss';

export default function History() {
  const date = useQueryParam(extractDate);

  return (
    <BaseLayout
      pageTitle={`COVID as of ${formatLocal(date)}`}
      mainActive="overview"
      title="COVID"
      subTitle={
        <>
          as of
          <DateSelect date={date} path="/history/[date]" />
        </>
      }
      breadcrumb={[
        {
          breadcrumbName: formatAPIDate(date),
          path: `/history/[date]`,
        },
      ]}
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
