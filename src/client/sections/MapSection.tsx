import { fullUrl } from '@/client/hooks';
import type { ITriple } from '@/model';
import { Divider } from 'antd';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import ParagraphTitle from '../components/ParagraphTitle';
import { MapDescription, MapImage } from '../vega/MapImage';

export default function MapSection({ signal, region, date }: ITriple) {
  return (
    <>
      <ParagraphTitle
        level={2}
        extra={[
          signal && <FavoriteToggle key="bookmark" warning={false} favorite={{ type: 's', signal }} />,
          <DownloadMenu key="download" path={fullUrl('/signal/[signal]/[date]', { signal, date })} />,
        ]}
      >
        Overview
      </ParagraphTitle>
      <MapImage scale={2} interactive region={region} signal={signal} date={date} />
      <MapDescription signal={signal} date={date} />
      <Divider />
    </>
  );
}
