import { ITriple, ISignal } from '@/model';
import { Button, Card, Tooltip } from 'antd';
import QuestionOutlined from '@ant-design/icons/QuestionOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import Link from 'next/link';
import { useCallback } from 'react';
import styles from './Section.module.css';
import { MapImage } from '../blocks/MapImage';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { formatAPIDate } from '@/common';
import { showInfoBox } from '../blocks/SignalInfoBox';

export default function SignalSection({ signal, date, region }: ITriple & { signal: ISignal }) {
  const apiDate = formatAPIDate(date);

  const showInfo = useCallback(() => {
    showInfoBox(signal, date);
  }, [signal, date]);

  return (
    <Card
      className={styles.card}
      cover={<MapImage signal={signal} date={date} region={region} />}
      actions={[
        <Link key="d" href="/signal/[signal]/[date]" as={`/signal/${signal.id}/${apiDate}`}>
          <Tooltip title="show details">
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
