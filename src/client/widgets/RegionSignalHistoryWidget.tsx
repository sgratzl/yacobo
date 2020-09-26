import { fullUrl } from '@/client/hooks';
import type { IRegion, ISignal } from '@/model';
import { Card } from 'antd';
import { CompareIcon, CompareWithButton } from '../components/CompareIcon';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { DetailsLink } from '../components/LinkWrapper';
import { RegionSignalKeyFacts } from '../components/RegionSignalKeyFacts';
import { ShowInfo } from '../components/SignalInfoBox';
import { LineDescription, LineImage } from '../vega/LineImage';
import type { IWidgetProps } from './interfaces';
import styles from './Section.module.css';

export default function RegionSignalHistoryWidget({
  region,
  signal,
  date,
  focus = 'both',
  compare,
}: IWidgetProps & { signal: ISignal; region: IRegion }) {
  const title =
    focus === 'both' ? `${region?.name} - ${signal?.name}` : focus === 'region' ? region?.name : signal?.name;

  return (
    <Card
      className={styles.card}
      cover={
        <>
          <RegionSignalKeyFacts date={date} region={region} signal={signal} />
          <LineImage signal={signal} date={date} region={region} />
        </>
      }
      actions={[
        <DetailsLink key="d" path="/region/[region]/[signal]/" query={{ region, signal }} />,
        compare == null && <CompareWithButton region={region} date={date} signal={signal} />,
        <FavoriteToggle key="b" favorite={{ type: 'r+s+h', signal, region }} />,
        <DownloadMenu key="d" path={fullUrl('/region/[region]/[signal]', { region, signal })} />,
        <ShowInfo key="i" signal={signal} date={date} chart={<LineDescription signal={signal} region={region} />} />,
      ].filter(Boolean)}
    >
      <Card.Meta
        title={<CompareIcon title={title} compare={compare} />}
        description={<>{focus !== 'region' && signal?.description(date)}</>}
      />
    </Card>
  );
}
