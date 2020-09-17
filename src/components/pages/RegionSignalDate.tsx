import BaseLayout, { DateSelect, RegionSelect, SignalSelect } from '@/components/blocks/BaseLayout';
import { formatAPIDate, formatLocal } from '@/common';
import { IRegion, ISignal } from '@/model';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { RegionSignalKeyFacts } from '../blocks/RegionSignalKeyFacts';

export function RegionSignalDate({ region, signal, date }: { region?: IRegion; signal?: ISignal; date?: Date }) {
  const apiDate = formatAPIDate(date);
  return (
    <BaseLayout
      pageTitle={`COVID ${region?.name} - ${signal?.name} as of ${formatLocal(date)}`}
      mainActive="region"
      title="COVID"
      subTitle={
        <>
          <RegionSelect
            region={region}
            path={`/region/[region]/${signal?.id}/${apiDate}`}
            clearPath={`/signal/${signal?.id}/${apiDate}`}
          />
          -
          <SignalSelect
            signal={signal}
            path={`/region/${region?.id}/[signal]/${apiDate}`}
            clearPath={`/region/${region?.id}/all/${apiDate}`}
          />
          as of
          <DateSelect
            date={date}
            path={`/region/${region?.id}/${signal?.id}/[date]`}
            clearPath={`/region/${region?.id}/${signal?.id}`}
          />
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
      extra={[
        <FavoriteToggle signal={signal} region={region} key="bookmark" warning={false} />,
        <DownloadMenu key="download" img={false} path={`/region/${region?.id}/${signal?.id}/${apiDate}`} />,
      ]}
    >
      <RegionSignalKeyFacts signal={signal} region={region} date={date} />
    </BaseLayout>
  );
}
