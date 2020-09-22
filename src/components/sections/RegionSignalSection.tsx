import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { Button, Card, Tooltip } from 'antd';
import type { ITriple } from '@/model';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { DownloadMenu } from '../blocks/DownloadMenu';
import styles from './Section.module.css';
import { RegionSignalKeyFacts, RegionSignalKeyFactsTable } from '../blocks/RegionSignalKeyFacts';
import { fullUrl } from '@/client/hooks';
import LinkWrapper from '../blocks/LinkWrapper';

export default function RegionSignalSection({
  region,
  signal,
  date,
  focus = 'both',
}: ITriple & {
  focus: 'region' | 'signal' | 'both';
}) {
  // const valid = isValid(date) && region != null && signal != null;

  const title =
    focus === 'both' ? `${region?.name} - ${signal?.name}` : focus === 'region' ? region?.name : signal?.name;

  return (
    <Card
      className={styles.card}
      cover={
        <>
          <RegionSignalKeyFacts date={date} region={region} signal={signal} />
          <div className={styles.tableCover}>
            <RegionSignalKeyFactsTable date={date} region={region} signal={signal} />
          </div>
        </>
      }
      actions={[
        <LinkWrapper key="d" path="/region/[region]/[signal]/[date]" query={{ region, signal, date }}>
          <Tooltip title="show region details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </LinkWrapper>,
        <FavoriteToggle key="b" region={region} signal={signal} />,
        <DownloadMenu
          key="d"
          img={false}
          path={fullUrl('/region/[region]/[signal]/[date]', { region, signal, date })}
        />,
      ]}
    >
      <Card.Meta title={title} description={signal?.description(date)} />
    </Card>
  );
}
