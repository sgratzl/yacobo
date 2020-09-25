import BaseLayout from '../components/BaseLayout';
import { RegionSelect } from '../components/RegionSelect';
import { SignalSelect } from '../components/SignalSelect';
import type { ISignal } from '@/model/signals';
import { Divider, Typography } from 'antd';
import type { IRegion } from '../../model';
import ContentLayout from '../components/ContentLayout';
import { DownloadMenu } from '../components/DownloadMenu';
import { FavoriteToggle } from '../components/FavoriteToggle';
import { SignalInfoBlock } from '../components/SignalInfoBox';
import { DateTable } from '../components/DataTables';
import { LineImage } from '../vega/LineImage';
import { fullUrl } from '@/client/hooks';
import { CompareWithButton } from '../components/CompareIcon';

export function RegionSignal({ region, signal }: { region?: IRegion; signal?: ISignal }) {
  return (
    <BaseLayout
      pageTitle={`${region?.name} - ${signal?.name}`}
      mainActive="overview"
      description={`${region?.name}: ${signal?.description()}`}
      previewImage={fullUrl('/api/region/[region]/[signal].jpg', { region, signal })}
      title={
        <RegionSelect
          region={region}
          path="/region/[region]/[signal]"
          clearPath="/signal/[signal]"
          query={{ signal }}
        />
      }
      subTitle={
        <SignalSelect
          signal={signal}
          path="/region/[region]/[signal]"
          clearPath="/region/[region]"
          query={{ region }}
        />
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
        <CompareWithButton key="c" region={region} signal={signal} />,
        region && signal && (
          <FavoriteToggle key="bookmark" warning={false} favorite={{ type: 'r+s+h', region, signal }} />
        ),
        <DownloadMenu key="download" path={fullUrl('/region/[region]/[signal]', { region, signal })} />,
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
