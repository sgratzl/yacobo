import { ISignal } from '../data/constants';
import { formatISODate } from '../ui/utils';
import { Button, Card, Tooltip, Typography, Modal } from 'antd';
import { QuestionOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { ReactNode, useCallback } from 'react';
import styles from './SignalSection.module.scss';
import { isValid } from 'date-fns';
import MapImage from './MapImage';
import { BookmarkToggle } from './BookmarkToggle';
import { DownloadMenu } from './DownloadMenu';

function f(v: ReactNode | ((v?: Date) => ReactNode), date?: Date) {
  return typeof v === 'function' ? v(date) : v;
}

export default function SignalSection({ signal, date }: { signal: ISignal; date?: Date }) {
  const apiDate = formatISODate(date);
  const validDate = isValid(date);
  const image = `/api/signal/${signal.id}/${apiDate}.png?plain`;

  const showInfo = useCallback(() => {
    Modal.info({
      title: signal.name,
      content: <Typography.Paragraph>{f(signal.longDescription, date)}</Typography.Paragraph>,
    });
  }, []);

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
        <BookmarkToggle key="b" signal={signal} />,
        <DownloadMenu key="d" path={`signal/${signal.id}/${apiDate}`} />,
        <Tooltip key="i" title="show signal information">
          <Button type="default" shape="circle" onClick={showInfo} icon={<QuestionOutlined />} />
        </Tooltip>,
      ]}
    >
      <Card.Meta title={signal.name} description={f(signal.description, date)} />
    </Card>
  );
}
