import { IFavorite } from '../blocks/useFavorites';
import RegionSection from './RegionSection';
import RegionSignalSection from './RegionSignalSection';
import SignalSection from './SignalSection';

export default function FavoriteSection({ bookmark, date }: { bookmark: IFavorite; date?: Date }) {
  switch (bookmark.type) {
    case 'signal':
      return <SignalSection signal={bookmark.signal} date={date} />;
    case 'region':
      return <RegionSection region={bookmark.region} date={date} />;
    default:
      return <RegionSignalSection signal={bookmark.signal} region={bookmark.region} date={date} focus="both" />;
  }
}
