import BaseLayout, { DateSelect, RegionSelect } from '@/components/blocks/BaseLayout';
import SignalSection from '@/components/sections/SignalSection';
import { signals } from '@/model/signals';
import { formatAPIDate, formatLocal } from '@/common';
import { Row } from 'antd';
import GridColumn from '@/components/blocks/GridColumn';

export function DateOverview({ date, dynamic }: { date?: Date; dynamic?: boolean }) {
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`COVID as of ${formatLocal(date)}`}
      mainActive="overview"
      title="COVID"
      subTitle={
        <>
          <RegionSelect path={`/region/[region]/date/${apiDate}`} clearPath={`/date/${apiDate}`} />
          as of
          <DateSelect date={date} path="/date/[date]" clearPath="/" />
        </>
      }
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
