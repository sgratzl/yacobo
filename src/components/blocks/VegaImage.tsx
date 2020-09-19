import { ReactNode, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './VegaImage.module.css';
import { classNames } from '../utils';
import { IRegion, ISignal } from '@/model';
import { formatAPIDate, formatLocal } from '@/common';
import { isValid } from 'date-fns';
import { WarningOutlined, InteractionOutlined } from '@ant-design/icons';
import { useDateValue, useRegionValue } from '@/client/data';
import useSWR from 'swr';
import { fetcher } from '@/client/utils';
import dynamic from 'next/dynamic';
import type { TopLevelSpec } from 'vega-lite';
import { dateValueTooltip, valueTooltipContent, regionValueTooltip } from './VegaTooltip';
import type { VegaWrapperProps } from './VegaWrapper';

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

function LoadingImage({ loading, className, error }: { loading: boolean; error: boolean; className?: string }) {
  return loading || error ? (
    <div className={classNames(styles.abs, styles.overlay, className, 'ant-spin-lg')}>
      {error ? <WarningOutlined /> : <Loading />}
    </div>
  ) : null;
}

function Image({
  src,
  imgRef,
  alt,
  scale,
}: {
  src?: string;
  imgRef: Ref<HTMLImageElement>;
  alt: string;
  scale?: number;
}) {
  const img = `${src}.png${scale ? `?scale=${scale}` : ''}`;
  return <img ref={imgRef} className={styles.abs} data-src={src} src={img} srcSet={sourceSet(img)} alt={alt} />;
}

export function MakeInteractive({ setInteractive }: { setInteractive: (v: boolean) => void }) {
  const makeInteractive = useCallback(() => setInteractive(true), [setInteractive]);
  return (
    <div className={classNames(styles.abs, styles.overlay, styles.interactive)} onClick={makeInteractive}>
      <div>
        <InteractionOutlined />
        <span>Click here to enable interactivity</span>
      </div>
    </div>
  );
}

interface ILineProps {
  signal?: ISignal;
  region?: IRegion;
  scale?: number;
}

// function fetchLine(key: string) {
//   return fetcher<TopLevelSpec>(key).then(
//     (spec) =>
//       ({
//         ...spec,
//         width: 'container',
//         height: 'container',
//         autosize: {
//           contains: 'padding',
//         },
//       } as TopLevelSpec)
//   );
// }

const VegaLoader = dynamic(() => import('./VegaWrapper')) as <T>(props: VegaWrapperProps<T>) => JSX.Element;

function InteractiveLineVega({ signal, region, scale }: ILineProps) {
  const { data, error } = useDateValue(region, signal);
  const specUrl = `/api/region/${region?.id}/${signal?.id}.vg${scale ? `?scale=${scale}` : ''}`;
  const { data: spec, error: specError } = useSWR<TopLevelSpec>(
    region != null && signal != null ? specUrl : null,
    fetcher
  );
  const numberData = useMemo(() => data?.map((d) => ({ ...d, date: d.date.valueOf() })), [data]);
  const [ready, setReady] = useState(false);

  const content = useMemo(() => valueTooltipContent.bind(null, signal), [signal]);

  const onReady = useCallback(() => setReady(true), [setReady]);
  return (
    <>
      {data && spec && numberData && (
        <VegaLoader
          spec={spec}
          data={numberData}
          onReady={onReady}
          tooltipTitle={dateValueTooltip}
          tooltipContent={content}
        />
      )}
      {(!data || !spec || !numberData || !ready) && <LoadingImage error={error ?? specError} loading />}
    </>
  );
}

function fetchMap(key: string) {
  return Promise.all([fetcher<TopLevelSpec>(key), import('us-atlas/counties-10m.json')]).then(([spec, counties]) => {
    for (const layer of (spec as any).layer) {
      if (layer.data.format) {
        layer.data.values = counties.default;
      }
    }
    return spec;
  });
}

function InteractiveMapVega({ signal, date, scale }: { signal?: ISignal; date?: Date; scale?: number }) {
  const { data, error } = useRegionValue(signal, date);
  const specUrl = `/api/signal/${signal?.id}/${formatAPIDate(date)}.vg?app${scale ? `&scale=${scale}` : ''}`;
  const { data: spec, error: specError } = useSWR<TopLevelSpec>(
    isValid(date) && signal != null ? specUrl : null,
    fetchMap
  );
  const [ready, setReady] = useState(false);
  const content = useMemo(() => valueTooltipContent.bind(null, signal), [signal]);

  const onReady = useCallback(() => setReady(true), [setReady]);
  return (
    <>
      {data && spec && (
        <VegaLoader
          spec={spec}
          data={data}
          onReady={onReady}
          tooltipTitle={regionValueTooltip}
          tooltipContent={content}
        />
      )}
      {(!data || !spec || !ready) && <LoadingImage error={error ?? specError} loading />}
    </>
  );
}

function InteractiveWrapper({ children }: { children?: ReactNode }) {
  const [interactive, setInteractive] = useState(false);
  if (!interactive) {
    <MakeInteractive setInteractive={setInteractive} />;
  }
  return <>{children}</>;
}

export function LineImage({
  signal,
  region,
  scale,
  interactive,
}: ILineProps & {
  interactive?: boolean;
}) {
  const valid = signal != null && region != null;
  const src = valid ? `/api/region/${region?.id}/${signal?.id}` : undefined;
  const [loading, error, imgRef] = useImageLoading(src);

  return (
    <div className={classNames(styles.img, styles.imgLine)}>
      {src && <Image imgRef={imgRef} src={src} alt={`History of ${signal?.name} in ${region?.name}`} scale={scale} />}
      {valid && !loading && !error && interactive && (
        <InteractiveWrapper>
          <InteractiveLineVega signal={signal} region={region} scale={scale} />
        </InteractiveWrapper>
      )}
      <LoadingImage loading={loading} error={error} className={styles.lineOverlay} />
    </div>
  );
}

export function MapImage({
  signal,
  date,
  scale,
  interactive,
}: {
  signal?: ISignal;
  date?: Date;
  scale?: number;
  interactive?: boolean;
}) {
  const valid = signal != null && isValid(date);
  const src = valid ? `/api/signal/${signal?.id}/${formatAPIDate(date)}` : undefined;
  const [loading, error, imgRef] = useImageLoading(src);

  return (
    <div className={classNames(styles.img)}>
      {src && (
        <Image imgRef={imgRef} src={src} alt={`US Map of ${signal?.name} as of ${formatLocal(date)}`} scale={scale} />
      )}
      {valid && !loading && !error && interactive && (
        <InteractiveWrapper>
          <InteractiveMapVega signal={signal} date={date} scale={scale} />
        </InteractiveWrapper>
      )}
      <LoadingImage loading={loading} error={error} className={styles.mapOverlay} />
    </div>
  );
}
