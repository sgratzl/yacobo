import { fullUrl } from '@/client/hooks';
import type { IRegion, ISignal } from '@/model';
import { Card } from 'antd';
import { CompareIcon, CompareWithButton } from '../components/CompareIcon';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { DetailsLink } from '../components/LinkWrapper';
import { RegionSignalKeyFacts, RegionSignalKeyFactsTable } from '../components/RegionSignalKeyFacts';
import { ShowInfo } from '../components/SignalInfoBox';
import type { IWidgetProps } from './interfaces';
import styles from './Section.module.css';

export default function RegionSignalWidget({
  region,
  signal,
  date,
  focus = 'both',
  compare,
}: IWidgetProps & { region: IRegion; signal: ISignal }) {
  // const valid = isValid(date) && region != null && signal != null;

  const title =
    focus === 'both' ? `${region?.name} - ${signal?.name}` : focus === 'region' ? region?.name : signal?.name;

  return (
    <Card
      className={styles.card}
      cover={
        <>
          <RegionSignalKeyFacts date={date} region={region} signal={signal} />
          <div className={styles.tableCover}>
            <RegionSignalKeyFactsTable date={date} region={region} signal={signal} />
          </div>
        </>
      }
      actions={[
        <DetailsLink key="d" path="/region/[region]/[signal]/[date]" query={{ region, signal, date }} />,
        compare == null && <CompareWithButton region={region} date={date} signal={signal} />,
        <FavoriteToggle key="b" favorite={{ type: 'r+s', region, signal }} />,
        <DownloadMenu
          key="d"
          img={false}
          path={fullUrl('/region/[region]/[signal]/[date]', { region, signal, date })}
        />,
        <ShowInfo key="i" signal={signal} date={date} />,
      ].filter(Boolean)}
    >
      <Card.Meta title={<CompareIcon title={title} compare={compare} />} description={signal?.description(date)} />
    </Card>
  );
}
