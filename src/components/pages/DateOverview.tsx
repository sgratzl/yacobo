import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { RegionSelect } from '@/components/blocks/RegionSelect';
import SignalSection from '@/components/sections/SignalSection';
import { refSignal, signals } from '@/model/signals';
import { formatAPIDate, formatLocal } from '@/common';
import { Row, Typography } from 'antd';
import GridColumn from '@/components/blocks/GridColumn';
import { fullUrl } from '@/client/hooks';
import type { IDateRange } from '@/model';

export function DateOverview({ date, dynamic }: { date?: Date; dynamic?: IDateRange }) {
  return (
    <BaseLayout
      pageTitle={`${formatLocal(date)}`}
      mainActive="overview"
      title={<RegionSelect path="/region/[region]/date/[date]" clearPath="/date/[date]" query={{ date }} />}
      subTitle={<DateSelect date={date} path="/date/[date]" clearPath="/" query={{}} dateRange={dynamic} />}
      description={`Overview of the United States as of ${formatLocal(
        date
      )} showing multiple signals. ${refSignal.description(date)}`}
      previewImage={fullUrl('/api/signal/[signal]/[date].jpg', { signal: refSignal.id, date })}
      breadcrumb={
        dynamic
          ? []
          : [
              {
                breadcrumbName: formatAPIDate(date),
                path: `/date/[date]`,
              },
            ]
      }
    >
      <Typography.Title>COVID-19 Overview as of {formatLocal(date)}</Typography.Title>
      <Row>
        {signals.map((s) => (
          <GridColumn key={s.id}>
            <SignalSection signal={s} date={date} />
          </GridColumn>
        ))}
      </Row>
    </BaseLayout>
  );
}
