import { useEffect, useRef, useState } from 'react';
import styles from './MapImage.module.scss';
import { classNames } from './utils';

function addParam(url: string | undefined, key: string, value: string | number) {
  if (!url) {
    return undefined;
  }
  return `${url}${url.includes('?') ? '&' : '?'}${key}=${value}`;
}

function defaultSourceSet(src?: string) {
  if (!src) {
    return undefined;
  }
  return `${src} 1x, ${addParam(src, 'dpr', 2)} 2x`;
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
  const [loading, imgRef] = useImageLoading(src);

  const full = large ? addParam(src, 'scale', 2) : src;
  const srcSet = defaultSourceSet(full);

  return (
    <div className={classNames(styles.img, type === 'line' && styles.imgLine)}>
      {src && (
        <img ref={imgRef} className={styles.imgImg} data-src={src} src={full?.toString()} srcSet={srcSet} alt={alt} />
      )}
      {loading && (
        <img
          className={classNames(styles.imgPlaceholder, type === 'line' && styles.imgLine)}
          src={`/api/skeletons/${type}${large ? '?scale=2' : ''}`}
          alt={alt}
        />
      )}
    </div>
  );
}
