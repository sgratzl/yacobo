import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { RegionSelect } from '@/components/blocks/RegionSelect';
import SignalSection from '@/components/sections/SignalSection';
import { refSignal, signals } from '@/model/signals';
import { formatAPIDate, formatLocal } from '@/common';
import { Row } from 'antd';
import GridColumn from '@/components/blocks/GridColumn';

export function DateOverview({ date, dynamic }: { date?: Date; dynamic?: boolean }) {
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`${formatLocal(date)}`}
      mainActive="overview"
      title={<RegionSelect path={`/region/[region]/date/${apiDate}`} clearPath={`/date/${apiDate}`} />}
      subTitle={<DateSelect date={date} path="/date/[date]" clearPath="/" />}
      description={`Overview of the United States as of ${formatLocal(date)} showing multiple signals`}
      previewImage={{
        url: `/api/signal/${refSignal.id}/${apiDate}.jpg`,
        width: 570,
        height: 310,
      }}
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
