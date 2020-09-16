import { EyeOutlined } from '@ant-design/icons';
import { Button, Card, Tooltip } from 'antd';
import Link from 'next/link';
import { IRegion } from '../data/regions';
import { formatISODate } from '../ui/utils';
import { FavoriteToggle } from './FavoriteToggle';
import { DownloadMenu } from './DownloadMenu';
import styles from './SignalSection.module.scss';

export default function RegionSection({ region, date }: { region: IRegion; date?: Date }) {
  const apiDate = formatISODate(date);
  return (
    <Card
      className={styles.card}
      actions={[
        <Link key="d" href="/region/[region]/all/[date]" as={`/region/${region.id}/all/${apiDate}`}>
          <Tooltip title="show region details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </Link>,
        <FavoriteToggle key="b" region={region} />,
        <DownloadMenu key="d" path={`/region/${region.id}/all/${apiDate}`} />,
      ]}
    >
      <Card.Meta title={region.name} />
    </Card>
  );
}
