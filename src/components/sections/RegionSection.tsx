import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { Button, Card, Tooltip } from 'antd';
import Link from 'next/link';
import { ITriple } from '@/model';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { DownloadMenu } from '../blocks/DownloadMenu';
import styles from './Section.module.css';
import { formatAPIDate, formatLocal } from '@/common';
import { KeySignalMultiFacts } from '../blocks/RegionSignalKeyFacts';
import { CompareIcon } from '../blocks/CompareIcon';

export default function RegionSection({
  region,
  date,
  signal,
  focus = 'both',
  compare,
}: ITriple & { focus?: 'region' | 'both'; compare?: number }) {
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
        <DownloadMenu img={false} key="d" path={`/region/${region?.id}/date/${apiDate}`} />,
      ]}
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
