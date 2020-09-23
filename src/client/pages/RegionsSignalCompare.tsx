import BaseLayout from '../components/BaseLayout';
import { RegionsSelect } from '../components/RegionSelect';
import { SignalSelect } from '../components/SignalSelect';
import type { ISignal } from '@/model/signals';
import { Divider, Typography } from 'antd';
import type { IRegion } from '../../model';
import ContentLayout from '../components/ContentLayout';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { SignalInfoBlock } from '../components/SignalInfoBox';
import { DateMultiTable } from '../components/DataTables';
import { LineMultiImage } from '../vega/LineMultiImage';
import { Comparing } from '../components/Comparing';
import { fullUrl } from '@/client/hooks';

export function RegionsSignalCompare({ regions, signal }: { regions: IRegion[]; signal?: ISignal }) {
  const regionNames = regions.map((d) => d.name).join(' vs. ');
  return (
    <BaseLayout
      pageTitle={`${regionNames} - ${signal?.name}`}
      mainActive="compare"
      description={`${regionNames}: ${signal?.description()}`}
      previewImage={fullUrl('/api/compare/[regions]/[signal].jpg', { regions, signal })}
      title={
        <RegionsSelect
          regions={regions}
          path="/compare/[regions]/[signal]"
          clearPath="/signal/[signal]"
          query={{ signal }}
        />
      }
      subTitle={
        <SignalSelect
          signal={signal}
          path="compare/[regions]/[signal]"
          clearPath="/compare/[regions]"
          query={{ regions }}
        />
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
        <DownloadMenu key="download" path={fullUrl('/compare/[regions]/[signal]', { signal, regions })} />,
      ]}
    >
      <ContentLayout>
        <Typography.Title>{signal?.name}</Typography.Title>
        <Typography.Paragraph>{signal?.description()}</Typography.Paragraph>
        <Divider />
        <Comparing
          regions={regions}
          path="/compare/[regions]/[signal]"
          clearPath="/signal/[signal]"
          query={{ signal }}
        />
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