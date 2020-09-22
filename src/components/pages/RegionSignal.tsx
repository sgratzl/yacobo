import BaseLayout from '@/components/blocks/BaseLayout';
import { RegionSelect } from '@/components/blocks/RegionSelect';
import { SignalSelect } from '@/components/blocks/SignalSelect';
import type { ISignal } from '@/model/signals';
import { Divider, Typography } from 'antd';
import type { IRegion } from '../../model';
import ContentLayout from '../blocks/ContentLayout';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { SignalInfoBlock } from '../blocks/SignalInfoBox';
import { DateTable } from '../blocks/DataTables';
import { LineImage } from '../blocks/LineImage';

export function RegionSignal({ region, signal }: { region?: IRegion; signal?: ISignal }) {
  return (
    <BaseLayout
      pageTitle={`${region?.name} - ${signal?.name}`}
      mainActive="overview"
      description={`${region?.name}: ${signal?.description()}`}
      previewImage={{
        url: `/api/region/${region?.id}/${signal?.id}.jpg`,
        width: 450,
        height: 247,
      }}
      title={
        <RegionSelect region={region} path={`/region/[region]/${signal?.id}`} clearPath={`/signal/${signal?.id}`} />
      }
      subTitle={
        <SignalSelect signal={signal} path={`/region/${region?.id}/[signal]`} clearPath={`/region/${region?.id}`} />
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
      extra={[
        <FavoriteToggle region={region} signal={signal} key="bookmark" warning={false} history />,
        <DownloadMenu key="download" path={`/region/${region?.id}/${signal?.id}`} />,
      ]}
    >
      <ContentLayout>
        <Typography.Title>{signal?.name}</Typography.Title>
        <Typography.Paragraph>{signal?.description()}</Typography.Paragraph>
        <LineImage scale={2} interactive region={region} signal={signal} />
        <Divider />
        <SignalInfoBlock signal={signal} />
        <Divider />
        <Typography.Title level={2}>Data Table</Typography.Title>
        <DateTable signal={signal} region={region} />
      </ContentLayout>
    </BaseLayout>
  );
}
