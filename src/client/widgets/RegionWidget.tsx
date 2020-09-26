import { fullUrl } from '@/client/hooks';
import { formatLocal } from '@/common';
import type { IRegion, ISignal } from '@/model';
import { Card } from 'antd';
import { CompareIcon, CompareWithButton } from '../components/CompareIcon';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { DetailsLink } from '../components/LinkWrapper';
import { KeySignalMultiFacts } from '../components/RegionSignalKeyFacts';
import { ShowInfo } from '../components/SignalInfoBox';
import type { IWidgetProps } from './interfaces';
import styles from './Section.module.css';

export default function RegionWidget({
  region,
  date,
  signal,
  focus = 'both',
  compare,
}: IWidgetProps & { region: IRegion; signal?: ISignal }) {
  return (
    <Card
      className={styles.card}
      actions={[
        <DetailsLink key="d" path="/region/[region]/date/[date]" query={{ region, date }} />,
        compare == null && <CompareWithButton region={region} date={date} signal={signal} />,
        <FavoriteToggle key="b" favorite={{ type: 'r', region }} />,
        <DownloadMenu img={false} key="d" path={fullUrl('/region/[region]/date/[date]', { region, date })} />,
        <ShowInfo key="i" signal={signal} />,
      ].filter(Boolean)}
    >
      <Card.Meta
        title={
          <CompareIcon
            title={`${region?.name}${focus === 'both' ? ` as of ${formatLocal(date)}` : ''}`}
            compare={compare}
          />
        }
        className={styles.meta}
      />
      <div className={styles.tableCover}>
        <KeySignalMultiFacts region={region} date={date} signal={signal} />
      </div>
    </Card>
  );
}
