import { useEffect, useRef, useState } from 'react';
import styles from './VegaImage.module.css';
import { classNames } from '../utils';
import { Spin } from 'antd';

function addParam(url: string | undefined, key: string, value: string | number) {
  if (!url) {
    return undefined;
  }
  return `${url}.png${url.includes('?') ? '&' : '?'}${key}=${value}`;
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

export default function VegaImage({
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

  const full = large ? addParam(src, 'scale', 2) : `${src}.png`;
  const srcSet = defaultSourceSet(full);

  return (
    <div className={classNames(styles.img, type === 'line' && styles.imgLine)}>
      {src && (
        <img ref={imgRef} className={styles.imgImg} data-src={src} src={full?.toString()} srcSet={srcSet} alt={alt} />
      )}
      {loading && (
        <Spin size="large" wrapperClassName={classNames(styles.spin)}>
          <img
            className={classNames(styles.imgPlaceholder, type === 'line' && styles.imgLine)}
            src={`/api/skeletons/${type}.png${large ? '?scale=2' : ''}`}
            alt={alt}
          />
        </Spin>
      )}
    </div>
  );
}
