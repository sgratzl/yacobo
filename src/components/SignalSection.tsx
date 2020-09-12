import { ISignal } from '../data/constants';
import { formatISODate } from '../ui/utils';
import styles from './SignalSection.module.scss';
import { Button, Card, Image, Tooltip, Typography } from 'antd';
import { EllipsisOutlined, QuestionOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useCallback, useState } from 'react';

export default function SignalSection({ signal, date }: { signal: ISignal; date: Date }) {
  const image = `/api/signal/${signal.id}/${formatISODate(date)}.png`;

  const [info, setInfo] = useState(false);

  const showInfo = useCallback(() => setInfo(!info), [setInfo, info]);

  return (
    <Card
      hoverable
      cover={
        <Image
          src={image}
          placeholder
          height={300}
          srcSet={`${image} 1x, ${image}?scale=2 2x, ${image}?scale=3 3x`}
          alt={`US Map of ${signal.label}`}
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
      <Card.Meta title={signal.label} description={signal.description} />
      {info && <Typography.Paragraph>{signal.description}</Typography.Paragraph>}
    </Card>
  );
}
