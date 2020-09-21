import { formatAPIDate, formatLocal } from '@/common';
import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { RegionsSelect } from '@/components/blocks/RegionSelect';
import { SignalSelect } from '@/components/blocks/SignalSelect';
import { IRegion, ISignal } from '@/model';
import { Divider, Typography } from 'antd';
import ContentLayout from '../blocks/ContentLayout';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { LineMultiImage } from '../blocks/LineMultiImage';
import { MapImage } from '../blocks/MapImage';
import { SignalInfoBlock } from '../blocks/SignalInfoBox';

export function RegionsSignalDateCompare({
  regions,
  signal,
  date,
}: {
  regions: IRegion[];
  signal?: ISignal;
  date?: Date;
}) {
  const apiRegions = regions.map((d) => d.id).join(',');
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`${regions.map((d) => d.name).join(' vs. ')} - ${signal?.name} as of ${formatLocal(date)}`}
      description={signal?.description(date)}
      previewImage={{
        url: `/api/compare/${apiRegions}/${signal?.id}.jpg`,
        width: 450,
        height: 247,
      }}
      mainActive="compare"
      title={
        <RegionsSelect
          regions={regions}
          path={`/compare/[region]/${signal?.id}/${apiDate}`}
          clearPath={`/signal/${signal?.id}/${apiDate}`}
        />
      }
      subTitle={
        <>
          <SignalSelect
            signal={signal}
            path={`/compare/${apiRegions}/[signal]/${apiDate}`}
            clearPath={`/compare/${apiRegions}/date/${apiDate}`}
          />
          <DateSelect
            date={date}
            path={`/compare/${apiRegions}/${signal?.id}/[date]`}
            clearPath={`/compare/${apiRegions}/${signal?.id}`}
          />
        </>
      }
      breadcrumb={[
        {
          breadcrumbName: 'Compare',
          path: '/compare/',
        },
        {
          breadcrumbName: regions.map((d) => d.name).join(', '),
          path: '/compare/[regions]',
        },
        {
          breadcrumbName: signal?.name ?? '',
          path: '/compare/[regions]/[signal]',
        },
        {
          breadcrumbName: apiDate,
          path: '/compare/[regions]/[signal]/[date]',
        },
      ]}
      extra={[
        <FavoriteToggle signal={signal} region={regions} key="bookmark" warning={false} />,
        <DownloadMenu key="download" img={false} path={`/compare/${apiRegions}/${signal?.id}/${apiDate}`} />,
      ]}
    >
      <ContentLayout>
        <Typography.Title>{signal?.name}</Typography.Title>
        <Typography.Paragraph>{signal?.description(date)}</Typography.Paragraph>
        {/* <Regions signal={signal} region={region} date={date} /> */}
        {/* <RegionSignalKeyFactsTable signal={signal} region={region} date={date} /> */}
        <Divider />
        <SignalInfoBlock signal={signal} />
        <Divider />
        <Typography.Title level={2}>Overview</Typography.Title>
        <MapImage scale={2} interactive signal={signal} date={date} />
        <Divider />
        <Typography.Title level={2}>History</Typography.Title>
        <LineMultiImage scale={2} interactive regions={regions} signal={signal} date={date} />
      </ContentLayout>
    </BaseLayout>
  );
}
