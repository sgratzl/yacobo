import { fullUrl } from '@/client/hooks';
import { formatAPIDate, formatLocal } from '@/common';
import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { RegionsSelect } from '@/components/blocks/RegionSelect';
import { SignalSelect } from '@/components/blocks/SignalSelect';
import type { IRegion, ISignal } from '@/model';
import { Divider, Row, Typography } from 'antd';
import { Comparing } from '../blocks/Comparing';
import ContentLayout from '../blocks/ContentLayout';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import GridColumn from '../blocks/GridColumn';
import { LineMultiImage } from '../blocks/LineMultiImage';
import { SignalInfoBlock } from '../blocks/SignalInfoBox';
import RegionSignalSection from '../sections/RegionSignalSection';

export function RegionsSignalDateCompare({
  regions,
  signal,
  date,
}: {
  regions: IRegion[];
  signal?: ISignal;
  date?: Date;
}) {
  return (
    <BaseLayout
      pageTitle={`${regions.map((d) => d.name).join(' vs. ')} - ${signal?.name} as of ${formatLocal(date)}`}
      description={signal?.description(date)}
      previewImage={fullUrl('/api/compare/[regions]/[signal].jpg', { regions, signal })}
      mainActive="compare"
      title={
        <RegionsSelect
          regions={regions}
          path="/compare/[region]/[signal]/[date]"
          clearPath="/signal/[signal]/[date]"
          query={{ signal }}
        />
      }
      subTitle={
        <>
          <SignalSelect
            signal={signal}
            path="/compare/[regions]/[signal]/[date]"
            clearPath="/compare/[regions]/date/[date]"
            query={{ regions, date }}
          />
          <DateSelect
            date={date}
            path="/compare/[regions]/[signal]/[date]"
            clearPath="/compare/[regions]/[signal]"
            query={{ regions, signal }}
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
          breadcrumbName: formatAPIDate(date),
          path: '/compare/[regions]/[signal]/[date]',
        },
      ]}
      extra={[
        <FavoriteToggle signal={signal} region={regions} key="bookmark" warning={false} />,
        <DownloadMenu
          key="download"
          img={false}
          path={fullUrl('/compare/[regions]/[signal]/[date]', { regions, signal, date })}
        />,
      ]}
    >
      <ContentLayout>
        <Typography.Title>{signal?.name}</Typography.Title>
        <Typography.Paragraph>{signal?.description(date)}</Typography.Paragraph>
        <Divider />
        <Comparing
          regions={regions}
          path="/compare/[regions]/[signal]/[date]"
          clearPath="/signal/[signal]/[date]"
          query={{ date, signal }}
        />
        <Row>
          {regions.map((region) => (
            <GridColumn key={region.id}>
              <RegionSignalSection region={region} signal={signal} date={date} focus="region" />
            </GridColumn>
          ))}
        </Row>
        <Divider />
        <SignalInfoBlock signal={signal} />
        <Divider />
        <Typography.Title level={2}>History</Typography.Title>
        <LineMultiImage scale={2} interactive regions={regions} signal={signal} date={date} />
      </ContentLayout>
    </BaseLayout>
  );
}
