import { formatAPIDate, formatLocal } from '@/common';
import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
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

export default function FavoritesOverview({ date, dynamic }: { date?: Date; dynamic?: boolean }) {
  return (
    <BaseLayout
      pageTitle={`My Favorites as of ${formatLocal(date)}`}
      mainActive="favorites"
      title="My Favorites"
      description={`Overview of the United States as of ${formatAPIDate(date)} showing the personal favorites`}
      subTitle={<DateSelect date={date} path={`/favorites/[date]`} clearPath="/" />}
      breadcrumb={[
        {
          breadcrumbName: 'Favorites',
          path: `/favorites`,
        },
        dynamic
          ? []
          : [
              {
                breadcrumbName: formatAPIDate(date),
                path: `/favorites/[date]`,
              },
            ],
      ].flat()}
    >
      <FavoritesGridNoSSR date={date} />
    </BaseLayout>
  );
}
