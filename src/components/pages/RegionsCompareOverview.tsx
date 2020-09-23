import { fullUrl } from '@/client/hooks';
import { formatAPIDate, formatLocal } from '@/common';
import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { IRegion, refSignal, signals } from '@/model';
import { Row, Typography } from 'antd';
import { Comparing } from '../blocks/Comparing';
import GridColumn from '../blocks/GridColumn';
import { RegionsSelect } from '../blocks/RegionSelect';
import RegionSection from '../sections/RegionSection';
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
            <RegionSection region={r} date={date} focus="both" compare={i} />
          </GridColumn>
        ))}
      </Row>
      <Row>
        {signals.map((s) => (
          <GridColumn key={s.id}>
            <RegionsSignalCompareHistorySection
              regions={regions}
              signal={s}
              date={date}
              focus="signal"
              legend={false}
            />
          </GridColumn>
        ))}
      </Row>
    </BaseLayout>
  );
}
