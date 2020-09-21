import { formatAPIDate, formatLocal } from '@/common';
import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';

export function CompareOverview({ date, dynamic }: { date?: Date; dynamic?: boolean }) {
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`${formatLocal(date)}`}
      mainActive="compare"
      title={'Test'}
      subTitle={<DateSelect date={date} path="/date/[date]" clearPath="/" />}
      breadcrumb={[]}
    >
      TODO
    </BaseLayout>
  );
}
