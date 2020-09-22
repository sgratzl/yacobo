import { formatAPIDate, formatLocal } from '@/common';
import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import type { IRegion } from '@/model';
import { Typography } from 'antd';
import { Comparing } from '../blocks/Comparing';
import { RegionsSelect } from '../blocks/RegionSelect';

const EMPTY: IRegion[] = [];

export function CompareOverview({ date, dynamic }: { date?: Date; dynamic?: boolean }) {
  return (
    <BaseLayout
      pageTitle={`${formatLocal(date)}`}
      mainActive="compare"
      title={
        <RegionsSelect
          regions={EMPTY}
          path="/compare/[regions]/date/[date]"
          clearPath="/date/[date]"
          query={{ date }}
        />
      }
      subTitle={<DateSelect date={date} path="/compare/date/[date]" clearPath="/compare" query={{}} />}
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
      <Comparing regions={EMPTY} path="/compare/[regions]/date/[date]" clearPath="/date/[date]" query={{ date }} />
    </BaseLayout>
  );
}
