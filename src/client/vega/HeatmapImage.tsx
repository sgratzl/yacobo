import { useSignalHistory } from '@/client/data';
import { addParam, fetcher } from '@/client/utils';
import { formatLocal } from '@/common';
import { isFakeRegion, ISignal, ITriple, regionByID } from '@/model';
import { Typography } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import type { TopLevelSpec } from 'vega-lite';
import { useRouterWrapper } from '../hooks';
import { classNames } from '../utils';
import { ColorLegend } from './descriptions';
import { Image, useImageLoading } from './Image';
import { LoadingImage } from './LoadingImage';
import { InteractiveWrapper, VegaLoader } from './MakeInteractive';
import styles from './VegaImage.module.css';
import { valueTooltipContent } from './VegaTooltip';

interface IParams extends ITriple {
  scale?: number;
}

export function HeatMapDescription({ signal }: { signal?: ISignal }) {
  return (
    <>
      <Typography.Paragraph>
        {`The chart shows a heatmap. Dates are shown horizontally on the x axis. Every state in the US is shown on the y
      axis ordered alphabetically. A colored cell at the visual cross of state and date shows the value for the signal ${signal?.name} at this specific date and location.`}
      </Typography.Paragraph>
      <ColorLegend signal={signal} />
    </>
  );
}

export function HeatMapImage({
  signal,
  scale,
  interactive,
}: IParams & {
  interactive?: boolean;
}) {
  const valid = signal != null;
  // TODO support highlight
  const src = valid ? addParam(`/api/signal/${signal?.id}.jpg?plain`, 'highlight', undefined) : undefined;
  const [loading, error, imgRef] = useImageLoading(src);

  return (
    <div className={classNames(styles.img, styles.imgHeatMap)}>
      {src && (
        <Image
          className={classNames(loading && styles.loadingImage)}
          imgRef={imgRef}
          src={src}
          alt={`State HeatMap of ${signal?.name}`}
          scale={scale}
        />
      )}
      {valid && !loading && !error && interactive && (
        <InteractiveWrapper>
          <InteractiveHeatMapVega signal={signal} scale={scale} />
        </InteractiveWrapper>
      )}
      <LoadingImage
        loading={loading}
        error={error}
        className={scale === 2 ? styles.HeatMapOverlay2 : styles.HeatMapOverlay}
      />
    </div>
  );
}

function regionTitleTooltip(datum: { region: string; date: number }) {
  const region = regionByID(datum.region);
  return `${region.name} as of ${formatLocal(new Date(datum.date))}${
    !isFakeRegion(region) ? ' (Click to select)' : ''
  }`;
}

function InteractiveHeatMapVega({ signal, scale }: IParams) {
  const { data, error } = useSignalHistory(signal);
  // TODO highlight
  const specUrl = addParam(addParam(`/api/signal/${signal?.id}.vg?plain`, 'scale', scale), 'highlight', undefined)!;
  const { data: spec, error: specError } = useSWR<TopLevelSpec>(signal != null ? specUrl : null, fetcher);
  const [ready, setReady] = useState(false);

  const numberData = useMemo(() => (data ?? []).map((d) => ({ ...d, date: d.date.valueOf() })), [data]);
  const content = useMemo(() => valueTooltipContent.bind(null, signal), [signal]);
  const router = useRouterWrapper();
  const onClick = useCallback(
    (d: { date: number; region: string }) => {
      const region = regionByID(d.region);
      if (signal && d.date && region && !isFakeRegion(region)) {
        router.push('/region/[region]/[signal]/[date]', { region, signal, date: new Date(d.date) });
      }
    },
    [signal, router]
  );
  const onReady = useCallback(() => setReady(true), [setReady]);
  return (
    <>
      {data && spec && (
        <VegaLoader
          spec={spec}
          data={numberData}
          onClick={onClick}
          onReady={onReady}
          tooltipTitle={regionTitleTooltip}
          tooltipContent={content}
        />
      )}
      {(!data || !spec || !ready) && <LoadingImage error={error ?? specError} loading />}
    </>
  );
}
