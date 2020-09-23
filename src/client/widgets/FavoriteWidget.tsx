import type { IFavorite } from '../components/useFavorites';
import RegionWidget from './RegionWidget';
import RegionSignalHistoryWidget from './RegionSignalHistoryWidget';
import RegionSignalWidget from './RegionSignalWidget';
import RegionsSignalCompareHistoryWidget from './RegionsSignalCompareHistoryWidget';
import SignalWidget from './SignalWidget';

export default function FavoriteWidget({ favorite, date }: { favorite: IFavorite; date?: Date }) {
  switch (favorite.type) {
    case 'signal':
      return <SignalWidget signal={favorite.signal} date={date} />;
    case 'region':
      return <RegionWidget region={favorite.region} date={date} focus="both" />;
    case 'region+signal+h':
      return <RegionSignalHistoryWidget signal={favorite.signal} region={favorite.region} date={date} focus="both" />;
    case 'regions+signal':
    case 'regions+signal+h':
      return (
        <RegionsSignalCompareHistoryWidget
          signal={favorite.signal}
          regions={favorite.regions}
          date={date}
          focus="both"
        />
      );
    default:
      return <RegionSignalWidget signal={favorite.signal} region={favorite.region} date={date} focus="both" />;
  }
}
