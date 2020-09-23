import { fullUrl } from '@/client/hooks';
import { formatAPIDate, formatLocal } from '@/common';
import type { IDateRange } from '@/common/range';
import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import GridColumn from '@/components/blocks/GridColumn';
import { refSignal } from '@/model';
import { Row, Typography } from 'antd';
import dynamic from 'next/dynamic';
import { useFavorites } from '../blocks/useFavorites';
// import AddFavorite from '../sections/AddFavorite';
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
      {/* <GridColumn>
          <AddFavorite />
        </GridColumn> */}
    </Row>
  );
}

const FavoritesGridNoSSR = dynamic(() => Promise.resolve(FavoritesGrid), { ssr: false });

export default function FavoritesOverview({ date, dynamic }: { date?: Date; dynamic?: IDateRange }) {
  return (
    <BaseLayout
      pageTitle={`My Favorites as of ${formatLocal(date)}`}
      mainActive="favorites"
      title="My Favorites"
      description={`Overview of the United States as of ${formatAPIDate(
        date
      )} showing the personal favorites. ${refSignal.description()}`}
      previewImage={fullUrl('/api/signal/[signal]/[date]', { signal: refSignal, date })}
      subTitle={<DateSelect date={date} path="/favorites/[date]" clearPath="/" query={{}} dynamic={dynamic} />}
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
      <Typography.Title>My Favorites as of {formatLocal(date)}</Typography.Title>
      <FavoritesGridNoSSR date={date} />
    </BaseLayout>
  );
}
