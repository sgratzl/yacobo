import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { Button, Card, Tooltip } from 'antd';
import Link from 'next/link';
import type { ITriple } from '@/model';
import { formatAPIDate } from '@/common';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { DownloadMenu } from '../blocks/DownloadMenu';
import styles from './Section.module.css';
import { RegionSignalKeyFacts, RegionSignalKeyFactsTable } from '../blocks/RegionSignalKeyFacts';

export default function RegionSignalSection({
  region,
  signal,
  date,
  focus = 'both',
}: ITriple & {
  focus: 'region' | 'signal' | 'both';
}) {
  // const valid = isValid(date) && region != null && signal != null;
  const apiDate = formatAPIDate(date);

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
        <Link key="d" href="/region/[region]/[signal]/[date]" as={`/region/${region?.id}/${signal?.id}/${apiDate}`}>
          <Tooltip title="show region details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </Link>,
        <FavoriteToggle key="b" region={region} signal={signal} />,
        <DownloadMenu key="d" img={false} path={`/region/${region?.id}/${signal?.id}/${apiDate}`} />,
      ]}
    >
      <Card.Meta title={title} description={signal?.description(date)} />
    </Card>
  );
}
