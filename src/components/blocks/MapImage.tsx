import { useCallback, useMemo, useState } from 'react';
import styles from './VegaImage.module.css';
import { classNames } from '../utils';
import { formatAPIDate, formatLocal } from '@/common';
import { isValid } from 'date-fns';
import { useRegionValue } from '@/client/data';
import useSWR from 'swr';
import { addParam, fetcher } from '@/client/utils';
import { TopLevelSpec } from 'vega-lite';
import { valueTooltipContent } from './VegaTooltip';
import { useRouter } from 'next/router';
import { useImageLoading, Image } from './Image';
import { LoadingImage } from './LoadingImage';
import { InteractiveWrapper, VegaLoader } from './MakeInteractive';
import { isFakeRegion, ITriple, regionByID } from '@/model';

interface IParams extends ITriple {
  scale?: number;
}

export function MapImage({
  signal,
  date,
  region,
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

function regionValueTooltip(datum: { region: string }) {
  const region = regionByID(datum.region);
  return `${region.name}${!isFakeRegion(region) ? ' (Click to select)' : ''}`;
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
