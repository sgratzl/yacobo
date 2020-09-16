import { formatLocal } from '@/common';
import GridColumn from '@/components/GridColumn';
import { Row } from 'antd';
import { useFetchMinMaxDate } from '../client/utils';
import BaseLayout, { DateSelect } from '../components/BaseLayout';
import FavoriteSection from '../components/FavoriteSection';
import { useFavorites } from '../components/useFavorites';

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
          <GridColumn key={bookmark.id}>
            <FavoriteSection bookmark={bookmark} date={date} />
          </GridColumn>
        ))}
      </Row>
    </BaseLayout>
  );
}
