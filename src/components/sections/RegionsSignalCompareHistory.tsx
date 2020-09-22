import EyeOutlined from '@ant-design/icons/EyeOutlined';
import QuestionOutlined from '@ant-design/icons/QuestionOutlined';
import { Button, Card, Tooltip } from 'antd';
import Link from 'next/link';
import { useCallback } from 'react';
import { IRegion, ISignal } from '@/model';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { showInfoBox } from '../blocks/SignalInfoBox';
import styles from './Section.module.css';
import { LineMultiImage } from '../blocks/LineMultiImage';

export default function RegionsSignalCompareHistorySection({
  regions,
  signal,
  date,
  focus = 'both',
}: {
  regions: IRegion[];
  signal?: ISignal;
  date?: Date;
  focus: 'region' | 'signal' | 'both';
}) {
  const showInfo = useCallback(() => {
    if (signal) {
      showInfoBox(signal, date);
    }
  }, [signal, date]);

  const title =
    focus === 'both'
      ? `${regions.map((d) => d.name).join(' vs. ')} - ${signal?.name}`
      : focus === 'region'
      ? regions.map((d) => d.name).join(' vs. ')
      : signal?.name;

  return (
    <Card
      className={styles.card}
      cover={<LineMultiImage signal={signal} date={date} regions={regions} />}
      actions={[
        <Link
          key="d"
          href="/compare/[regions]/[signal]"
          as={`/compare/${regions.map((d) => d.id).join(',')}/${signal?.id}`}
        >
          <Tooltip title="show details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </Link>,
        <FavoriteToggle key="b" signal={signal} region={regions} history />,
        <DownloadMenu key="d" path={`/compare/${regions.map((d) => d.id).join(',')}/${signal?.id}`} />,
        <Tooltip key="i" title="show signal information">
          <Button type="default" shape="circle" onClick={showInfo} icon={<QuestionOutlined />} />
        </Tooltip>,
      ]}
    >
      <Card.Meta
        title={title}
        className={styles.meta}
        description={<>{focus !== 'region' && signal?.description(date)}</>}
      />
    </Card>
  );
}
