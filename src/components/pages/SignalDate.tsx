import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { SignalSelect } from '@/components/blocks/SignalSelect';
import { FavoriteToggle } from '@/components/blocks/FavoriteToggle';
import VegaImage from '@/components/blocks/VegaImage';
import SignalTable from '@/components/blocks/SignalTable';
import { ISignal } from '@/model/signals';
import { Divider, Typography } from 'antd';
import { isValid } from 'date-fns';
import { DownloadMenu } from '@/components/blocks/DownloadMenu';
import { formatLocal, formatAPIDate } from '@/common';
import { SignalInfoBlock } from '../blocks/SignalInfoBox';
import { RegionSelect } from '../blocks/RegionSelect';
import ContentLayout from '../blocks/ContentLayout';

export function SignalDate({ signal, date }: { signal: ISignal; date?: Date }) {
  const apiDate = formatAPIDate(date);
  const validDate = isValid(date);
  const image = `/api/signal/${signal.id}/${apiDate}`;

  return (
    <BaseLayout
      pageTitle={`${signal.name} as of ${formatLocal(date)}`}
      mainActive="overview"
      title={<RegionSelect path={`/region/[region]/date/${apiDate}`} clearPath={`/date/${apiDate}`} />}
      subTitle={
        <>
          <SignalSelect signal={signal} path={`/signal/[signal]/${apiDate}`} clearPath={`/date/${apiDate}`} />
          <DateSelect date={date} path={`/signal/${signal.id}/[date]`} clearPath={`/signal/${signal.id}`} />
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
        <DownloadMenu key="download" path={`/signal/${signal.id}/${apiDate}`} />,
      ]}
    >
      <ContentLayout>
        <Typography.Paragraph>{signal.description(date)}</Typography.Paragraph>
        <VegaImage src={validDate ? image : undefined} alt={`US Map of ${signal.name}`} large />
        <Divider />
        <SignalInfoBlock signal={signal} />
        <Typography.Title level={2}>Detail Table</Typography.Title>
        <SignalTable signal={signal} date={date} />
      </ContentLayout>
    </BaseLayout>
  );
}
