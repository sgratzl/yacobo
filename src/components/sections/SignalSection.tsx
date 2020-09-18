import { ISignal } from '../../model/signals';
import { Button, Card, Tooltip } from 'antd';
import { QuestionOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useCallback } from 'react';
import styles from './SignalSection.module.css';
import { MapImage } from '../blocks/VegaImage';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { formatAPIDate } from '@/common';
import { showInfoBox } from '../blocks/SignalInfoBox';

export default function SignalSection({ signal, date }: { signal: ISignal; date?: Date }) {
  const apiDate = formatAPIDate(date);

  const showInfo = useCallback(() => {
    showInfoBox(signal, date);
  }, [signal, date]);

  return (
    <Card
      className={styles.card}
      cover={<MapImage signal={signal} date={date} />}
      actions={[
        <Link key="d" href="/signal/[signal]/[date]" as={`/signal/${signal.id}/${apiDate}`}>
          <Tooltip title="show signal details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </Link>,
        <FavoriteToggle key="b" signal={signal} />,
        <DownloadMenu key="d" path={`/signal/${signal.id}/${apiDate}`} />,
        <Tooltip key="i" title="show signal information">
          <Button type="default" shape="circle" onClick={showInfo} icon={<QuestionOutlined />} />
        </Tooltip>,
      ]}
    >
      <Card.Meta title={signal.name} description={signal.description(date)} />
    </Card>
  );
}
