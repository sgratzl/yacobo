import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { Button, Card, Tooltip } from 'antd';
import type { ITriple } from '@/model';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { DownloadMenu } from '../blocks/DownloadMenu';
import styles from './Section.module.css';
import { formatLocal } from '@/common';
import { KeySignalMultiFacts } from '../blocks/RegionSignalKeyFacts';
import { CompareIcon } from '../blocks/CompareIcon';
import { fullUrl } from '@/client/hooks';
import LinkWrapper from '../blocks/LinkWrapper';

export default function RegionSection({
  region,
  date,
  signal,
  focus = 'both',
  compare,
}: ITriple & { focus?: 'region' | 'both'; compare?: number }) {
  return (
    <Card
      className={styles.card}
      actions={[
        <LinkWrapper key="d" path="/region/[region]/date/[date]" query={{ region, date }}>
          <Tooltip title="show region details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </LinkWrapper>,
        <FavoriteToggle key="b" region={region} />,
        <DownloadMenu img={false} key="d" path={fullUrl('/region/[region]/date/[date]', { region, date })} />,
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
