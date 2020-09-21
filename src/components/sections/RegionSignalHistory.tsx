import EyeOutlined from '@ant-design/icons/EyeOutlined';
import QuestionOutlined from '@ant-design/icons/QuestionOutlined';
import { Button, Card, Tooltip } from 'antd';
import Link from 'next/link';
import { useCallback } from 'react';
import { ITriple } from '@/model';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { showInfoBox } from '../blocks/SignalInfoBox';
import { LineImage } from '../blocks/LineImage';
import styles from './Section.module.css';
import { RegionSignalKeyFacts } from '../blocks/RegionSignalKeyFacts';

export default function RegionSignalHistorySection({
  region,
  signal,
  date,
  focus = 'both',
}: ITriple & {
  focus: 'region' | 'signal' | 'both';
}) {
  const showInfo = useCallback(() => {
    if (signal) {
      showInfoBox(signal, date);
    }
  }, [signal, date]);

  const title =
    focus === 'both' ? `${region?.name} - ${signal?.name}` : focus === 'region' ? region?.name : signal?.name;

  return (
    <Card
      className={styles.card}
      cover={<RegionSignalKeyFacts date={date} region={region} signal={signal} />}
      actions={[
        <Link key="d" href="/region/[region]/[signal]/" as={`/region/${region?.id}/${signal?.id}`}>
          <Tooltip title="show details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </Link>,
        <FavoriteToggle key="b" signal={signal} region={region} history />,
        <DownloadMenu key="d" path={`/region/${region?.id}/${signal?.id}`} />,
        <Tooltip key="i" title="show signal information">
          <Button type="default" shape="circle" onClick={showInfo} icon={<QuestionOutlined />} />
        </Tooltip>,
      ]}
    >
      <Card.Meta
        title={title}
        className={styles.meta}
        description={<>{focus !== 'region' && signal?.description(date)}</>}
      />
      <LineImage signal={signal} date={date} region={region} />
    </Card>
  );
}
