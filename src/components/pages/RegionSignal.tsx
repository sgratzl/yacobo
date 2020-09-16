import BaseLayout, { RegionSelect, SignalSelect } from '@/components/blocks/BaseLayout';
import { ISignal } from '@/model/signals';
import { IRegion } from '../../model';

export function RegionSignal({ region, signal }: { region?: IRegion; signal?: ISignal }) {
  return (
    <BaseLayout
      pageTitle={`COVID ${region?.name} - ${signal?.name}`}
      mainActive="region"
      title="COVID"
      subTitle={
        <>
          <RegionSelect region={region} path="/region/[region]/[signal]" clearPath="/signal/[signal]" />
          -
          <SignalSelect signal={signal} path="/region/[region]/[signal]" clearPath="/region/[region]" />
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
      ]}
    >
      TODO
    </BaseLayout>
  );
}
