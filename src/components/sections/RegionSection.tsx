import { EyeOutlined } from '@ant-design/icons';
import { Button, Card, Tooltip } from 'antd';
import Link from 'next/link';
import { IRegion } from '../../model/regions';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { formatAPIDate } from '@/common';
import { KeySignalMultiFacts } from '../blocks/RegionSignalKeyFacts';
import { SectionCard } from '../blocks/SectionCard';

export default function RegionSection({ region, date }: { region: IRegion; date?: Date }) {
  const apiDate = formatAPIDate(date);
  return (
    <SectionCard
      actions={[
        <Link key="d" href="/region/[region]/date/[date]" as={`/region/${region.id}/date/${apiDate}`}>
          <Tooltip title="show region details">
            <Button type="default" shape="circle" icon={<EyeOutlined />} />
          </Tooltip>
        </Link>,
        <FavoriteToggle key="b" region={region} />,
        <DownloadMenu key="d" path={`/region/${region.id}/date/${apiDate}`} />,
      ]}
    >
      <style jsx>{`
        .meta {
          margin-bottom: 1em;
        }
      `}</style>
      <Card.Meta title={region.name} className="meta" />
      <KeySignalMultiFacts region={region} date={date} />
    </SectionCard>
  );
}
