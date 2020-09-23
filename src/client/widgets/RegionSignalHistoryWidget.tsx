import EyeOutlined from '@ant-design/icons/EyeOutlined';
import QuestionOutlined from '@ant-design/icons/QuestionOutlined';
import { Button, Card, Tooltip } from 'antd';
import { useCallback } from 'react';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { showInfoBox } from '../components/SignalInfoBox';
import { LineImage } from '../components/LineImage';
import styles from './Section.module.css';
import { RegionSignalKeyFacts } from '../components/RegionSignalKeyFacts';
import { fullUrl } from '@/client/hooks';
import LinkWrapper from '../components/LinkWrapper';
import { CompareIcon, CompareWithButton } from '../components/CompareIcon';
import type { IWidgetProps } from './interfaces';

export default function RegionSignalHistoryWidget({ region, signal, date, focus = 'both', compare }: IWidgetProps) {
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
        compare == null && <CompareWithButton region={region} date={date} signal={signal} />,
        <FavoriteToggle key="b" signal={signal} region={region} history />,
        <DownloadMenu key="d" path={fullUrl('/region/[region]/[signal]', { region, signal })} />,
        <Tooltip key="i" title="show signal information">
          <Button type="default" shape="circle" onClick={showInfo} icon={<QuestionOutlined />} />
        </Tooltip>,
      ].filter(Boolean)}
    >
      <Card.Meta
        title={<CompareIcon title={title} compare={compare} />}
        description={<>{focus !== 'region' && signal?.description(date)}</>}
      />
    </Card>
  );
}
