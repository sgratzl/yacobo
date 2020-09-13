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
import { isValid } from 'date-fns';

function f(v: ReactNode | ((v?: Date) => ReactNode), date?: Date) {
  return typeof v === 'function' ? v(date) : v;
}

export function DownloadSignalMenu({ signal, date }: { signal: ISignal; date?: Date; details?: boolean }) {
  const apiDate = formatISODate(date);
  return (
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
}

export function MapImage({ image, alt }: { image?: string; alt: string }) {
  return (
    <Image
      className={styles.img}
      src={image}
      placeholder
      srcSet={
        !image
          ? undefined
          : `${image} 1x, ${image}&scale=2 2x, ${image}&scale=3 3x, ${image}&scale=2 1000w, ${image}&scale=3 1500w, ${image}&scale=4 2000w`
      }
      alt={alt}
    />
  );
}

export function BookmarkSignalToggle({ signal }: { signal: ISignal }) {
  const [bookmarked, setBookmark] = useBookmark(signal);
  const toggleBookmark = useCallback(() => setBookmark(!bookmarked), [setBookmark, bookmarked]);

  return (
    <Tooltip title="mark signal as favorite">
      <Button
        type="default"
        shape="circle"
        className={bookmarked ? styles.filled : undefined}
        suppressHydrationWarning
        onClick={toggleBookmark}
        icon={<StarOutlined />}
      />
    </Tooltip>
  );
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
      hoverable
      className={styles.card}
      cover={<MapImage image={validDate ? image : undefined} alt={`US Map of ${signal.name}`} />}
      actions={[
        <Link href="/signal/[signal]/[date]" as={`/signal/${signal.id}/${apiDate}`}>
          <Tooltip title="show signal details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </Link>,
        <BookmarkSignalToggle signal={signal} />,
        <Dropdown overlay={<DownloadSignalMenu signal={signal} date={date} />} trigger={['click']}>
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
