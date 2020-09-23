import { fullUrl } from '@/client/hooks';
import { formatAPIDate, formatLocal } from '@/common';
import type { IDateRange } from '@/model';
import BaseLayout from '../components/BaseLayout';
import { DateSelect } from '../components/DateSelect';
import { IRegion, refSignal, signals } from '@/model';
import { Row, Typography } from 'antd';
import { Comparing } from '../components/Comparing';
import GridColumn from '../components/GridColumn';
import { RegionsSelect } from '../components/RegionSelect';
import RegionWidget from '../widgets/RegionWidget';
import RegionsSignalCompareHistoryWidget from '../widgets/RegionsSignalCompareHistoryWidget';

export function RegionsCompareOverview({
  regions,
  date,
  dynamic,
}: {
  regions: IRegion[];
  date?: Date;
  dynamic?: IDateRange;
}) {
  const title = regions.map((r) => r.name).join(' vs. ');
  return (
    <BaseLayout
      pageTitle={`${title} as of ${formatLocal(date)}`}
      description={`Comparing ${title} as of ${formatLocal(date)} over multiple signals. ${refSignal.description(
        date
      )}`}
      previewImage={fullUrl('/api/compare/[regions]/[signal].jpg?highlight=[date]', {
        regions,
        signal: refSignal,
        date,
      })}
      mainActive="compare"
      title={
        <RegionsSelect
          regions={regions}
          path="/compare/[regions]/date/[date]"
          clearPath="/compare/date/[date]"
          query={{ date }}
        />
      }
      subTitle={
        <DateSelect
          date={date}
          path="/compare/[regions]/date/[date]"
          clearPath="/compare/[regions]"
          query={{ regions }}
          dateRange={dynamic}
        />
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
      <Typography.Title>{title}</Typography.Title>
      <Comparing
        regions={regions}
        path="/compare/[regions]/date/[date]"
        clearPath="/compare/date/[date]"
        query={{ date }}
      />
      <Row>
        {regions.map((r, i) => (
          <GridColumn key={r.id}>
            <RegionWidget region={r} date={date} focus="both" compare={i} />
          </GridColumn>
        ))}
      </Row>
      <Row>
        {signals.map((s) => (
          <GridColumn key={s.id}>
            <RegionsSignalCompareHistoryWidget regions={regions} signal={s} date={date} focus="signal" legend={false} />
          </GridColumn>
        ))}
      </Row>
    </BaseLayout>
  );
}
