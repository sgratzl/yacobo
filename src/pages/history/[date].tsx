import { Row, Col } from 'antd';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import { extractDate } from '../../api/validator';
import BaseLayout from '../../components/BaseLayout';
import SignalSection from '../../components/SignalSection';
import { signals } from '../../data/constants';
import { formatLocal, formatISODate } from '../../ui/utils';
import styles from '../index.module.scss';

export default function History() {
  const router = useRouter();
  const date = extractDate(router);

  const breadcrumbs = [
    <Link href="/history/[date]" as={`/history/${formatISODate(date)}`}>
      {formatISODate(date)}
    </Link>,
  ];
  return (
    <BaseLayout title={`COVID as of ${formatLocal(date)}`} mainActive="overview" breadcrumbs={breadcrumbs}>
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
