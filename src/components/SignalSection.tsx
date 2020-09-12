import { ISignal } from '../data/constants';
import { formatISODate } from '../ui/utils';
import { Button, Card, Image, Tooltip, Typography } from 'antd';
import { EllipsisOutlined, QuestionOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { ReactNode, useCallback, useState } from 'react';
import styles from './SignalSection.module.css';

function f(v: ReactNode | ((v: Date) => ReactNode), date: Date) {
  return typeof v === 'function' ? v(date) : v;
}

export default function SignalSection({ signal, date }: { signal: ISignal; date: Date }) {
  const image = `/api/signal/${signal.id}/${formatISODate(date)}.png`;

  const [info, setInfo] = useState(false);

  const showInfo = useCallback(() => setInfo(!info), [setInfo, info]);

  return (
    <Card
      hoverable
      className={styles.card}
      cover={
        <Image
          src={image}
          placeholder
          height={300}
          srcSet={`${image} 1x, ${image}?scale=2 2x, ${image}?scale=3 3x`}
          alt={`US Map of ${signal.name}`}
        />
      }
      actions={[
        <Tooltip title="show signal information">
          <Button type="default" shape="circle" onClick={showInfo} icon={<QuestionOutlined />} />
        </Tooltip>,
        <Link key="details" href="/signal/[signal]" as={`/signal/${signal.id}`}>
          <Tooltip title="show signal information">
            <Button type="default" shape="circle" icon={<EllipsisOutlined />} />
          </Tooltip>
        </Link>,
      ]}
    >
      <Card.Meta title={signal.name} description={f(signal.description, date)} />
      {info && <Typography.Paragraph>{f(signal.longDescription, date)}</Typography.Paragraph>}
    </Card>
  );
}
