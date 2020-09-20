import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { RegionSelect } from '@/components/blocks/RegionSelect';
import { SignalSelect } from '@/components/blocks/SignalSelect';
import { formatAPIDate, formatLocal } from '@/common';
import { ITriple } from '@/model';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { RegionSignalKeyFacts, RegionSignalKeyFactsTable } from '../blocks/RegionSignalKeyFacts';
import { Divider, Typography } from 'antd';
import { SignalInfoBlock } from '../blocks/SignalInfoBox';
import { LineImage, MapImage } from '../blocks/VegaImage';
import ContentLayout from '../blocks/ContentLayout';

export function RegionSignalDate({ region, signal, date }: ITriple) {
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`${region?.name} - ${signal?.name} as of ${formatLocal(date)}`}
      description={signal?.description(date)}
      previewImage={{
        url: `/api/region/${region?.id}/${signal?.id}.png`,
        width: 450,
        height: 247,
      }}
      mainActive="overview"
      title={
        <RegionSelect
          region={region}
          path={`/region/[region]/${signal?.id}/${apiDate}`}
          clearPath={`/signal/${signal?.id}/${apiDate}`}
        />
      }
      subTitle={
        <>
          <SignalSelect
            signal={signal}
            path={`/region/${region?.id}/[signal]/${apiDate}`}
            clearPath={`/region/${region?.id}/date/${apiDate}`}
          />
          <DateSelect
            date={date}
            path={`/region/${region?.id}/${signal?.id}/[date]`}
            clearPath={`/region/${region?.id}/${signal?.id}`}
          />
        </>
      }
      breadcrumb={[
        {
          breadcrumbName: region?.name ?? '',
          path: '/region/[region]',
        },
        {
          breadcrumbName: signal?.name ?? '',
          path: '/region/[region]/[signal]',
        },
        {
          breadcrumbName: apiDate,
          path: '/region/[region]/[signal]/[date]',
        },
      ]}
      extra={[
        <FavoriteToggle signal={signal} region={region} key="bookmark" warning={false} />,
        <DownloadMenu key="download" img={false} path={`/region/${region?.id}/${signal?.id}/${apiDate}`} />,
      ]}
    >
      <ContentLayout>
        <Typography.Title>{signal?.name}</Typography.Title>
        <Typography.Paragraph>{signal?.description()}</Typography.Paragraph>
        <RegionSignalKeyFacts signal={signal} region={region} date={date} />
        <RegionSignalKeyFactsTable signal={signal} region={region} date={date} />
        <Divider />
        <SignalInfoBlock signal={signal} />
        <Divider />
        <Typography.Title level={2}>Overview</Typography.Title>
        <MapImage scale={2} interactive region={region} signal={signal} date={date} />
        <Divider />
        <Typography.Title level={2}>History</Typography.Title>
        <LineImage scale={2} interactive region={region} signal={signal} date={date} />
      </ContentLayout>
    </BaseLayout>
  );
}
