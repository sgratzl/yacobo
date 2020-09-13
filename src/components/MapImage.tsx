import { useEffect, useRef, useState } from 'react';
import styles from './MapImage.module.scss';

function defaultSourceSet(src?: string, large?: boolean) {
  if (!src) {
    return undefined;
  }
  const suffix = large ? `&size=large` : '';
  return `${src}${suffix} 1x, ${src}${suffix}&scale=2 2x`;
}

export default function MapImage({
  alt,
  large,
  src,
  srcSet = defaultSourceSet(src, large),
}: {
  src?: string;
  alt: string;
  srcSet?: string;
  large?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const imgRef = useRef(null as HTMLImageElement | null);
  const suffix = large ? `&size=large` : '';

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

  return (
    <div className={styles.img}>
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
        <img className={styles.imgPlaceholder} src={`/api/skeletons/map${large ? '?size=large' : ''}`} alt={alt} />
      )}
    </div>
  );
}
