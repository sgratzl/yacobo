import EyeOutlined from '@ant-design/icons/EyeOutlined';
import QuestionOutlined from '@ant-design/icons/QuestionOutlined';
import { Button, Card, Tooltip } from 'antd';
import { useCallback } from 'react';
import type { IRegion, ISignal } from '@/model';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { showInfoBox } from '../components/SignalInfoBox';
import styles from './Section.module.css';
import { LineMultiImage } from '../components/LineMultiImage';
import { CompareLegend } from '../components/CompareIcon';
import { fullUrl } from '@/client/hooks';
import LinkWrapper from '../components/LinkWrapper';

export default function RegionsSignalCompareHistoryWidget({
  regions,
  signal,
  date,
  focus = 'both',
  legend = true,
}: {
  regions: IRegion[];
  signal?: ISignal;
  date?: Date;
  focus: 'region' | 'signal' | 'both';
  legend?: boolean;
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
      cover={
        <>
          <LineMultiImage signal={signal} date={date} regions={regions} />
          {legend && <CompareLegend regions={regions} />}
        </>
      }
      actions={[
        <LinkWrapper key="d" path="/compare/[regions]/[signal]" query={{ regions, signal }}>
          <Tooltip title="show details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </LinkWrapper>,
        <FavoriteToggle key="b" signal={signal} region={regions} history />,
        <DownloadMenu key="d" path={fullUrl('/compare/[regions]/[signal]', { regions, signal })} />,
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
