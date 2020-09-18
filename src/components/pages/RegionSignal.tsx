import BaseLayout from '@/components/blocks/BaseLayout';
import { RegionSelect } from '@/components/blocks/RegionSelect';
import { SignalSelect } from '@/components/blocks/SignalSelect';
import { ISignal } from '@/model/signals';
import { Divider, Typography } from 'antd';
import { IRegion } from '../../model';
import ContentLayout from '../blocks/ContentLayout';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { SignalInfoBlock } from '../blocks/SignalInfoBox';
import { DateTable } from '../blocks/SignalTable';
import VegaImage from '../blocks/VegaImage';

export function RegionSignal({ region, signal }: { region?: IRegion; signal?: ISignal }) {
  return (
    <BaseLayout
      pageTitle={`${region?.name} - ${signal?.name}`}
      mainActive="overview"
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
        <Typography.Paragraph>{signal?.description()}</Typography.Paragraph>
        <VegaImage
          src={region != null && signal != null ? `/api/region/${region?.id}/${signal?.id}` : undefined}
          alt={`History of ${signal?.name}`}
          large
          type="line"
        />
        <Divider />
        <SignalInfoBlock signal={signal} />
        <Typography.Title level={2}>Detail Table</Typography.Title>
        <DateTable signal={signal} region={region} />
      </ContentLayout>
    </BaseLayout>
  );
}
