import styles from './VegaImage.module.css';
import { classNames } from '../utils';
import { ISignal, IRegion, isFakeRegion, regionByID } from '@/model';
import { formatAPIDate, formatAPIRegions, formatLocal } from '@/common';
import { addParam, fetcher } from '@/client/utils';
import { useImageLoading, Image } from './Image';
import { LoadingImage } from './LoadingImage';
import { InteractiveWrapper, VegaLoader } from './MakeInteractive';
import { useDateMultiRegionValue } from '@/client/data';
import { imputeMissing } from '@/common/parseDates';
import React, { useMemo, useState, useCallback } from 'react';
import useSWR from 'swr';
import type { TopLevelSpec } from 'vega-lite';
import { valueTooltipContent } from './VegaTooltip';
import { useRouterWrapper } from '@/client/hooks';
import { Typography } from 'antd';
import { CompareDescription, ValueLegend } from './descriptions';

interface IParams {
  signal?: ISignal;
  date?: Date;
  regions: IRegion[];
  scale?: number;
}

export function LineMultiDescription({ signal, regions }: { signal?: ISignal; regions: IRegion[] }) {
  return (
    <>
      <Typography.Paragraph>
        {`The chart shows the history of ${signal?.name} of multiple locations in form of a line chart.
        The horizontal x axis shows the date while the vertical y axis shows the value of the signal at this specific point in time.
        `}
      </Typography.Paragraph>
      <CompareDescription regions={regions} />
      <ValueLegend signal={signal} vertical />
    </>
  );
}

export function LineMultiImage({
  signal,
  regions,
  date,
  scale,
  interactive,
}: IParams & {
  interactive?: boolean;
}) {
  const valid = signal != null && regions.length > 0;
  const src = valid
    ? addParam(
        `/api/compare/${formatAPIRegions(regions)}/${signal?.id}.jpg?plain`,
        'highlight',
        date ? formatAPIDate(date) : undefined
      )
    : undefined;
  const [loading, error, imgRef] = useImageLoading(src);

  return (
    <div className={classNames(styles.img, styles.imgLine)}>
      {src && (
        <Image
          className={classNames(loading && styles.loadingImage)}
          imgRef={imgRef}
          src={src}
          alt={`${regions.map((r) => r.name).join(' vs. ')} - ${signal?.name}`}
          scale={scale}
        />
      )}
      {valid && !loading && !error && interactive && (
        <InteractiveWrapper>
          <InteractiveMultiLineVega signal={signal} regions={regions} scale={scale} date={date} />
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

function regionDateValueTooltip(datum: { region: string; date: number }) {
  const region = regionByID(datum.region);
  return `${region.name} as of ${formatLocal(new Date(datum.date))} ${
    !isFakeRegion(region) ? ' (Click to select)' : ''
  }`;
}

function InteractiveMultiLineVega({ signal, regions, scale, date }: IParams) {
  const { data, error } = useDateMultiRegionValue(regions, signal);
  const specUrl = addParam(
    addParam(`/api/compare/${formatAPIRegions(regions)}/${signal?.id}.vg?plain`, 'scale', scale),
    'highlight',
    date ? formatAPIDate(date) : undefined
  )!;
  const { data: spec, error: specError } = useSWR<TopLevelSpec>(
    regions.length > 0 && signal != null ? specUrl : null,
    fetcher
  );
  const numberData = useMemo(
    () =>
      imputeMissing(data ?? [], { region: 'T', regionObj: undefined as any }, 'region').map((d) => ({
        ...d,
        date: d.date.valueOf(),
      })),
    [data]
  );
  const [ready, setReady] = useState(false);

  const content = useMemo(() => valueTooltipContent.bind(null, signal), [signal]);
  const router = useRouterWrapper();
  const onClick = useCallback(
    (d: { region: string; date: number }) => {
      if (signal && d.date && d.region) {
        router.push('/region/[region]/[signal]/[date]', { region: d.region, signal, date: new Date(d.date) });
      }
    },
    [signal, router]
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
          tooltipTitle={regionDateValueTooltip}
          tooltipContent={content}
        />
      )}
      {(!data || !spec || !numberData || !ready) && <LoadingImage error={error ?? specError} loading />}
    </>
  );
}
