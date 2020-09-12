import { Row, Col } from 'antd';
import Link from 'next/link';
import { useQueryParam } from '@/api/hooks';
import { extractDate } from '@/api/validator';
import BaseLayout from '@/components/BaseLayout';
import SignalSection from '@/components/SignalSection';
import { LATEST } from '@/data';
import { signals } from '@/data/constants';
import { formatLocal, formatISODate } from '@/ui/utils';
import styles from '../index.module.scss';

export default function History() {
  const date = useQueryParam(extractDate);

  const breadcrumbs = [
    <Link href="/history/[date]" as={`/history/${formatISODate(date)}`}>
      {formatISODate(date)}
    </Link>,
  ];
  return (
    <BaseLayout title={`COVID as of ${formatLocal(date)}`} mainActive="overview" breadcrumbs={breadcrumbs}>
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
