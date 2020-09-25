import { fullUrl } from '@/client/hooks';
import { formatAPIDate, formatLocal } from '@/common';
import type { IDateRange } from '@/model';
import BaseLayout from '../components/BaseLayout';
import { DateSelect } from '../components/DateSelect';
import GridColumn from '../components/GridColumn';
import { refSignal } from '@/model';
import { Row, Typography } from 'antd';
import dynamic from 'next/dynamic';
import { toFavoriteKey, useFavorites } from '../components/useFavorites';
// import AddFavorite from '../sections/AddFavorite';
import FavoriteWidget from '../widgets/FavoriteWidget';

function FavoritesGrid({ date }: { date?: Date }) {
  const [favorites] = useFavorites();
  return (
    <Row>
      {favorites.map((favorite) => (
        <GridColumn key={toFavoriteKey(favorite)}>
          <FavoriteWidget favorite={favorite} date={date} />
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
      subTitle={<DateSelect date={date} path="/favorites/[date]" clearPath="/" query={{}} dateRange={dynamic} />}
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
