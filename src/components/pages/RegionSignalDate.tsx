import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { RegionSelect } from '@/components/blocks/RegionSelect';
import { SignalSelect } from '@/components/blocks/SignalSelect';
import { formatAPIDate, formatLocal } from '@/common';
import { IRegion, ISignal } from '@/model';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { RegionSignalKeyFacts, RegionSignalKeyFactsTable } from '../blocks/RegionSignalKeyFacts';
import { Divider, Typography } from 'antd';
import { SignalInfoBlock } from '../blocks/SignalInfoBox';
import VegaImage from '../blocks/VegaImage';
import ContentLayout from '../blocks/ContentLayout';

export function RegionSignalDate({ region, signal, date }: { region?: IRegion; signal?: ISignal; date?: Date }) {
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`${region?.name} - ${signal?.name} as of ${formatLocal(date)}`}
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
          <span>
            <SignalSelect
              signal={signal}
              path={`/region/${region?.id}/[signal]/${apiDate}`}
              clearPath={`/region/${region?.id}/date/${apiDate}`}
            />
          </span>
          <span>
            as of
            <DateSelect
              date={date}
              path={`/region/${region?.id}/${signal?.id}/[date]`}
              clearPath={`/region/${region?.id}/${signal?.id}`}
            />
          </span>
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
        <Typography.Paragraph>{signal?.description()}</Typography.Paragraph>
        <RegionSignalKeyFacts signal={signal} region={region} date={date} />
        <RegionSignalKeyFactsTable signal={signal} region={region} date={date} />
        <VegaImage
          src={region != null && signal != null ? `/api/region/${region?.id}/${signal?.id}` : undefined}
          alt={`History of ${signal?.name}`}
          large
          type="line"
        />
        <Divider />
        <SignalInfoBlock signal={signal} />
      </ContentLayout>
    </BaseLayout>
  );
}
