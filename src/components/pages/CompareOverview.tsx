import { formatAPIDate, formatLocal } from '@/common';
import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { IRegion } from '@/model';
import { Typography } from 'antd';
import { Comparing } from '../blocks/Comparing';
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
      breadcrumb={[
        {
          breadcrumbName: 'Compare',
          path: `/compare`,
        },
        ...(dynamic
          ? []
          : [
              {
                breadcrumbName: formatAPIDate(date),
                path: `/compare/date/[date]`,
              },
            ]),
      ]}
    >
      <Typography.Title>Compare Regions</Typography.Title>
      <Typography.Paragraph>select one or more regions to start</Typography.Paragraph>
      <Comparing regions={EMPTY} path={`/compare/[regions]/date/${apiDate}`} clearPath={`/date/${apiDate}`} />
    </BaseLayout>
  );
}
