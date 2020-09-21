import BaseLayout from '@/components/blocks/BaseLayout';
import { RegionsSelect } from '@/components/blocks/RegionSelect';
import { SignalSelect } from '@/components/blocks/SignalSelect';
import { ISignal } from '@/model/signals';
import { Divider, Typography } from 'antd';
import { IRegion } from '../../model';
import ContentLayout from '../blocks/ContentLayout';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import { SignalInfoBlock } from '../blocks/SignalInfoBox';
import { DateMultiTable } from '../blocks/DataTables';
import { LineMultiImage } from '../blocks/LineMultiImage';
import { Comparing } from '../blocks/Comparing';

export function RegionsSignalCompare({ regions, signal }: { regions: IRegion[]; signal?: ISignal }) {
  const apiRegions = regions.map((d) => d.id).join(',');
  const regionNames = regions.map((d) => d.name).join(' vs. ');
  return (
    <BaseLayout
      pageTitle={`${regionNames} - ${signal?.name}`}
      mainActive="compare"
      description={`${regionNames}: ${signal?.description()}`}
      previewImage={{
        url: `/api/compare/${apiRegions}/${signal?.id}.jpg`,
        width: 450,
        height: 247,
      }}
      title={
        <RegionsSelect
          regions={regions}
          path={`/compare/[regions]/${signal?.id}`}
          clearPath={`/signal/${signal?.id}`}
        />
      }
      subTitle={
        <SignalSelect signal={signal} path={`/compare/${apiRegions}/[signal]`} clearPath={`/compare/${apiRegions}`} />
      }
      breadcrumb={[
        {
          breadcrumbName: 'Compare',
          path: '/compare',
        },
        {
          breadcrumbName: regions.map((d) => d.name).join(', '),
          path: '/compare/[regions]',
        },
        {
          breadcrumbName: signal?.name ?? '',
          path: '/compare/[regions]/[signal]',
        },
      ]}
      extra={[
        <FavoriteToggle region={regions} signal={signal} key="bookmark" warning={false} history />,
        <DownloadMenu key="download" path={`/compare/${apiRegions}/${signal?.id}`} />,
      ]}
    >
      <ContentLayout>
        <Typography.Title>{signal?.name}</Typography.Title>
        <Typography.Paragraph>{signal?.description()}</Typography.Paragraph>
        <Divider />
        <Comparing regions={regions} path={`/compare/[regions]/${signal?.id}`} clearPath={`/signal/${signal?.id}`} />
        <LineMultiImage scale={2} interactive regions={regions} signal={signal} />
        <Divider />
        <SignalInfoBlock signal={signal} />
        <Divider />
        <Typography.Title level={2}>Data Table</Typography.Title>
        <DateMultiTable signal={signal} regions={regions} />
      </ContentLayout>
    </BaseLayout>
  );
}
