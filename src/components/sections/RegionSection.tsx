import { EyeOutlined } from '@ant-design/icons';
import { Button, Card, Tooltip } from 'antd';
import Link from 'next/link';
import { ITriple } from '@/model';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { DownloadMenu } from '../blocks/DownloadMenu';
import styles from './SignalSection.module.css';
import { formatAPIDate } from '@/common';
import { KeySignalMultiFacts } from '../blocks/RegionSignalKeyFacts';

export default function RegionSection({ region, date, signal }: ITriple) {
  const apiDate = formatAPIDate(date);
  return (
    <Card
      className={styles.card}
      actions={[
        <Link key="d" href="/region/[region]/date/[date]" as={`/region/${region?.id}/date/${apiDate}`}>
          <Tooltip title="show region details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </Link>,
        <FavoriteToggle key="b" region={region} />,
        <DownloadMenu key="d" path={`/region/${region?.id}/date/${apiDate}`} />,
      ]}
    >
      <Card.Meta title={region?.name} className={styles.meta} />
      <KeySignalMultiFacts region={region} date={date} signal={signal} />
    </Card>
  );
}
