import { ReactNode, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './VegaImage.module.css';
import { classNames } from '../utils';
import { ITriple, isFakeRegion } from '@/model';
import { formatAPIDate, formatLocal } from '@/common';
import { isValid } from 'date-fns';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import InteractionOutlined from '@ant-design/icons/InteractionOutlined';
import { useDateValue, useRegionValue } from '@/client/data';
import useSWR from 'swr';
import { addParam, fetcher } from '@/client/utils';
import dynamic from 'next/dynamic';
import type { TopLevelSpec } from 'vega-lite';
import { dateValueTooltip, valueTooltipContent, regionValueTooltip } from './VegaTooltip';
import type { VegaWrapperProps } from './VegaWrapper';
import { useRouter } from 'next/router';

function sourceSet(src?: string) {
  if (!src) {
    return undefined;
  }
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

interface IParams extends ITriple {
  scale?: number;
}

const VegaLoader = dynamic(() => import('./VegaWrapper')) as <T>(props: VegaWrapperProps<T>) => JSX.Element;

function InteractiveLineVega({ signal, region, scale, date }: IParams) {
  const { data, error } = useDateValue(region, signal);
  const specUrl = addParam(
    addParam(`/api/region/${region?.id}/${signal?.id}.vg`, 'scale', scale),
    'highlight',
    date ? formatAPIDate(date) : undefined
  )!;
  const { data: spec, error: specError } = useSWR<TopLevelSpec>(
    region != null && signal != null ? specUrl : null,
    fetcher
  );
  const numberData = useMemo(() => data?.map((d) => ({ ...d, date: d.date.valueOf() })), [data]);
  const [ready, setReady] = useState(false);

  const content = useMemo(() => valueTooltipContent.bind(null, signal), [signal]);
  const router = useRouter();
  const onClick = useCallback(
    (d: { date: number }) => {
      if (signal && d.date && region && !isFakeRegion(region)) {
        router.push('/region/[region]/[signal]/[date]', `/region/${region.id}/${signal.id}/${formatAPIDate(d.date)}`);
      }
    },
    [signal, region, router]
  );
  const onReady = useCallback(() => setReady(true), [setReady]);
  return (
    <>
      {data && spec && numberData && (
        <VegaLoader
          spec={spec}
          data={numberData}
          onReady={onReady}
          onClick={onClick}
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
        delete layer.data.url;
      }
    }
    return spec;
  });
}

function InteractiveMapVega({ signal, date, region, scale }: IParams) {
  const { data, error } = useRegionValue(signal, date);
  const specUrl = addParam(
    addParam(`/api/signal/${signal?.id}/${formatAPIDate(date)}.vg`, 'scale', scale),
    'highlight',
    region?.id
  )!;
  const { data: spec, error: specError } = useSWR<TopLevelSpec>(
    isValid(date) && signal != null ? specUrl : null,
    fetchMap
  );
  const [ready, setReady] = useState(false);
  const content = useMemo(() => valueTooltipContent.bind(null, signal), [signal]);

  const onReady = useCallback(() => setReady(true), [setReady]);
  const router = useRouter();
  const onClick = useCallback(
    (d: { region: string }) => {
      if (signal && date && d.region) {
        router.push('/region/[region]/[signal]/[date]', `/region/${d.region}/${signal.id}/${formatAPIDate(date)}`);
      }
    },
    [signal, date, router]
  );
  return (
    <>
      {data && spec && (
        <VegaLoader
          spec={spec}
          data={data}
          onReady={onReady}
          onClick={onClick}
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
    return <MakeInteractive setInteractive={setInteractive} />;
  }
  return <>{children}</>;
}

export function LineImage({
  signal,
  region,
  date, // highlight
  scale,
  interactive,
}: IParams & {
  interactive?: boolean;
}) {
  const valid = signal != null && region != null;
  const src = valid
    ? addParam(`/api/region/${region?.id}/${signal?.id}.jpg`, 'highlight', date ? formatAPIDate(date) : undefined)
    : undefined;
  const [loading, error, imgRef] = useImageLoading(src);

  return (
    <div className={classNames(styles.img, styles.imgLine)}>
      {src && (
        <Image
          className={classNames(loading && styles.loadingImage)}
          imgRef={imgRef}
          src={src}
          alt={`History of ${signal?.name} in ${region?.name}`}
          scale={scale}
        />
      )}
      {valid && !loading && !error && interactive && (
        <InteractiveWrapper>
          <InteractiveLineVega signal={signal} region={region} scale={scale} date={date} />
        </InteractiveWrapper>
      )}
      <LoadingImage
        loading={loading}
        error={error}
        className={scale === 2 ? styles.lineOverlay2 : styles.lineOverlay}
      />
    </div>
  );
}

export function MapImage({
  signal,
  date,
  region, // highlight
  scale,
  interactive,
}: IParams & {
  interactive?: boolean;
}) {
  const valid = signal != null && isValid(date);
  const src = valid
    ? addParam(`/api/signal/${signal?.id}/${formatAPIDate(date)}.jpg`, 'highlight', region?.id)
    : undefined;
  const [loading, error, imgRef] = useImageLoading(src);

  return (
    <div className={classNames(styles.img)}>
      {src && (
        <Image
          className={classNames(loading && styles.loadingImage)}
          imgRef={imgRef}
          src={src}
          alt={`US Map of ${signal?.name} as of ${formatLocal(date)}`}
          scale={scale}
        />
      )}
      {valid && !loading && !error && interactive && (
        <InteractiveWrapper>
          <InteractiveMapVega signal={signal} date={date} scale={scale} region={region} />
        </InteractiveWrapper>
      )}
      <LoadingImage loading={loading} error={error} className={scale === 2 ? styles.mapOverlay2 : styles.mapOverlay} />
    </div>
  );
}
