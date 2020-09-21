import { formatAPIDate, formatLocal } from '@/common';
import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { IRegion, signals } from '@/model';
import { Row } from 'antd';
import { Fragment } from 'react';
import GridColumn from '../blocks/GridColumn';
import { RegionsSelect } from '../blocks/RegionSelect';
import RegionsSignalCompareHistorySection from '../sections/RegionsSignalCompareHistory';
import RegionsSignalCompareSection from '../sections/RegionsSignalCompareSection';

export function RegionsCompareOverview({
  regions,
  date,
  dynamic,
}: {
  regions: IRegion[];
  date?: Date;
  dynamic?: boolean;
}) {
  const apiRegions = regions.map((d) => d.id).join(',');
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`${formatLocal(date)}`}
      mainActive="overview"
      title={<RegionsSelect regions={regions} path={`/compare/[regions]/${apiDate}`} clearPath={`/date/${apiDate}`} />}
      subTitle={<DateSelect date={date} path={`/compare/${apiRegions}/[date]`} clearPath={`/compare/${apiRegions}`} />}
      breadcrumb={[
        {
          breadcrumbName: 'Compare',
          path: `/compare`,
        },
        {
          breadcrumbName: regions.map((d) => d.name).join(', '),
          path: `/compare/[regions]`,
        },
        ...(dynamic
          ? []
          : [
              {
                breadcrumbName: formatAPIDate(date),
                path: `/compare/[regions]/date/[date]`,
              },
            ]),
      ]}
    >
      <Row>
        {signals.map((s) => (
          <Fragment key={s.id}>
            <GridColumn>
              <RegionsSignalCompareSection regions={regions} signal={s} date={date} focus="signal" />
            </GridColumn>
            <GridColumn>
              <RegionsSignalCompareHistorySection regions={regions} signal={s} date={date} focus="signal" />
            </GridColumn>
          </Fragment>
        ))}
      </Row>
    </BaseLayout>
  );
}
