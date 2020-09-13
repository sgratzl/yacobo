import { ISignal, signalByID, signals } from '../data/constants';
import { Button, Tooltip } from 'antd';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { useCallback } from 'react';
import { IRegion, regionByID } from '../data/regions';
import { useEffect, useState } from 'react';

export interface ISignalBookmark {
  type: 'signal';
  signal: ISignal;
}

export interface IRegionBookmark {
  type: 'region';
  region: IRegion;
}

export interface IRegionSignalBookmark {
  type: 'region+signal';
  signal: ISignal;
  region: IRegion;
}

interface ISerializedBookmark {
  r?: string;
  s?: string;
}

export type IBookmark = ISignalBookmark | IRegionBookmark | IRegionSignalBookmark;

const DEFAULT_BOOKMARKS: IBookmark[] = signals.map((s) => asBookmark(s));

function parseBookmark(bookmark: ISerializedBookmark): IBookmark | null {
  if (!bookmark.r && !bookmark.s) {
    return null;
  }
  const region = bookmark.r ? regionByID(bookmark.r) : null;
  const signal = bookmark.s ? signalByID.get(bookmark.s) : null;
  if (region && signal) {
    return {
      type: 'region+signal',
      region,
      signal,
    };
  }
  if (region) {
    return {
      type: 'region',
      region,
    };
  }
  if (signal) {
    return {
      type: 'signal',
      signal,
    };
  }
  return null;
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

function asBookmark(signal?: ISignal, region?: IRegion): IBookmark {
  if (signal && region) {
    return {
      type: 'region+signal',
      signal,
      region,
    };
  }
  if (signal) {
    return {
      type: 'signal',
      signal,
    };
  }
  return {
    type: 'region',
    region: region!,
  };
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

export function useBookmark(signal: ISignal): [boolean, () => void];
export function useBookmark(region: IRegion): [boolean, () => void];
export function useBookmark(signal: ISignal, region: IRegion): [boolean, () => void];
export function useBookmark(signalOrRegion: ISignal | IRegion, region?: IRegion) {
  const [bookmarks, setBookmarks] = useBookmarks();

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
  const [bookmarked, toggleBookmark] = useBookmark(signal!, region!);

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
