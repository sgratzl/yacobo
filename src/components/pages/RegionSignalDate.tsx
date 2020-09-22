import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { RegionSelect } from '@/components/blocks/RegionSelect';
import { SignalSelect } from '@/components/blocks/SignalSelect';
import { formatAPIDate, formatLocal } from '@/common';
import type { ITriple } from '@/model';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { RegionSignalKeyFacts, RegionSignalKeyFactsTable } from '../blocks/RegionSignalKeyFacts';
import { Divider, Typography } from 'antd';
import { SignalInfoBlock } from '../blocks/SignalInfoBox';
import { MapImage } from '../blocks/MapImage';
import { LineImage } from '../blocks/LineImage';
import ContentLayout from '../blocks/ContentLayout';
import { fullUrl } from '@/client/hooks';

export function RegionSignalDate({ region, signal, date }: ITriple) {
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`${region?.name} - ${signal?.name} as of ${formatLocal(date)}`}
      description={signal?.description(date)}
      previewImage={fullUrl('/api/region/[region]/[signal].jpg', { region, signal })}
      mainActive="overview"
      title={
        <RegionSelect
          region={region}
          path="/region/[region]/[signal]/[date]"
          clearPath="/signal/[signal]/[date]"
          query={{ signal, date }}
        />
      }
      subTitle={
        <>
          <SignalSelect
            signal={signal}
            path="/region/[region]/[signal]/[date]"
            clearPath="/region/[region]/date/[date]"
            query={{ region, date }}
          />
          <DateSelect
            date={date}
            path="/region/[region]/[signal]/[date]"
            clearPath="/region/[region]/[signal]"
            query={{ region, signal }}
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
        <DownloadMenu
          key="download"
          img={false}
          path={fullUrl('/region/[region]/[signal]/[date]', { region, signal, date })}
        />,
      ]}
    >
      <ContentLayout>
        <Typography.Title>{signal?.name}</Typography.Title>
        <Typography.Paragraph>{signal?.description(date)}</Typography.Paragraph>
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
