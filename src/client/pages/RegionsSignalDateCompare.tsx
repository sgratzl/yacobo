import { fullUrl } from '@/client/hooks';
import { formatAPIDate, formatLocal } from '@/common';
import BaseLayout from '../components/BaseLayout';
import { DateSignalSelect } from '../components/DateSelect';
import { RegionsSelect } from '../components/RegionSelect';
import { SignalSelect } from '../components/SignalSelect';
import type { IRegion, ISignal } from '@/model';
import { Divider, Row, Typography } from 'antd';
import { Comparing } from '../components/Comparing';
import ContentLayout from '../components/ContentLayout';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import GridColumn from '../components/GridColumn';
import { LineMultiImage } from '../vega/LineMultiImage';
import { SignalInfoBlock } from '../components/SignalInfoBox';
import RegionSignalWidget from '../widgets/RegionSignalWidget';

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
          <DateSignalSelect
            date={date}
            signal={signal}
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
          {regions.map((region, i) => (
            <GridColumn key={region.id}>
              <RegionSignalWidget region={region} signal={signal} date={date} focus="region" compare={i} />
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
