import EyeOutlined from '@ant-design/icons/EyeOutlined';
import QuestionOutlined from '@ant-design/icons/QuestionOutlined';
import { Button, Card, Tooltip } from 'antd';
import { useCallback } from 'react';
import type { ITriple } from '@/model';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { showInfoBox } from '../blocks/SignalInfoBox';
import { LineImage } from '../blocks/LineImage';
import styles from './Section.module.css';
import { RegionSignalKeyFacts } from '../blocks/RegionSignalKeyFacts';
import { fullUrl } from '@/client/hooks';
import LinkWrapper from '../blocks/LinkWrapper';

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
      cover={
        <>
          <RegionSignalKeyFacts date={date} region={region} signal={signal} />
          <LineImage signal={signal} date={date} region={region} />
        </>
      }
      actions={[
        <LinkWrapper key="d" path="/region/[region]/[signal]/" query={{ region, signal }}>
          <Tooltip title="show details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </LinkWrapper>,
        <FavoriteToggle key="b" signal={signal} region={region} history />,
        <DownloadMenu key="d" path={fullUrl('/region/[region]/[signal]', { region, signal })} />,
        <Tooltip key="i" title="show signal information">
          <Button type="default" shape="circle" onClick={showInfo} icon={<QuestionOutlined />} />
        </Tooltip>,
      ]}
    >
      <Card.Meta title={title} description={<>{focus !== 'region' && signal?.description(date)}</>} />
    </Card>
  );
}
