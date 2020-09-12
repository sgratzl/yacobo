import { useEffect, useState } from 'react';
import { ISignal } from '../data/constants';

const isServer = global.window == undefined;

export function useBookmark(signal: ISignal) {
  const [book, setBook] = useState(
    isServer ? false : (localStorage.getItem('bookmarks') ?? '').split(',').includes(signal.id)
  );

  useEffect(() => {
    if (isServer) {
      return;
    }
    const value = (localStorage.getItem('bookmarks') ?? '').split(',').filter((d) => d !== signal.id);
    if (book) {
      value.push(signal.id);
    }
    localStorage.setItem('bookmarks', value.join(','));
  }, [book, signal]);

  return [book, setBook] as const;
}
