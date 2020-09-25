import type { ITriple, ISignal } from '@/model';
import { Button, Card, Tooltip } from 'antd';
import QuestionOutlined from '@ant-design/icons/QuestionOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { useCallback } from 'react';
import styles from './Section.module.css';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { DownloadMenu } from '../components/DownloadMenu';
import { showInfoBox } from '../components/SignalInfoBox';
import { fullUrl } from '@/client/hooks';
import LinkWrapper from '../components/LinkWrapper';
import { HeatMapImage } from '../vega/HeatmapImage';

export default function SignalStateHistoryWidget({ signal, date, region }: ITriple & { signal: ISignal }) {
  const showInfo = useCallback(() => {
    showInfoBox(signal, date);
  }, [signal, date]);

  return (
    <Card
      className={styles.card}
      cover={<HeatMapImage signal={signal} region={region} date={date} />}
      actions={[
        <LinkWrapper key="d" path="/signal/[signal]" query={{ signal }}>
          <Tooltip title="show details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </LinkWrapper>,
        <FavoriteToggle key="b" favorite={{ type: 's+h', signal }} />,
        <DownloadMenu key="d" path={fullUrl('/signal/[signal]', { signal })} />,
        <Tooltip key="i" title="show signal information">
          <Button type="default" shape="circle" onClick={showInfo} icon={<QuestionOutlined />} />
        </Tooltip>,
      ]}
    >
      <Card.Meta title={signal.name} description={signal.description(date)} />
    </Card>
  );
}
