import BaseLayout from '../components/BaseLayout';
import { DateSignalSelect } from '../components/DateSelect';
import { SignalSelect } from '../components/SignalSelect';
import { FavoriteToggle } from '../components/FavoriteToggle';
import SignalTable from '../components/DataTables';
import type { ISignal } from '@/model/signals';
import { Divider, Typography } from 'antd';
import { DownloadMenu } from '../components/DownloadMenu';
import { formatLocal, formatAPIDate } from '@/common';
import { SignalInfoBlock } from '../components/SignalInfoBox';
import { RegionSelect } from '../components/RegionSelect';
import ContentLayout from '../components/ContentLayout';
import { MapImage } from '../vega/MapImage';
import { fullUrl } from '@/client/hooks';

export function SignalDate({ signal, date }: { signal: ISignal; date?: Date }) {
  const apiDate = formatAPIDate(date);

  return (
    <BaseLayout
      pageTitle={`${signal.name} as of ${formatLocal(date)}`}
      mainActive="overview"
      title={<RegionSelect path="/region/[region]/date/[date]" clearPath="/date/[date]" query={{ date }} />}
      description={signal.description(date)}
      previewImage={fullUrl('/api/signal/[signal]/[date].jpg', { signal, date })}
      subTitle={
        <>
          <SignalSelect signal={signal} path="/signal/[signal]/[date]" clearPath="/date/[date]" query={{ date }} />
          <DateSignalSelect
            date={date}
            signal={signal}
            path="/signal/[signal]/[date]"
            clearPath="/signal/[signal]"
            query={{ signal }}
          />
        </>
      }
      breadcrumb={[
        {
          breadcrumbName: signal.name,
          path: `/signal/[signal]`,
        },
        {
          breadcrumbName: apiDate,
          path: `/signal/[signal]/[date]`,
        },
      ]}
      extra={[
        <FavoriteToggle signal={signal} key="bookmark" warning={false} />,
        <DownloadMenu key="download" path={fullUrl('/signal/[signal]/[date]', { signal, date })} />,
      ]}
    >
      <ContentLayout>
        <Typography.Title>{signal.name}</Typography.Title>
        <Typography.Paragraph>{signal.description(date)}</Typography.Paragraph>
        <MapImage scale={2} interactive signal={signal} date={date} />
        <Divider />
        <SignalInfoBlock signal={signal} />
        <Divider />
        <Typography.Title level={2}>Data Table</Typography.Title>
        <SignalTable signal={signal} date={date} />
      </ContentLayout>
    </BaseLayout>
  );
}
