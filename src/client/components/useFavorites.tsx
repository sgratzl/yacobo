import { ISignal, signalByID, signals } from '../../model/signals';
import { useCallback } from 'react';
import { IRegion, IStateRegion, regionByID } from '../../model/regions';
import createPersistedState from 'use-persisted-state';
import { Button, notification } from 'antd';

export interface ISignalFavorite {
  type: 's';
  signal: ISignal;
}
export interface ISignalDistributionFavorite {
  type: 's+d';
  signal: ISignal;
}

export interface ISignalHistoryFavorite {
  type: 's+h';
  signal: ISignal;
}

export interface IRegionFavorite {
  type: 'r';
  region: IRegion;
}

export interface IRegionSignalFavorite {
  type: 'r+s';
  signal: ISignal;
  region: IRegion;
}

export interface IRegionSignalHistoryFavorite {
  type: 'r+s+h';
  signal: ISignal;
  region: IRegion;
}

export interface IRegionsSignalFavorite {
  type: 'rs+s';
  signal: ISignal;
  regions: IRegion[];
}

export interface IRegionSignalStateHistoryFavorite {
  type: 'r+s+sh';
  signal: ISignal;
  region: IStateRegion;
}

export interface IRegionsSignalHistoryFavorite {
  type: 'rs+s+h';
  signal: ISignal;
  regions: IRegion[];
}

export type IFavorite =
  | ISignalFavorite
  | ISignalDistributionFavorite
  | ISignalHistoryFavorite
  | IRegionFavorite
  | IRegionSignalFavorite
  | IRegionSignalHistoryFavorite
  | IRegionsSignalFavorite
  | IRegionsSignalHistoryFavorite
  | IRegionSignalStateHistoryFavorite;

interface ISerializedFavorite {
  t: IFavorite['type'];
  s?: string;
  r?: string;
  rs?: string[];
}

function formatFavorite(favorite: IFavorite): ISerializedFavorite {
  return {
    t: favorite.type,
    s: (favorite as IRegionSignalFavorite).signal ? (favorite as IRegionSignalFavorite).signal.id : undefined,
    r: (favorite as IRegionSignalFavorite).region ? (favorite as IRegionSignalFavorite).region.id : undefined,
    rs: (favorite as IRegionsSignalHistoryFavorite).regions
      ? (favorite as IRegionsSignalHistoryFavorite).regions.map((d) => d.id)
      : undefined,
  };
}

export function toFavoriteKey(favorite: IFavorite) {
  return JSON.stringify(formatFavorite(favorite));
}

function parseFavorite(favorite: ISerializedFavorite) {
  return ({
    type: favorite.t,
    signal: favorite.s ? signalByID(favorite.s) : undefined,
    region: favorite.r ? regionByID(favorite.r) : undefined,
    regions: favorite.rs ? favorite.rs.map(regionByID) : undefined,
  } as unknown) as IFavorite;
}

const defaultFavorites = [
  ...signals.slice(0, 3).map((s) => ({ type: 's', signal: s } as IFavorite)),
  { type: 'r', region: regionByID('42003') } as IFavorite, // Allegheny County
  { type: 'r+s', signal: signalByID('cases'), region: regionByID('42003') } as IFavorite, // Allegheny County
  { type: 'r+s+h', signal: signalByID('cases')!, region: regionByID('42003') } as IFavorite, // Allegheny County History
  { type: 'rs+s+h', signal: signalByID('cases')!, regions: [regionByID('42003'), regionByID('42')] } as IFavorite, // Allegheny County vs Pennsylvania
];
const defaultSerializedFavorites = defaultFavorites.map(formatFavorite);

const usePersistentFavorites = createPersistedState('favoritesV2');

export function useFavorites() {
  const [favorites, setFavorites] = usePersistentFavorites(defaultSerializedFavorites);

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

function findFavorite(favorites: IFavorite[], favorite?: IFavorite) {
  if (!favorite) {
    return undefined;
  }
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
    setFavorites(defaultFavorites.filter((d): d is IFavorite => d != null));
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

export function useFavorite(warning: boolean, favorite: IFavorite): [boolean, () => void] {
  const [favorites, setFavorites] = useFavorites();

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

  if (!favorite) {
    return [false, noop];
  }
  return [savedFavorite != null, savedFavorite ? removeFavorite : addFavorite];
}
