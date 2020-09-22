import { formatAPIDate, formatAPIRegions, formatLocal } from '@/common';
import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { IRegion, refSignal, signals } from '@/model';
import { Row, Typography } from 'antd';
import { Comparing } from '../blocks/Comparing';
import GridColumn from '../blocks/GridColumn';
import { RegionsSelect } from '../blocks/RegionSelect';
import RegionsSignalCompareHistorySection from '../sections/RegionsSignalCompareHistory';

export function RegionsCompareOverview({
  regions,
  date,
  dynamic,
}: {
  regions: IRegion[];
  date?: Date;
  dynamic?: boolean;
}) {
  const apiRegions = formatAPIRegions(regions);
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`${formatLocal(date)}`}
      description={refSignal.description(date)}
      previewImage={{
        url: `/api/compare/${apiRegions}/${refSignal?.id}.jpg?highlight=${apiDate}`,
        width: 450,
        height: 247,
      }}
      mainActive="compare"
      title={
        <RegionsSelect
          regions={regions}
          path={`/compare/[regions]/date/${apiDate}`}
          clearPath={`/compare/date/${apiDate}`}
        />
      }
      subTitle={
        <DateSelect date={date} path={`/compare/${apiRegions}/date/[date]`} clearPath={`/compare/${apiRegions}`} />
      }
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
      <Typography.Title>{regions.map((r) => r.name).join(' vs. ')}</Typography.Title>
      <Comparing regions={regions} path={`/compare/[regions]/date/${apiDate}`} clearPath={`/compare/date/${apiDate}`} />
      <Row>
        {signals.map((s) => (
          <GridColumn key={s.id}>
            <RegionsSignalCompareHistorySection regions={regions} signal={s} date={date} focus="signal" />
          </GridColumn>
        ))}
      </Row>
    </BaseLayout>
  );
}
