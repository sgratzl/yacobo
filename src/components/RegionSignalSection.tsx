import { EyeOutlined } from '@ant-design/icons';
import { Button, Card, Tooltip } from 'antd';
import Link from 'next/link';
import { ISignal } from '../data/signals';
import { IRegion } from '../data/regions';
import { formatISODate } from '../ui/utils';
import { FavoriteToggle } from './FavoriteToggle';
import { DownloadMenu } from './DownloadMenu';
import styles from './SignalSection.module.scss';

export default function RegionSignalSection({
  region,
  signal,
  date,
}: {
  region: IRegion;
  signal: ISignal;
  date?: Date;
}) {
  const apiDate = formatISODate(date);

  const cover = (
    <>
      <span>Hello</span>
    </>
  );
  return (
    <Card
      className={styles.card}
      cover={cover}
      actions={[
        <Link key="d" href="/region/[region]/[signal]/[date]" as={`/region/${region.id}/${signal.id}/${apiDate}`}>
          <Tooltip title="show region details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </Link>,
        <FavoriteToggle key="b" region={region} signal={signal} />,
        <DownloadMenu key="d" path={`/region/${region.id}/${signal.id}/${apiDate}`} />,
      ]}
    >
      <Card.Meta title={region.name} />
    </Card>
  );
}
