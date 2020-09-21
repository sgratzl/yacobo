import { formatAPIDate } from '@/common';
import { IRegion, ISignal } from '@/model';
import { Card } from 'antd';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import styles from './Section.module.css';

export default function RegionsSignalCompareSection({
  regions,
  signal,
  date,
}: {
  regions: IRegion[];
  signal?: ISignal;
  date?: Date;
  focus: 'region' | 'signal' | 'both';
}) {
  const apiRegions = regions.map((d) => d.id).join(',');
  const apiDate = formatAPIDate(date);

  // const title =
  //   focus === 'both' ? `${region?.name} - ${signal?.name}` : focus === 'region' ? region?.name : signal?.name;

  return (
    <Card
      className={styles.card}
      // cover={<RegionSignalMultiKeyFacts date={date} regions={regions} signal={signal} />}
      actions={[
        <FavoriteToggle key="b" region={regions} signal={signal} />,
        <DownloadMenu key="d" img={false} path={`/compare/${apiRegions}/${signal?.id}/${apiDate}`} />,
      ]}
    >
      <Card.Meta title={'Test'} />
    </Card>
  );
}
