import type { ITriple, ISignal } from '@/model';
import { Button, Card, Tooltip } from 'antd';
import QuestionOutlined from '@ant-design/icons/QuestionOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { useCallback } from 'react';
import styles from './Section.module.css';
import { MapImage } from '../vega/MapImage';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { DownloadMenu } from '../components/DownloadMenu';
import { showInfoBox } from '../components/SignalInfoBox';
import { fullUrl } from '@/client/hooks';
import LinkWrapper from '../components/LinkWrapper';

export default function SignalWidget({ signal, date, region }: ITriple & { signal: ISignal }) {
  const showInfo = useCallback(() => {
    showInfoBox(signal, date);
  }, [signal, date]);

  return (
    <Card
      className={styles.card}
      cover={<MapImage signal={signal} date={date} region={region} />}
      actions={[
        <LinkWrapper key="d" path="/signal/[signal]/[date]" query={{ signal, date }}>
          <Tooltip title="show details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </LinkWrapper>,
        <FavoriteToggle key="b" signal={signal} />,
        <DownloadMenu key="d" path={fullUrl('/signal/[signal]/[date]', { signal, date })} />,
        <Tooltip key="i" title="show signal information">
          <Button type="default" shape="circle" onClick={showInfo} icon={<QuestionOutlined />} />
        </Tooltip>,
      ]}
    >
      <Card.Meta title={signal.name} description={signal.description(date)} />
    </Card>
  );
}