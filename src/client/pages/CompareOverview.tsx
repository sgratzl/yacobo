import { formatAPIDate, formatLocal } from '@/common';
import type { IDateRange } from '@/model';
import BaseLayout from '../components/BaseLayout';
import { DateSelect } from '../components/DateSelect';
import { IRegion, regionByID } from '@/model';
import { Typography, List } from 'antd';
import { Comparing } from '../components/Comparing';
import LinkWrapper from '../components/LinkWrapper';
import { RegionsSelect } from '../components/RegionSelect';

const EMPTY: IRegion[] = [];

const California_NewYork_Florida = [regionByID('06'), regionByID('36'), regionByID('12')];
const AlleghenyCounty_Pennsylvania = [regionByID('42003'), regionByID('42')];

export function CompareOverview({ date, dynamic }: { date?: Date; dynamic?: IDateRange }) {
  return (
    <BaseLayout
      pageTitle={`Compare multiple regions as of ${formatLocal(date)}`}
      mainActive="compare"
      title={
        <RegionsSelect
          regions={EMPTY}
          path="/compare/[regions]/date/[date]"
          clearPath="/date/[date]"
          query={{ date }}
        />
      }
      subTitle={
        <DateSelect date={date} path="/compare/date/[date]" clearPath="/compare" query={{}} dateRange={dynamic} />
      }
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
      <Typography.Title>Compare Regions as of {formatLocal(date)}</Typography.Title>
      <Typography.Paragraph>select one or more regions to start</Typography.Paragraph>
      <Typography.Title level={2}>Examples</Typography.Title>
      <List size="small">
        <List.Item>
          <LinkWrapper
            passHref
            path="/compare/[regions]/date/[date]"
            query={{ date, regions: AlleghenyCounty_Pennsylvania }}
          >
            Allegheny County vs. Pennsylvania
          </LinkWrapper>
        </List.Item>
        <List.Item>
          <LinkWrapper
            passHref
            path="/compare/[regions]/date/[date]"
            query={{ date, regions: California_NewYork_Florida }}
          >
            California vs. New York vs. Florida
          </LinkWrapper>
        </List.Item>
      </List>
      <Comparing regions={EMPTY} path="/compare/[regions]/date/[date]" clearPath="/date/[date]" query={{ date }} />
    </BaseLayout>
  );
}
