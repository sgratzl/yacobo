import { useQueryParam } from '@/client/hooks';
import { extractRegion, extractSignal } from '@/common/validator';
import BaseLayout, { RegionSelect, SignalSelect } from '@/components/BaseLayout';
import { Col, Divider, Row, Typography } from 'antd';
import MapImage from '@/components/MapImage';
import { DateTable } from '@/components/SignalTable';

export default function Region() {
  const region = useQueryParam(extractRegion);
  const signal = useQueryParam(extractSignal);

  const image = `/api/region/${region?.id}/${signal?.id}.png`;

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
      <Row>
        <Col span={24}>
          <MapImage
            src={region && signal ? image : undefined}
            alt={`Line Chart ${signal?.name} for ${region?.name}`}
            type="line"
            large
          />
        </Col>
        <Divider />
        <Col span={24}>
          <Typography.Title level={2}>Detail Table</Typography.Title>
          <DateTable signal={signal} region={region} />
        </Col>
      </Row>
    </BaseLayout>
  );
}
