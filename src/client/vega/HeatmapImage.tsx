import { useSignalHistory } from '@/client/data';
import { addParam, fetcher } from '@/client/utils';
import { formatLocal } from '@/common';
import { isFakeRegion, ISignal, IStateRegion, ITriple, regionByID } from '@/model';
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

export function HeatMapDescription({ signal, focus }: { signal?: ISignal; focus?: IStateRegion }) {
  const unit = focus ? 'county' : 'state';
  return (
    <>
      <Typography.Paragraph>
        {`The chart shows a heatmap. Dates are shown horizontally on the x axis. Every ${unit} in ${
          focus?.name ?? 'the US'
        } is shown on the y
      axis ordered alphabetically. A colored cell at the visual cross of ${unit} and date shows the value for the signal ${
          signal?.name
        } at this specific date and location.`}
      </Typography.Paragraph>
      <ColorLegend signal={signal} missing={false} />
    </>
  );
}

function guessAspectRatio(state: IStateRegion) {
  const counties = state.counties.length;
  if (counties * 8 > 500) {
    return '60%';
  }
  return `${Math.min(60, Math.round(100 * ((counties * 1.5) / 100)))}%`;
}

export function HeatMapImage({
  signal,
  scale,
  focus,
  interactive,
}: IParams & {
  interactive?: boolean;
  focus?: IStateRegion;
}) {
  const valid = signal != null;
  // TODO support highlight
  const src = valid
    ? addParam(addParam(`/api/signal/${signal?.id}.jpg?plain`, 'highlight', undefined), 'focus', focus?.id)
    : undefined;
  const [loading, error, imgRef] = useImageLoading(src);

  // guess the aspect ratio
  const focusStyle = focus ? { paddingTop: guessAspectRatio(focus) } : undefined;

  return (
    <div className={classNames(styles.img, styles.imgHeatMap)} style={focusStyle}>
      {src && (
        <Image
          className={classNames(loading && styles.loadingImage)}
          imgRef={imgRef}
          src={src}
          alt={`${focus?.name ?? 'State'} HeatMap of ${signal?.name}`}
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
        className={scale === 2 ? styles.heatMapOverlay2 : styles.heatMapOverlay}
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

function InteractiveHeatMapVega({ signal, scale, focus }: IParams & { focus?: IStateRegion }) {
  const { data, error } = useSignalHistory(signal, focus);
  // TODO highlight
  const specUrl = addParam(
    addParam(addParam(`/api/signal/${signal?.id}.vg?plain`, 'scale', scale), 'highlight', undefined),
    'focus',
    focus?.id
  )!;
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
