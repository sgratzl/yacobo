import { IBookmark } from './BookmarkToggle';
import RegionSection from './RegionSection';
import RegionSignalSection from './RegionSignalSection';
import SignalSection from './SignalSection';

export default function BookmarkSection({ bookmark, date }: { bookmark: IBookmark; date?: Date }) {
  switch (bookmark.type) {
    case 'signal':
      return <SignalSection signal={bookmark.signal} date={date} />;
    case 'region':
      return <RegionSection region={bookmark.region} date={date} />;
    case 'region+signal':
      return <RegionSignalSection signal={bookmark.signal} region={bookmark.region} date={date} />;
  }
}
