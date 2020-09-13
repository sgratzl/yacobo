import { ISignal, signalByID, signals } from '../data/constants';
import { Button, Tooltip } from 'antd';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { useCallback } from 'react';
import { IRegion, regionByID } from '../data/regions';
import { useEffect, useState } from 'react';

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

const DEFAULT_BOOKMARKS: IBookmark[] = [
  ...signals.map((s) => asBookmark(s)!),
  asBookmark(undefined, regionByID('42')!)!, // Pennsilenvia
  asBookmark(undefined, regionByID('42003')!)!, // allegheny County
  asBookmark(undefined, regionByID('06')!)!, // California
  asBookmark(undefined, regionByID('06037')!)!, // Los Angeles County
  asBookmark(signalByID.get('cases')!, regionByID('06')!)!, // California Cases
];

console.log(DEFAULT_BOOKMARKS);

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

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(DEFAULT_BOOKMARKS);

  useEffect(() => {
    try {
      const content = localStorage.getItem('bookmarks');
      if (content) {
        const parsed: ISerializedBookmark[] = JSON.parse(content);
        setBookmarks(parsed.map(parseBookmark).filter((v): v is IBookmark => v != null));
      }
    } catch {
      // bad bookmarks
      localStorage.removeItem('bookmarks'); // bad
      setBookmarks(DEFAULT_BOOKMARKS);
    }
  }, [setBookmarks]);

  useEffect(() => {
    const serialized = JSON.stringify(bookmarks.map(formatBookmark));
    if (localStorage.getItem('bookmarks') !== serialized) {
      localStorage.setItem('bookmarks', serialized);
    }
  }, [bookmarks]);

  return [bookmarks, setBookmarks] as const;
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

export function useBookmark(signal: ISignal): [boolean, () => void];
export function useBookmark(region: IRegion): [boolean, () => void];
export function useBookmark(signal: ISignal, region: IRegion): [boolean, () => void];
export function useBookmark(signalOrRegion: ISignal | IRegion, region?: IRegion) {
  const [bookmarks, setBookmarks] = useBookmarks();

  if (!signalOrRegion && !region) {
    return [false, noop];
  }

  const bookmark = asBookmark(
    isSignal(signalOrRegion) ? signalOrRegion : undefined,
    isSignal(signalOrRegion) ? region : signalOrRegion
  )!;

  const savedBookmark = findBookmark(bookmarks, bookmark);

  const addBookmark = useCallback(() => {
    setBookmarks([...bookmarks, bookmark]);
  }, [bookmark, bookmarks, setBookmarks]);

  const removeBookmark = useCallback(() => {
    setBookmarks(bookmarks.filter((d) => d !== savedBookmark));
  }, [savedBookmark, bookmarks, setBookmarks]);

  return [savedBookmark != null, savedBookmark ? removeBookmark : addBookmark] as const;
}

export function BookmarkToggle({ signal, region }: { signal?: ISignal; region?: IRegion }) {
  const [bookmarked, toggleBookmark] = useBookmark(signal ?? (region as any), region!);

  return (
    <Tooltip title={bookmarked ? 'remove from favorites' : 'mark as favorite'}>
      <Button
        type="default"
        shape="circle"
        onClick={toggleBookmark}
        icon={bookmarked ? <StarFilled /> : <StarOutlined />}
      />
    </Tooltip>
  );
}
