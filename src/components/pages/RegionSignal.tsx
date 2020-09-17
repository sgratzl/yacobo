import BaseLayout, { RegionSelect, SignalSelect } from '@/components/blocks/BaseLayout';
import { ISignal } from '@/model/signals';
import { Col, Divider, Row, Typography } from 'antd';
import { IRegion } from '../../model';
import { DownloadMenu } from '../blocks/DownloadMenu';
import { FavoriteToggle } from '../blocks/FavoriteToggle';
import VegaImage from '../blocks/VegaImage';
import { SignalInfoBlock } from '../blocks/SignalInfoBox';
import { DateTable } from '../blocks/SignalTable';

export function RegionSignal({ region, signal }: { region?: IRegion; signal?: ISignal }) {
  return (
    <BaseLayout
      pageTitle={`COVID ${region?.name} - ${signal?.name}`}
      mainActive="overview"
      title="COVID"
      subTitle={
        <>
          <RegionSelect region={region} path={`/region/[region]/${signal?.id}`} clearPath={`/signal/${signal?.id}`} />
          -
          <SignalSelect signal={signal} path={`/region/${region?.id}/[signal]`} clearPath={`/region/${region?.id}`} />
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
      extra={[
        <FavoriteToggle region={region} signal={signal} key="bookmark" warning={false} history />,
        <DownloadMenu key="download" path={`/region/${region?.id}/${signal?.id}`} />,
      ]}
    >
      <Row>
        <Col span={24}>
          <Typography.Paragraph>{signal?.description()}</Typography.Paragraph>
        </Col>
        <Col span={24}>
          <VegaImage
            src={region != null && signal != null ? `/api/region/${region?.id}/${signal?.id}` : undefined}
            alt={`History of ${signal?.name}`}
            large
            type="line"
          />
        </Col>
        <Divider />
        <Col span={24}>
          <SignalInfoBlock signal={signal} />
        </Col>
        <Col span={24}>
          <Typography.Title level={2}>Detail Table</Typography.Title>
          <DateTable signal={signal} region={region} />
        </Col>
      </Row>
    </BaseLayout>
  );
}
