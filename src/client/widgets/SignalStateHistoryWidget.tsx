import { fullUrl } from '@/client/hooks';
import type { ISignal, ITriple } from '@/model';
import { Card } from 'antd';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { DetailsLink } from '../components/LinkWrapper';
import { ShowInfo } from '../components/SignalInfoBox';
import { HeatMapDescription, HeatMapImage } from '../vega/HeatmapImage';
import styles from './Section.module.css';

export default function SignalStateHistoryWidget({ signal, date, region }: ITriple & { signal: ISignal }) {
  return (
    <Card
      className={styles.card}
      cover={<HeatMapImage signal={signal} region={region} date={date} />}
      actions={[
        <DetailsLink key="d" path="/signal/[signal]" query={{ signal }} />,
        <FavoriteToggle key="b" favorite={{ type: 's+h', signal }} />,
        <DownloadMenu key="d" path={fullUrl('/signal/[signal]', { signal })} />,
        <ShowInfo key="i" signal={signal} date={date} chart={<HeatMapDescription signal={signal} />} />,
      ]}
    >
      <Card.Meta title={signal.name} description={signal.description(date)} />
    </Card>
  );
}
