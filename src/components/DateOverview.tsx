import BaseLayout, { DateSelect } from '@/components/BaseLayout';
import SignalSection from '@/components/SignalSection';
import { signals } from '@/model/signals';
import { formatAPIDate, formatLocal } from '@/common';
import { Row } from 'antd';
import GridColumn from '@/components/GridColumn';

export function DateOverview({ date }: { date?: Date }) {
  return (
    <BaseLayout
      pageTitle={`COVID as of ${formatLocal(date)}`}
      mainActive="overview"
      title="COVID"
      subTitle={
        <>
          as of
          <DateSelect date={date} path="/date/[date]" clearPath="/" />
        </>
      }
      breadcrumb={[
        {
          breadcrumbName: formatAPIDate(date),
          path: `/date/[date]`,
        },
      ]}
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
