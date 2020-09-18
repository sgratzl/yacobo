import BaseLayout from '@/components/blocks/BaseLayout';
import { DateSelect } from '@/components/blocks/DateSelect';
import { RegionSelect } from '@/components/blocks/RegionSelect';
import { formatAPIDate, formatLocal } from '@/common';
import { IRegion, refSignal, signals } from '@/model';
import GridColumn from '../blocks/GridColumn';
import { Row, Typography } from 'antd';
import RegionSignalSection from '../sections/RegionSignalSection';
import VegaImage from '../blocks/VegaImage';

export function RegionDate({ date, region, dynamic }: { region?: IRegion; date?: Date; dynamic?: boolean }) {
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`${region?.name} as of ${formatLocal(date)}`}
      mainActive="overview"
      title={<RegionSelect region={region} path={`/region/[region]/date/${apiDate}`} clearPath={`/date/${apiDate}`} />}
      subTitle={
        <DateSelect date={date} path={`/region/${region?.id}/date/[date]`} clearPath={`/region/${region?.id}`} />
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
      <Typography.Title>{region?.name}</Typography.Title>
      {dynamic && (
        <>
          <Typography.Title level={2}>History of {refSignal.name}</Typography.Title>
          <VegaImage
            src={region != null ? `/api/region/${region?.id}/${refSignal.id}` : undefined}
            alt={`History of ${refSignal.name}`}
            large
            type="line"
          />
          <Typography.Title level={2}>All Signals</Typography.Title>
        </>
      )}
      <Row>
        {signals.map((s) => (
          <GridColumn key={s.id}>
            <RegionSignalSection region={region} signal={s} date={date} focus="signal" />
          </GridColumn>
        ))}
      </Row>
    </BaseLayout>
  );
}
