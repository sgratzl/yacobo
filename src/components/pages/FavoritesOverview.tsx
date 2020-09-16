import { formatLocal } from '@/common';
import BaseLayout from '@/components/blocks/BaseLayout';
import GridColumn from '@/components/blocks/GridColumn';
import { Row } from 'antd';
import { useFavorites } from '../blocks/useFavorites';
import FavoriteSection from '../sections/FavoriteSection';

export default function FavoritesOverview({ date }: { date?: Date }) {
  const [favorites] = useFavorites();
  return (
    <BaseLayout
      pageTitle={`COVID as of ${formatLocal(date)}`}
      mainActive="favorites"
      title="COVID"
      subTitle={`as of ${formatLocal(date)}`}
      breadcrumb={[
        {
          breadcrumbName: 'Favorites',
          path: `/favorites`,
        },
      ]}
    >
      <Row>
        {favorites.map((favorite) => (
          <GridColumn key={favorite.id}>
            <FavoriteSection favorite={favorite} date={date} />
          </GridColumn>
        ))}
      </Row>
    </BaseLayout>
  );
}
