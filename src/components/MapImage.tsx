import { useEffect, useRef, useState } from 'react';
import styles from './MapImage.module.scss';
import { classNames } from './utils';

function defaultSourceSet(src?: string, large?: boolean) {
  if (!src) {
    return undefined;
  }
  const suffix = large ? `&size=large` : '';
  return `${src}${suffix} 1x, ${src}${suffix}&scale=2 2x`;
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
  srcSet = defaultSourceSet(src, large),
  type = 'map',
}: {
  src?: string;
  alt: string;
  srcSet?: string;
  large?: boolean;
  type?: 'map' | 'line';
}) {
  const [loading, imgRef] = useImageLoading(src);
  const suffix = large ? `&size=large` : '';

  return (
    <div className={classNames(styles.img, type === 'line' && styles.imgLine)}>
      {src && (
        <img
          ref={imgRef}
          className={styles.imgImg}
          data-src={src}
          src={src ? `${src}${suffix}` : undefined}
          srcSet={srcSet}
          alt={alt}
        />
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
