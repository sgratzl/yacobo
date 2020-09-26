import { fullUrl } from '@/client/hooks';
import { IRegion, ISignal, ITriple, toState } from '@/model';
import { Card } from 'antd';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { DetailsLink } from '../components/LinkWrapper';
import { ShowInfo } from '../components/SignalInfoBox';
import { HeatMapDescription, HeatMapImage } from '../vega/HeatmapImage';
import styles from './Section.module.css';

export default function RegionSignalStateHistoryWidget({
  signal,
  date,
  region,
}: ITriple & { signal: ISignal; region: IRegion }) {
  const state = toState(region)!;
  return (
    <Card
      className={styles.card}
      cover={<HeatMapImage signal={signal} focus={state} date={date} />}
      actions={[
        <DetailsLink key="d" path="/region/[region]/[signal]" query={{ signal, region: state }} />,
        <FavoriteToggle key="b" favorite={{ type: 'r+s+sh', signal, region: state }} />,
        <DownloadMenu key="d" path={fullUrl('/signal/[signal]', { signal })} params={`&focus=${state.id}`} />,
        <ShowInfo key="i" signal={signal} date={date} chart={<HeatMapDescription signal={signal} focus={state} />} />,
      ]}
    >
      <Card.Meta title={signal.name} description={signal.description(date)} />
    </Card>
  );
}
