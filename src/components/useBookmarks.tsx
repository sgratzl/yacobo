import { ISignal, signalByID, signals } from '../data/constants';
import { useCallback } from 'react';
import { IRegion, regionByID } from '../data/regions';
import createPersistedState from 'use-persisted-state';
import { Button, notification } from 'antd';

export interface ISignalBookmark {
  id: string;
  type: 'signal';
  signal: ISignal;
}

export interface IRegionBookmark {
  id: string;
  type: 'region';
  region: IRegion;
}

export interface IRegionSignalBookmark {
  id: string;
  type: 'region+signal';
  signal: ISignal;
  region: IRegion;
}

interface ISerializedBookmark {
  r?: string;
  s?: string;
}

export type IBookmark = ISignalBookmark | IRegionBookmark | IRegionSignalBookmark;

const DEFAULT_BOOKMARKS = [
  ...signals.map((s) => asBookmark(s)!),
  asBookmark(undefined, regionByID('42')!)!, // Penn
  asBookmark(undefined, regionByID('42003')!)!, // allegheny County
  asBookmark(undefined, regionByID('06')!)!, // California
  asBookmark(undefined, regionByID('06037')!)!, // Los Angeles County
  asBookmark(signalByID.get('cases')!, regionByID('06')!)!, // California Cases
].map(formatBookmark);

function parseBookmark(bookmark: ISerializedBookmark): IBookmark | null {
  if (!bookmark.r && !bookmark.s) {
    return null;
  }
  const region = bookmark.r ? regionByID(bookmark.r) : undefined;
  const signal = bookmark.s ? signalByID.get(bookmark.s) : undefined;
  return asBookmark(signal, region);
}

function formatBookmark(bookmark: IBookmark): ISerializedBookmark {
  switch (bookmark.type) {
    case 'region':
      return { r: bookmark.region.id };
    case 'signal':
      return { s: bookmark.signal.id };
    default:
      return {
        s: bookmark.signal.id,
        r: bookmark.region.id,
      };
  }
}

function asBookmark(signal?: ISignal, region?: IRegion): IBookmark | null {
  if (signal && region) {
    return {
      id: `${region.id}+${signal.id}`,
      type: 'region+signal',
      signal,
      region,
    };
  }
  if (signal) {
    return {
      id: signal.id,
      type: 'signal',
      signal,
    };
  }
  if (region) {
    return {
      id: region!.id!,
      type: 'region',
      region: region!,
    };
  }
  return null;
}

const usePersistentBookmarks = createPersistedState('bookmarks');

export function useBookmarks() {
  const [bookmarks, setBookmarks] = usePersistentBookmarks(DEFAULT_BOOKMARKS);

  // useEffect(() => {
  //   if (bookmarks.length === 0) {
  //     setBookmarks(DEFAULT_BOOKMARKS);
  //   }
  // }, [bookmarks, setBookmarks]);

  const setParsedBookmarks = useCallback(
    (bookmarks: IBookmark[]) => {
      setBookmarks(bookmarks.map(formatBookmark));
    },
    [setBookmarks]
  );

  const parsedBookmarks = bookmarks.map(parseBookmark).filter((d): d is IBookmark => d != null);

  return [parsedBookmarks, setParsedBookmarks] as const;
}

function isSignal(signalOrRegion: ISignal | IRegion): signalOrRegion is ISignal {
  return (signalOrRegion as ISignal).colorScheme != null;
}

function findBookmark(bookmarks: IBookmark[], bookmark: IBookmark) {
  return bookmarks.find(
    (d) =>
      d.type === bookmark.type &&
      (d as IRegionSignalBookmark).region === (bookmark as IRegionSignalBookmark).region &&
      (d as IRegionSignalBookmark).signal === (bookmark as IRegionSignalBookmark).signal
  );
}

function noop() {
  // dummy
}

function BookmarkUndo({
  bookmark,
  index,
  notificationKey,
}: {
  index: number;
  bookmark: IBookmark;
  notificationKey: string;
}) {
  const [bookmarks, setBookmarks] = useBookmarks();

  const restore = useCallback(() => {
    const old = bookmarks.slice();
    old.splice(index, 0, bookmark);
    setBookmarks(old);
    notification.close(notificationKey);
  }, [bookmark, bookmarks, index, notificationKey, setBookmarks]);
  const restoreAll = useCallback(() => {
    setBookmarks(DEFAULT_BOOKMARKS.map(parseBookmark).filter((d): d is IBookmark => d != null));
    notification.close(notificationKey);
  }, [notificationKey, setBookmarks]);
  return (
    <>
      <Button type="primary" size="small" onClick={restore}>
        Undo
      </Button>
      {bookmarks.length === 0 && (
        <Button type="primary" size="small" onClick={restoreAll}>
          Restore default
        </Button>
      )}
    </>
  );
}

export function useBookmark(warning: boolean, signal: ISignal): [boolean, () => void];
export function useBookmark(warning: boolean, region: IRegion): [boolean, () => void];
export function useBookmark(warning: boolean, signal: ISignal, region: IRegion): [boolean, () => void];
export function useBookmark(warning: boolean, signalOrRegion: ISignal | IRegion, region?: IRegion) {
  const [bookmarks, setBookmarks] = useBookmarks();

  const bookmark = asBookmark(
    isSignal(signalOrRegion) ? signalOrRegion : undefined,
    isSignal(signalOrRegion) ? region : signalOrRegion
  )!;

  const savedBookmark = findBookmark(bookmarks, bookmark);

  const removeBookmark = useCallback(() => {
    const index = bookmarks.indexOf(savedBookmark!);
    const newBookmarks = bookmarks.slice();
    newBookmarks.splice(index, 1);
    setBookmarks(newBookmarks);

    const key = `bookmark${Date.now()}`;
    notification.open({
      message: 'Bookmark removed',
      key,
      type: 'info',
      btn: warning && <BookmarkUndo bookmark={savedBookmark!} index={index} notificationKey={key} />,
    });
  }, [savedBookmark, bookmarks, setBookmarks, warning]);

  const addBookmark = useCallback(() => {
    setBookmarks([...bookmarks, bookmark]);
    notification.open({
      message: 'Bookmark added',
      type: 'info',
    });
  }, [bookmark, bookmarks, setBookmarks]);

  if (!signalOrRegion && !region) {
    return [false, noop];
  }
  return [savedBookmark != null, savedBookmark ? removeBookmark : addBookmark] as const;
}
