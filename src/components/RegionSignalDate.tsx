import BaseLayout, { DateSelect, RegionSelect, SignalSelect } from '@/components/BaseLayout';
import { formatAPIDate, formatLocal } from '@/common';
import { IRegion, ISignal } from '@/model';

export function RegionSignalDate({ region, signal, date }: { region?: IRegion; signal?: ISignal; date?: Date }) {
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`COVID ${region?.name} - ${signal?.name} as of ${formatLocal(date)}`}
      mainActive="region"
      title="COVID"
      subTitle={
        <>
          <RegionSelect region={region} path="/region/[region]/[signal]/[date]" clearPath="/signal/[signal]/[date]" />
          -
          <SignalSelect
            signal={signal}
            path="/region/[region]/[signal]/[date]"
            clearPath="/region/[region]/all/[date]"
          />
          as of
          <DateSelect date={date} path="/region/[region]/[signal]/[date]" clearPath="/region/[region]/[signal]" />
        </>
      }
      breadcrumb={[
        {
          breadcrumbName: region?.name ?? '',
          path: '/region/[region]',
        },
        {
          breadcrumbName: signal?.name ?? '',
          path: '/region/[region]/[signal]',
        },
        {
          breadcrumbName: apiDate,
          path: '/region/[region]/[signal]/[date]',
        },
      ]}
    >
      TODO
    </BaseLayout>
  );
}
