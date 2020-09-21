import { Ref, useEffect, useRef, useState } from 'react';
import styles from './VegaImage.module.css';
import { classNames } from '../utils';
import { addParam } from '@/client/utils';

export function Image({
  className,
  src,
  imgRef,
  alt,
  scale,
}: {
  className?: string;
  src?: string;
  imgRef: Ref<HTMLImageElement>;
  alt: string;
  scale?: number;
}) {
  const img = addParam(src, 'scale', scale);
  return (
    <img
      ref={imgRef}
      className={classNames(styles.abs, className)}
      data-src={src}
      src={img}
      srcSet={sourceSet(img)}
      alt={alt}
    />
  );
}

function sourceSet(src?: string) {
  if (!src) {
    return undefined;
  }
  return `${src} 1x, ${addParam(src, 'dpr', 2)} 2x`;
}

export function useImageLoading(src?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null as HTMLImageElement | null);

  useEffect(() => {
    if (!src || !imgRef.current) {
      setLoading(true);
      setError(false);
      return;
    }
    imgRef.current.onload = () => {
      setLoading(false);
      setError(false);
    };
    imgRef.current.onerror = () => {
      setError(true);
    };
    if (imgRef.current.dataset.src === src && imgRef.current.complete) {
      setLoading(false);
      return;
    }
    setLoading(true);
  }, [imgRef, src, setLoading]);

  return [loading, error, imgRef] as const;
}
