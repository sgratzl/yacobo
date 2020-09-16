import { ISignal, signalByID, signals } from '../model/signals';
import { useCallback } from 'react';
import { IRegion, regionByID } from '../model/regions';
import createPersistedState from 'use-persisted-state';
import { Button, notification } from 'antd';

export interface ISignalFavorite {
  id: string;
  type: 'signal';
  signal: ISignal;
}

export interface IRegionFavorite {
  id: string;
  type: 'region';
  region: IRegion;
}

export interface IRegionSignalFavorite {
  id: string;
  type: 'region+signal';
  signal: ISignal;
  region: IRegion;
}

interface ISerializedFavorite {
  r?: string;
  s?: string;
}

export type IFavorite = ISignalFavorite | IRegionFavorite | IRegionSignalFavorite;

const DEFAULT_BOOKMARKS = [
  ...signals.map((s) => asFavorite(s)!),
  asFavorite(undefined, regionByID('42')!)!, // Penn
  asFavorite(undefined, regionByID('42003')!)!, // allegheny County
  asFavorite(undefined, regionByID('06')!)!, // California
  asFavorite(undefined, regionByID('06037')!)!, // Los Angeles County
  asFavorite(signalByID('cases')!, regionByID('06')!)!, // California Cases
].map(formatFavorite);

function parseFavorite(bookmark: ISerializedFavorite): IFavorite | null {
  if (!bookmark.r && !bookmark.s) {
    return null;
  }
  const region = bookmark.r ? regionByID(bookmark.r) : undefined;
  const signal = bookmark.s ? signalByID(bookmark.s) : undefined;
  return asFavorite(signal, region);
}

function formatFavorite(bookmark: IFavorite): ISerializedFavorite {
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

function asFavorite(signal?: ISignal, region?: IRegion): IFavorite | null {
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

const usePersistentFavorites = createPersistedState('bookmarks');

export function useFavorites() {
  const [bookmarks, setFavorites] = usePersistentFavorites(DEFAULT_BOOKMARKS);

  // useEffect(() => {
  //   if (bookmarks.length === 0) {
  //     setFavorites(DEFAULT_BOOKMARKS);
  //   }
  // }, [bookmarks, setFavorites]);

  const setParsedFavorites = useCallback(
    (bookmarks: IFavorite[]) => {
      setFavorites(bookmarks.map(formatFavorite));
    },
    [setFavorites]
  );

  const parsedFavorites = bookmarks.map(parseFavorite).filter((d): d is IFavorite => d != null);

  return [parsedFavorites, setParsedFavorites] as const;
}

function isSignal(signalOrRegion: ISignal | IRegion): signalOrRegion is ISignal {
  return (signalOrRegion as ISignal).colorScheme != null;
}

function findFavorite(bookmarks: IFavorite[], bookmark: IFavorite) {
  return bookmarks.find(
    (d) =>
      d.type === bookmark.type &&
      (d as IRegionSignalFavorite).region === (bookmark as IRegionSignalFavorite).region &&
      (d as IRegionSignalFavorite).signal === (bookmark as IRegionSignalFavorite).signal
  );
}

function noop() {
  // dummy
}

function FavoriteUndo({
  bookmark,
  index,
  notificationKey,
}: {
  index: number;
  bookmark: IFavorite;
  notificationKey: string;
}) {
  const [bookmarks, setFavorites] = useFavorites();

  const restore = useCallback(() => {
    const old = bookmarks.slice();
    old.splice(index, 0, bookmark);
    setFavorites(old);
    notification.close(notificationKey);
  }, [bookmark, bookmarks, index, notificationKey, setFavorites]);
  const restoreAll = useCallback(() => {
    setFavorites(DEFAULT_BOOKMARKS.map(parseFavorite).filter((d): d is IFavorite => d != null));
    notification.close(notificationKey);
  }, [notificationKey, setFavorites]);
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

export function useFavorite(warning: boolean, signal: ISignal): [boolean, () => void];
export function useFavorite(warning: boolean, region: IRegion): [boolean, () => void];
export function useFavorite(warning: boolean, signal: ISignal, region: IRegion): [boolean, () => void];
export function useFavorite(warning: boolean, signalOrRegion: ISignal | IRegion, region?: IRegion) {
  const [bookmarks, setFavorites] = useFavorites();

  const bookmark = asFavorite(
    isSignal(signalOrRegion) ? signalOrRegion : undefined,
    isSignal(signalOrRegion) ? region : signalOrRegion
  )!;

  const savedFavorite = findFavorite(bookmarks, bookmark);

  const removeFavorite = useCallback(() => {
    const index = bookmarks.indexOf(savedFavorite!);
    const newFavorites = bookmarks.slice();
    newFavorites.splice(index, 1);
    setFavorites(newFavorites);

    const key = `bookmark${Date.now()}`;
    notification.open({
      message: 'Favorite removed',
      key,
      type: 'info',
      btn: warning && <FavoriteUndo bookmark={savedFavorite!} index={index} notificationKey={key} />,
    });
  }, [savedFavorite, bookmarks, setFavorites, warning]);

  const addFavorite = useCallback(() => {
    setFavorites([...bookmarks, bookmark]);
    notification.open({
      message: 'Favorite added',
      type: 'info',
    });
  }, [bookmark, bookmarks, setFavorites]);

  if (!signalOrRegion && !region) {
    return [false, noop];
  }
  return [savedFavorite != null, savedFavorite ? removeFavorite : addFavorite] as const;
}
