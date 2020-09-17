import { ISignal, signalByID, signals } from '../../model/signals';
import { useCallback } from 'react';
import { IRegion, regionByID } from '../../model/regions';
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

const DEFAULT_FAVORITES = [
  ...signals.map((s) => asFavorite(s)!),
  asFavorite(undefined, regionByID('42')!)!, // Penn
  asFavorite(undefined, regionByID('42003')!)!, // allegheny County
  asFavorite(undefined, regionByID('06')!)!, // California
  asFavorite(undefined, regionByID('06037')!)!, // Los Angeles County
  asFavorite(signalByID('cases')!, regionByID('06')!)!, // California Cases
].map(formatFavorite);

function parseFavorite(favorite: ISerializedFavorite): IFavorite | null {
  if (!favorite.r && !favorite.s) {
    return null;
  }
  const region = favorite.r ? regionByID(favorite.r) : undefined;
  const signal = favorite.s ? signalByID(favorite.s) : undefined;
  return asFavorite(signal, region);
}

function formatFavorite(favorite: IFavorite): ISerializedFavorite {
  switch (favorite.type) {
    case 'region':
      return { r: favorite.region.id };
    case 'signal':
      return { s: favorite.signal.id };
    default:
      return {
        s: favorite.signal.id,
        r: favorite.region.id,
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

const usePersistentFavorites = createPersistedState('favorites');

export function useFavorites() {
  const [favorites, setFavorites] = usePersistentFavorites(DEFAULT_FAVORITES);

  // useEffect(() => {
  //   if (favorites.length === 0) {
  //     setFavorites(DEFAULT_FAVORITES);
  //   }
  // }, [favorites, setFavorites]);

  const setParsedFavorites = useCallback(
    (favorites: IFavorite[]) => {
      setFavorites(favorites.map(formatFavorite));
    },
    [setFavorites]
  );

  const parsedFavorites = favorites.map(parseFavorite).filter((d): d is IFavorite => d != null);

  return [parsedFavorites, setParsedFavorites] as const;
}

function isSignal(signalOrRegion: ISignal | IRegion): signalOrRegion is ISignal {
  return (signalOrRegion as ISignal).colorScheme != null;
}

function findFavorite(favorites: IFavorite[], favorite: IFavorite) {
  return favorites.find(
    (d) =>
      d.type === favorite.type &&
      (d as IRegionSignalFavorite).region === (favorite as IRegionSignalFavorite).region &&
      (d as IRegionSignalFavorite).signal === (favorite as IRegionSignalFavorite).signal
  );
}

function noop() {
  // dummy
}

function FavoriteUndo({
  favorite,
  index,
  notificationKey,
}: {
  index: number;
  favorite: IFavorite;
  notificationKey: string;
}) {
  const [favorites, setFavorites] = useFavorites();

  const restore = useCallback(() => {
    const old = favorites.slice();
    old.splice(index, 0, favorite);
    setFavorites(old);
    notification.close(notificationKey);
  }, [favorite, favorites, index, notificationKey, setFavorites]);
  const restoreAll = useCallback(() => {
    setFavorites(DEFAULT_FAVORITES.map(parseFavorite).filter((d): d is IFavorite => d != null));
    notification.close(notificationKey);
  }, [notificationKey, setFavorites]);
  return (
    <>
      <Button type="primary" size="small" onClick={restore}>
        Undo
      </Button>
      {favorites.length === 0 && (
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
  const [favorites, setFavorites] = useFavorites();

  const favorite = asFavorite(
    isSignal(signalOrRegion) ? signalOrRegion : undefined,
    isSignal(signalOrRegion) ? region : signalOrRegion
  )!;

  const savedFavorite = findFavorite(favorites, favorite);

  const removeFavorite = useCallback(() => {
    const index = favorites.indexOf(savedFavorite!);
    const newFavorites = favorites.slice();
    newFavorites.splice(index, 1);
    setFavorites(newFavorites);

    const key = `favorite${Date.now()}`;
    notification.open({
      message: 'Favorite removed',
      key,
      type: 'info',
      btn: warning && <FavoriteUndo favorite={savedFavorite!} index={index} notificationKey={key} />,
    });
  }, [savedFavorite, favorites, setFavorites, warning]);

  const addFavorite = useCallback(() => {
    setFavorites([...favorites, favorite]);
    notification.open({
      message: 'Favorite added',
      type: 'info',
    });
  }, [favorite, favorites, setFavorites]);

  if (!signalOrRegion && !region) {
    return [false, noop];
  }
  return [savedFavorite != null, savedFavorite ? removeFavorite : addFavorite] as const;
}
