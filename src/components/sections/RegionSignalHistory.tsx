import { EyeOutlined, QuestionOutlined } from '@ant-design/icons';
import { Button, Card, Tooltip } from 'antd';
import { isValid } from 'date-fns';
import Link from 'next/link';
import { useCallback } from 'react';
import { IRegion } from '../../model/regions';
import { ISignal } from '../../model/signals';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { showInfoBox } from '../blocks/SignalInfoBox';
import VegaImage from '../blocks/VegaImage';
import styles from './SignalSection.module.scss';

export default function RegionSignalHistorySection({
  region,
  signal,
  date,
  focus = 'both',
}: {
  region: IRegion;
  signal: ISignal;
  date?: Date;
  focus: 'region' | 'signal' | 'both';
}) {
  const valid = isValid(date) && region != null && signal != null;
  const image = `/api/region/${region.id}/${signal.id}.png`;

  const showInfo = useCallback(() => {
    showInfoBox(signal, date);
  }, [signal, date]);

  const title = focus === 'both' ? `${region.name} - ${signal.name}` : focus === 'region' ? region.name : signal.name;

  return (
    <Card
      className={styles.card}
      cover={<VegaImage src={valid ? image : undefined} alt={`History of ${signal.name}`} />}
      actions={[
        <Link key="d" href="/region/[region]/[signal]/" as={`/region/${region.id}/${signal.id}`}>
          <Tooltip title="show signal details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </Link>,
        <FavoriteToggle key="b" signal={signal} region={region} history />,
        <DownloadMenu key="d" path={`/region/${region.id}/${signal.id}`} />,
        <Tooltip key="i" title="show signal information">
          <Button type="default" shape="circle" onClick={showInfo} icon={<QuestionOutlined />} />
        </Tooltip>,
      ]}
    >
      <Card.Meta title={title} />
    </Card>
  );
}
