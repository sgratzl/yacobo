import { fullUrl } from '@/client/hooks';
import type { IRegion, ISignal } from '@/model';
import { Card } from 'antd';
import { CompareLegend } from '../components/CompareIcon';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { DetailsLink } from '../components/LinkWrapper';
import { ShowInfo } from '../components/SignalInfoBox';
import { LineMultiDescription, LineMultiImage } from '../vega/LineMultiImage';
import styles from './Section.module.css';

export default function RegionsSignalCompareHistoryWidget({
  regions,
  signal,
  date,
  focus = 'both',
  legend = true,
}: {
  regions: IRegion[];
  signal: ISignal;
  date?: Date;
  focus: 'region' | 'signal' | 'both';
  legend?: boolean;
}) {
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
        <DetailsLink key="d" path="/compare/[regions]/[signal]" query={{ regions, signal }} />,
        <FavoriteToggle key="b" favorite={{ type: 'rs+s+h', signal, regions }} />,
        <DownloadMenu key="d" path={fullUrl('/compare/[regions]/[signal]', { regions, signal })} />,
        <ShowInfo
          key="i"
          signal={signal}
          date={date}
          chart={<LineMultiDescription signal={signal} regions={regions} />}
        />,
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
