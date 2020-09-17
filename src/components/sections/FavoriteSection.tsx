import { IFavorite } from '../blocks/useFavorites';
import RegionSection from './RegionSection';
import RegionSignalHistorySection from './RegionSignalHistory';
import RegionSignalSection from './RegionSignalSection';
import SignalSection from './SignalSection';

export default function FavoriteSection({ favorite, date }: { favorite: IFavorite; date?: Date }) {
  switch (favorite.type) {
    case 'signal':
      return <SignalSection signal={favorite.signal} date={date} />;
    case 'region':
      return <RegionSection region={favorite.region} date={date} />;
    case 'region+signal+h':
      return <RegionSignalHistorySection signal={favorite.signal} region={favorite.region} date={date} focus="both" />;
    default:
      return <RegionSignalSection signal={favorite.signal} region={favorite.region} date={date} focus="both" />;
  }
}
