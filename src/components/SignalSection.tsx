import { ISignal } from '../model/signals';
import { Button, Card, Tooltip, Typography, Modal } from 'antd';
import { QuestionOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useCallback } from 'react';
import styles from './SignalSection.module.scss';
import { isValid } from 'date-fns';
import MapImage from './MapImage';
import { FavoriteToggle } from './FavoriteToggle';
import { DownloadMenu } from './DownloadMenu';
import { formatAPIDate } from '@/common';

export default function SignalSection({ signal, date }: { signal: ISignal; date?: Date }) {
  const apiDate = formatAPIDate(date);
  const validDate = isValid(date);
  const image = `/api/signal/${signal.id}/${apiDate}.png`;

  const showInfo = useCallback(() => {
    Modal.info({
      title: signal.name,
      content: <Typography.Paragraph>{signal.longDescription(date)}</Typography.Paragraph>,
    });
  }, [signal, date]);

  return (
    <Card
      className={styles.card}
      cover={<MapImage src={validDate ? image : undefined} alt={`US Map of ${signal.name}`} />}
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
