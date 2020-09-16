import BaseLayout, { DateSelect, RegionSelect } from '@/components/blocks/BaseLayout';
import { formatAPIDate, formatLocal } from '@/common';
import { IRegion, signals } from '@/model';
import GridColumn from '../blocks/GridColumn';
import { Row } from 'antd';
import RegionSignalSection from '../sections/RegionSignalSection';

export function RegionDate({ date, region }: { region?: IRegion; date?: Date }) {
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`COVID ${region?.name} as of ${formatLocal(date)}`}
      mainActive="region"
      title="COVID"
      subTitle={
        <>
          <RegionSelect region={region} path="/region/[region]/all/[date]" clearPath="/date/[date]" />
          as of
          <DateSelect date={date} path="/region/[region]/all/[date]" clearPath="/region/[region]" />
        </>
      }
      breadcrumb={[
        {
          breadcrumbName: region?.name ?? '',
          path: '/region/[region]',
        },
        {
          breadcrumbName: apiDate,
          path: '/region/[region]/all/[date]',
        },
      ]}
    >
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
