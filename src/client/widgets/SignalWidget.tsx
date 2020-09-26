import { fullUrl } from '@/client/hooks';
import type { ISignal, ITriple } from '@/model';
import { Card } from 'antd';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { DetailsLink } from '../components/LinkWrapper';
import { ShowInfo } from '../components/SignalInfoBox';
import { MapDescription, MapImage } from '../vega/MapImage';
import styles from './Section.module.css';

export default function SignalWidget({ signal, date, region }: ITriple & { signal: ISignal }) {
  return (
    <Card
      className={styles.card}
      cover={<MapImage signal={signal} date={date} region={region} />}
      actions={[
        <DetailsLink key="d" path="/signal/[signal]/[date]" query={{ signal, date }} />,
        <FavoriteToggle key="b" favorite={{ type: 's', signal }} />,
        <DownloadMenu key="d" path={fullUrl('/signal/[signal]/[date]', { signal, date })} />,
        <ShowInfo key="i" signal={signal} date={date} chart={<MapDescription signal={signal} date={date} />} />,
      ]}
    >
      <Card.Meta title={signal.name} description={signal.description(date)} />
    </Card>
  );
}
