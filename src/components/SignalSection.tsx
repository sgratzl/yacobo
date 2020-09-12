import { ISignal } from '../data/constants';
import { formatISODate } from '../ui/utils';
import { Button, Card, Dropdown, Image, Tooltip, Typography, Menu, Modal } from 'antd';
import {
  DownloadOutlined,
  QuestionOutlined,
  EyeOutlined,
  FileImageOutlined,
  FileOutlined,
  FileExcelOutlined,
  StarOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { ReactNode, useCallback } from 'react';
import styles from './SignalSection.module.scss';
import { useBookmark } from './useBookmark';

function f(v: ReactNode | ((v: Date) => ReactNode), date: Date) {
  return typeof v === 'function' ? v(date) : v;
}

export default function SignalSection({ signal, date }: { signal: ISignal; date: Date }) {
  const apiDate = formatISODate(date);
  const image = `/api/signal/${signal.id}/${apiDate}.png?plain`;

  const [bookmarked, setBookmark] = useBookmark(signal);

  const showInfo = useCallback(() => {
    Modal.info({
      title: signal.name,
      content: <Typography.Paragraph>{f(signal.longDescription, date)}</Typography.Paragraph>,
    });
  }, []);
  const toggleBookmark = useCallback(() => setBookmark(!bookmarked), [setBookmark, bookmarked]);

  const menu = (
    <Menu>
      <Menu.Item key="svg" icon={<FileImageOutlined />}>
        <a href={`/api/signal/${signal.id}/${apiDate}.svg?download`}>Download SVG</a>
      </Menu.Item>
      <Menu.Item key="json" icon={<FileOutlined />}>
        <a href={`/api/signal/${signal.id}/${apiDate}.json?download`}>Download JSON</a>
      </Menu.Item>
      <Menu.Item key="csv" icon={<FileExcelOutlined />}>
        <a href={`/api/signal/${signal.id}/${apiDate}.csv?download`}>Download CSV</a>
      </Menu.Item>
    </Menu>
  );

  return (
    <Card
      hoverable
      className={styles.card}
      cover={
        <Image
          className={styles.img}
          src={image}
          placeholder
          srcSet={`${image} 1x, ${image}&scale=2 2x, ${image}&scale=3 3x`}
          alt={`US Map of ${signal.name}`}
        />
      }
      actions={[
        <Link href="/signal/[signal]" as={`/signal/${signal.id}`}>
          <Tooltip title="go to signal">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </Link>,
        <Tooltip title="mark signal as favorite">
          <Button
            type="default"
            shape="circle"
            className={bookmarked ? styles.filled : undefined}
            suppressHydrationWarning
            onClick={toggleBookmark}
            icon={<StarOutlined />}
          />
        </Tooltip>,
        <Dropdown overlay={menu} trigger={['click']}>
          <Button type="default" shape="circle" icon={<DownloadOutlined />} />
        </Dropdown>,
        <Tooltip title="show signal information">
          <Button type="default" shape="circle" onClick={showInfo} icon={<QuestionOutlined />} />
        </Tooltip>,
      ]}
    >
      <Card.Meta title={signal.name} description={f(signal.description, date)} />
    </Card>
  );
}
