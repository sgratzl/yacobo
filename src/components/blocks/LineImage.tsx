import { useCallback, useMemo, useState } from 'react';
import styles from './VegaImage.module.css';
import { classNames } from '../utils';
import { isFakeRegion, ITriple } from '@/model';
import { formatAPIDate } from '@/common';
import { useDateValue } from '@/client/data';
import useSWR from 'swr';
import { addParam, fetcher } from '@/client/utils';
import { TopLevelSpec } from 'vega-lite';
import { dateValueTooltip, valueTooltipContent } from './VegaTooltip';
import { useRouter } from 'next/router';
import { imputeMissing } from '@/common/parseDates';
import { useImageLoading, Image } from './Image';
import { LoadingImage } from './LoadingImage';
import { InteractiveWrapper, VegaLoader } from './MakeInteractive';

interface IParams extends ITriple {
  scale?: number;
}

export function LineImage({
  signal,
  region,
  date,
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
  const numberData = useMemo(() => imputeMissing(data ?? [], {}).map((d) => ({ ...d, date: d.date.valueOf() })), [
    data,
  ]);
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
