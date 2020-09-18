import { useEffect, useRef, useState } from 'react';
import styles from './VegaImage.module.css';
import { classNames } from '../utils';
import { IRegion, ISignal } from '@/model';
import { formatAPIDate, formatLocal } from '@/common';
import { isValid } from 'date-fns';
import { WarningOutlined } from '@ant-design/icons';

function addParam(url: string | undefined, key: string, value: string | number) {
  if (!url) {
    return undefined;
  }
  return `${url}.png${url.includes('?') ? '&' : '?'}${key}=${value}`;
}

function sourceSet(src: string) {
  return `${src} 1x, ${addParam(src, 'dpr', 2)} 2x`;
}

function useImageLoading(src?: string) {
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

function Loading() {
  return (
    <div>
      <span className="ant-spin-dot ant-spin-dot-spin">
        <i className="ant-spin-dot-item" />
        <i className="ant-spin-dot-item" />
        <i className="ant-spin-dot-item" />
        <i className="ant-spin-dot-item" />
      </span>
    </div>
  );
}

function LoadingImage({ loading, className, error }: { loading: boolean; error: boolean; className: string }) {
  return loading || error ? (
    <div className={classNames(className, 'ant-spin-lg')}>{error ? <WarningOutlined /> : <Loading />}</div>
  ) : null;
}

export function LineImage({ signal, region }: { signal?: ISignal; region?: IRegion }) {
  const valid = signal != null && region != null;
  const src = valid ? `/api/region/${region?.id}/${signal?.id}` : undefined;

  const [loading, error, imgRef] = useImageLoading(src);
  const img = `${src}.png`;

  return (
    <div className={classNames(styles.img, styles.imgLine)}>
      {src && (
        <img
          ref={imgRef}
          className={styles.imgImg}
          data-src={src}
          src={img}
          srcSet={sourceSet(img)}
          alt={`History of ${signal?.name} in ${region?.name}`}
        />
      )}
      <LoadingImage loading={loading} error={error} className={styles.lineOverlay} />
    </div>
  );
}

export function MapImage({ signal, date }: { signal?: ISignal; date?: Date }) {
  const valid = signal != null && isValid(date);
  const src = valid ? `/api/signal/${signal?.id}/${formatAPIDate(date)}` : undefined;
  const [loading, error, imgRef] = useImageLoading(src);

  const img = `${src}.png`;

  return (
    <div className={classNames(styles.img)}>
      {src && (
        <img
          ref={imgRef}
          className={styles.imgImg}
          data-src={src}
          src={img}
          srcSet={sourceSet(img)}
          alt={`US Map of ${signal?.name} as of ${formatLocal(date)}`}
        />
      )}
      <LoadingImage loading={loading} error={error} className={styles.mapOverlay} />
    </div>
  );
}
