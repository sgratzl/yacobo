import { useEffect, useRef, useState } from 'react';
import styles from './MapImage.module.scss';
import { classNames } from './utils';

function addParam(url: URL | undefined, key: string, value: string | number) {
  if (!url) {
    return undefined;
  }
  const copy = new URL(url.toString());
  copy.searchParams.set(key, value.toString());
  return copy;
}

function defaultSourceSet(src?: URL) {
  if (!src) {
    return undefined;
  }
  return `${src} 1x, ${addParam(src, 'scale', 2)} 2x`;
}

function useImageLoading(src?: string) {
  const [loading, setLoading] = useState(false);
  const imgRef = useRef(null as HTMLImageElement | null);

  useEffect(() => {
    if (!src || !imgRef.current) {
      setLoading(true);
      return;
    }
    imgRef.current.onload = () => {
      setLoading(false);
    };
    if (imgRef.current.dataset.src === src && imgRef.current.complete) {
      setLoading(false);
      return;
    }
    setLoading(true);
  }, [imgRef, src, setLoading]);

  return [loading, imgRef] as const;
}

export default function MapImage({
  alt,
  large,
  src,
  type = 'map',
}: {
  src?: string;
  alt: string;
  large?: boolean;
  type?: 'map' | 'line';
}) {
  const url = src ? new URL(src, window.location.href) : undefined;
  const [loading, imgRef] = useImageLoading(src);

  const full = large ? addParam(url, 'size', 'large') : url;
  const srcSet = defaultSourceSet(full);

  return (
    <div className={classNames(styles.img, type === 'line' && styles.imgLine)}>
      {src && (
        <img ref={imgRef} className={styles.imgImg} data-src={src} src={full?.toString()} srcSet={srcSet} alt={alt} />
      )}
      {loading && (
        <img
          className={classNames(styles.imgPlaceholder, type === 'line' && styles.imgLine)}
          src={`/api/skeletons/${type}${large ? '?size=large' : ''}`}
          alt={alt}
        />
      )}
    </div>
  );
}
