import { formatLocal } from '@/common';
import BaseLayout from '@/components/blocks/BaseLayout';
import GridColumn from '@/components/blocks/GridColumn';
import { Row } from 'antd';
import dynamic from 'next/dynamic';
import { useFavorites } from '../blocks/useFavorites';
import FavoriteSection from '../sections/FavoriteSection';

function FavoritesGrid({ date }: { date?: Date }) {
  const [favorites] = useFavorites();
  return (
    <Row>
      {favorites.map((favorite) => (
        <GridColumn key={favorite.id}>
          <FavoriteSection favorite={favorite} date={date} />
        </GridColumn>
      ))}
    </Row>
  );
}

const FavoritesGridNoSSR = dynamic(() => Promise.resolve(FavoritesGrid), { ssr: false });

export default function FavoritesOverview({ date }: { date?: Date }) {
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
      <FavoritesGridNoSSR date={date} />
    </BaseLayout>
  );
}
