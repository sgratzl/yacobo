import type { IFavorite } from '../components/useFavorites';
import RegionWidget from './RegionWidget';
import RegionSignalHistoryWidget from './RegionSignalHistoryWidget';
import RegionSignalWidget from './RegionSignalWidget';
import RegionsSignalCompareHistoryWidget from './RegionsSignalCompareHistoryWidget';
import SignalWidget from './SignalWidget';

export default function FavoriteWidget({ favorite, date }: { favorite: IFavorite; date?: Date }) {
  switch (favorite.type) {
    case 's':
      return <SignalWidget signal={favorite.signal} date={date} />;
    case 's+d':
      return null;
    case 's+h':
      return null;
    case 'r':
      return <RegionWidget region={favorite.region} date={date} focus="both" />;
    case 'r+s':
      return <RegionSignalWidget signal={favorite.signal} region={favorite.region} date={date} focus="both" />;
    case 'r+s+h':
      return <RegionSignalHistoryWidget signal={favorite.signal} region={favorite.region} date={date} focus="both" />;
    case 'r+s+sh':
      return null;
    case 'rs+s':
      return null;
    case 'rs+s+h':
      return (
        <RegionsSignalCompareHistoryWidget
          signal={favorite.signal}
          regions={favorite.regions}
          date={date}
          focus="both"
        />
      );
  }
  return null;
}
