import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { RegionSelect } from '@/components/blocks/RegionSelect';
import { formatAPIDate, formatLocal } from '@/common';
import { IRegion, refSignal, signals } from '@/model';
import GridColumn from '../blocks/GridColumn';
import { Row, Typography } from 'antd';
import RegionSignalSection from '../sections/RegionSignalSection';
import { LineImage } from '../blocks/LineImage';
import ContentLayout from '../blocks/ContentLayout';
import { Fragment } from 'react';
import RegionSignalHistorySection from '../sections/RegionSignalHistory';
import { fullUrl } from '@/client/hooks';
import type { IDateRange } from '@/model';

export function RegionDate({ date, region, dynamic }: { region?: IRegion; date?: Date; dynamic?: IDateRange }) {
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`${region?.name} as of ${formatLocal(date)}`}
      mainActive="overview"
      description={`${region?.name} as of ${formatLocal(date)}. ${refSignal.description(date)}`}
      previewImage={fullUrl('/api/region/[region]/[signal].jpg?highlight=[date]', { date, signal: refSignal, region })}
      title={
        <RegionSelect region={region} path="/region/[region]/date/[date]" clearPath="/date/[date]" query={{ date }} />
      }
      subTitle={
        <DateSelect
          date={date}
          path="/region/[region]/date/[date]"
          clearPath="/region/[region]"
          query={{ region }}
          dynamic={dynamic}
        />
      }
      breadcrumb={[
        {
          breadcrumbName: region?.name ?? '',
          path: '/region/[region]',
        },
        !dynamic
          ? [
              {
                breadcrumbName: apiDate,
                path: '/region/[region]/date/[date]',
              },
            ]
          : [],
      ].flat()}
    >
      <ContentLayout>
        <Typography.Title>{region?.name}</Typography.Title>
        {dynamic && (
          <>
            <Typography.Title level={2}>History of {refSignal.name}</Typography.Title>
            <LineImage scale={2} interactive region={region} signal={refSignal} date={date} />
            <Typography.Title level={2}>All Signals</Typography.Title>
          </>
        )}
        <Row>
          {signals.map((s) => (
            <Fragment key={s.id}>
              <GridColumn>
                <RegionSignalSection region={region} signal={s} date={date} focus="signal" />
              </GridColumn>
              <GridColumn>
                <RegionSignalHistorySection region={region} signal={s} date={date} focus="signal" />
              </GridColumn>
            </Fragment>
          ))}
        </Row>
      </ContentLayout>
    </BaseLayout>
  );
}
