import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { Button, Card, Tooltip } from 'antd';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { DownloadMenu } from '../components/DownloadMenu';
import styles from './Section.module.css';
import { formatLocal } from '@/common';
import { KeySignalMultiFacts } from '../components/RegionSignalKeyFacts';
import { CompareIcon, CompareWithButton } from '../components/CompareIcon';
import { fullUrl } from '@/client/hooks';
import LinkWrapper from '../components/LinkWrapper';
import type { IWidgetProps } from './interfaces';
import type { IRegion, ISignal } from '@/model';

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
        <LinkWrapper key="d" path="/region/[region]/date/[date]" query={{ region, date }}>
          <Tooltip title="show region details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </LinkWrapper>,
        compare == null && <CompareWithButton region={region} date={date} signal={signal} />,
        <FavoriteToggle key="b" favorite={{ type: 'r', region }} />,
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
