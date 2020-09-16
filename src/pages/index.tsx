import { Col, Row } from 'antd';
import BaseLayout, { DateSelect } from '../components/BaseLayout';
import FavoriteSection from '../components/FavoriteSection';
import { useFavorites } from '../components/useFavorites';
import { formatLocal, useFetchMinMaxDate } from '../ui/utils';
import styles from './index.module.scss';

export default function Home() {
  const { max: date } = useFetchMinMaxDate();
  const [bookmarks] = useFavorites();
  return (
    <BaseLayout
      pageTitle={`COVID-19${date ? ` as of ${formatLocal(date)}` : ''}`}
      mainActive="overview"
      backIcon={false}
      title="YaCoBo"
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
        {bookmarks.map((bookmark) => (
          <Col key={bookmark.id} xs={24} sm={24} md={12} lg={8} className={styles.col}>
            <FavoriteSection bookmark={bookmark} date={date} />
          </Col>
        ))}
      </Row>
    </BaseLayout>
  );
}
