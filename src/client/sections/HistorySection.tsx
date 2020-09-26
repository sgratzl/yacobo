import { fullUrl } from '@/client/hooks';
import type { ITriple } from '@/model';
import { Divider } from 'antd';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import ParagraphTitle from '../components/ParagraphTitle';
import { LineDescription, LineImage } from '../vega/LineImage';

export default function HistorySection({ signal, region, date }: ITriple) {
  return (
    <>
      <ParagraphTitle
        level={2}
        extra={[
          region && signal && (
            <FavoriteToggle key="bookmark" warning={false} favorite={{ type: 'r+s+h', region, signal }} />
          ),
          <DownloadMenu key="download" path={fullUrl('/region/[region]/[signal]', { region, signal })} />,
        ]}
      >
        History
      </ParagraphTitle>
      <LineImage scale={2} interactive region={region} signal={signal} date={date} />
      <LineDescription signal={signal} region={region} />
      <Divider />
    </>
  );
}
