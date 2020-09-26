import { fullUrl } from '@/client/hooks';
import { ITriple, toState } from '@/model';
import { Divider } from 'antd';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import ParagraphTitle from '../components/ParagraphTitle';
import { HeatMapDescription, HeatMapImage } from '../vega/HeatmapImage';

export default function HeatMapSection({
  signal,
  region,
  showState,
  description = true,
}: ITriple & { showState?: boolean; description?: boolean }) {
  const state = toState(region);
  return (
    <>
      <ParagraphTitle
        level={2}
        extra={[
          signal && state && (
            <FavoriteToggle key="bookmark" warning={false} favorite={{ type: 'r+s+sh', region: state, signal }} />
          ),
          <DownloadMenu key="download" path={fullUrl('/signal/[signal]', { signal })} params={`&focus=${state?.id}`} />,
        ]}
      >
        Counties {state !== region || showState ? `of ${state?.name}` : ''} over Time
      </ParagraphTitle>
      <HeatMapImage scale={2} interactive region={region} signal={signal} focus={state} />
      {description && <HeatMapDescription signal={signal} focus={state} />}
      <Divider />
    </>
  );
}
