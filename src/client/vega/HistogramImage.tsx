import { useRegionValue } from '@/client/data';
import { addParam, fetcher } from '@/client/utils';
import { formatAPIDate, formatFixedValue, formatLocal, formatValue } from '@/common';
import type { IRegionValue, ITriple } from '@/model';
import { Statistic } from 'antd';
import { isValid } from 'date-fns';
import { useCallback, useState } from 'react';
import useSWR from 'swr';
import type { TopLevelSpec } from 'vega-lite';
import { classNames } from '../utils';
import { Image, useImageLoading } from './Image';
import { LoadingImage } from './LoadingImage';
import { InteractiveWrapper, VegaLoader } from './MakeInteractive';
import styles from './VegaImage.module.css';

interface IParams extends ITriple {
  scale?: number;
}

export function HistogramImage({
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
    ? addParam(`/api/signal/${signal?.id}/${formatAPIDate(date)}.jpg?plain&chart=histogram`, 'highlight', region?.id)
    : undefined;
  const [loading, error, imgRef] = useImageLoading(src);

  return (
    <div className={classNames(styles.img, styles.imgLine)}>
      {src && (
        <Image
          className={classNames(loading && styles.loadingImage)}
          imgRef={imgRef}
          src={src}
          alt={`Relative frequency distribution of ${signal?.name} as of ${formatLocal(date)}`}
          scale={scale}
        />
      )}
      {valid && !loading && !error && interactive && (
        <InteractiveWrapper>
          <InteractiveHistogramVega signal={signal} date={date} scale={scale} region={region} />
        </InteractiveWrapper>
      )}
      <LoadingImage
        loading={loading}
        error={error}
        className={scale === 2 ? styles.histogramOverlay2 : styles.histogramOverlay}
      />
    </div>
  );
}

interface IBinnedValues {
  bin_value: number;
  bin_value_end: number;
  _count: number;
  _total: number;
  values: IRegionValue[];
}

function regionTitleTooltip(datum: IBinnedValues) {
  return `Histogram Bin ${formatFixedValue(datum.bin_value)} - ${formatFixedValue(datum.bin_value_end)}`;
}

function regionValueTooltip(datum: IBinnedValues) {
  return <Statistic value={formatValue(datum._count)} suffix={`of ${formatValue(datum._total)} counties`} />;
}

function InteractiveHistogramVega({ signal, date, region, scale }: IParams) {
  const { data, error } = useRegionValue(signal, date);
  const specUrl = addParam(
    addParam(`/api/signal/${signal?.id}/${formatAPIDate(date)}.vg?plain&chart=histogram`, 'scale', scale),
    'highlight',
    region?.id
  )!;
  const { data: spec, error: specError } = useSWR<TopLevelSpec>(
    isValid(date) && signal != null ? specUrl : null,
    fetcher
  );
  const [ready, setReady] = useState(false);

  const onReady = useCallback(() => setReady(true), [setReady]);
  return (
    <>
      {data && spec && (
        <VegaLoader
          spec={spec}
          data={data as any}
          onReady={onReady}
          tooltipTitle={regionTitleTooltip}
          tooltipContent={regionValueTooltip}
        />
      )}
      {(!data || !spec || !ready) && <LoadingImage error={error ?? specError} loading />}
    </>
  );
}
