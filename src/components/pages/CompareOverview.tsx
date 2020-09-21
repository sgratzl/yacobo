import { formatAPIDate, formatLocal } from '@/common';
import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { IRegion } from '@/model';
import { RegionsSelect } from '../blocks/RegionSelect';

const EMPTY: IRegion[] = [];

export function CompareOverview({ date, dynamic }: { date?: Date; dynamic?: boolean }) {
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`${formatLocal(date)}`}
      mainActive="compare"
      title={
        <RegionsSelect regions={EMPTY} path={`/compare/[regions]/date/${apiDate}`} clearPath={`/date/${apiDate}`} />
      }
      subTitle={<DateSelect date={date} path={`/compare/date/[date]`} clearPath="/compare" />}
      breadcrumb={[]}
    >
      TODO
    </BaseLayout>
  );
}
