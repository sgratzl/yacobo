import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { Button, Card, Tooltip } from 'antd';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { DownloadMenu } from '../blocks/DownloadMenu';
import styles from './Section.module.css';
import { formatLocal } from '@/common';
import { KeySignalMultiFacts } from '../blocks/RegionSignalKeyFacts';
import { CompareIcon, CompareWithButton } from '../blocks/CompareIcon';
import { fullUrl } from '@/client/hooks';
import LinkWrapper from '../blocks/LinkWrapper';
import type { IWidgetProps } from './interfaces';

export default function RegionSection({ region, date, signal, focus = 'both', compare }: IWidgetProps) {
  return (
    <Card
      className={styles.card}
      actions={[
        <LinkWrapper key="d" path="/region/[region]/date/[date]" query={{ region, date }}>
          <Tooltip title="show region details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </LinkWrapper>,
        compare == null && <CompareWithButton region={region} date={date} signal={signal} />,
        <FavoriteToggle key="b" region={region} />,
        <DownloadMenu img={false} key="d" path={fullUrl('/region/[region]/date/[date]', { region, date })} />,
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
