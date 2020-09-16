import BaseLayout, { DateSelect, RegionSelect } from '@/components/blocks/BaseLayout';
import { formatAPIDate, formatLocal } from '@/common';
import { IRegion } from '@/model';

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
      TODO Region Date
    </BaseLayout>
  );
}
