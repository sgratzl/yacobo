import { useQueryParam } from '@/client/hooks';
import { extractDate, extractSignal } from '@/common/validator';
import BaseLayout, { DateSelect, SignalSelect } from '@/components/BaseLayout';
import { FavoriteToggle } from '@/components/FavoriteToggle';
import MapImage from '@/components/MapImage';
import SignalTable from '@/components/SignalTable';
import { signals } from '@/model/signals';
import { Col, Divider, Row, Typography } from 'antd';
import { isValid } from 'date-fns';
import { DownloadMenu } from '@/components/DownloadMenu';
import { formatLocal, formatAPIDate } from '@/common';

export default function SignalDate() {
  // TODO could be a fake one
  const signal = useQueryParam(extractSignal) ?? signals[0];
  const date = useQueryParam(extractDate);
  const apiDate = formatAPIDate(date);
  const validDate = isValid(date);
  const image = `/api/signal/${signal.id}/${apiDate}.png`;

  return (
    <BaseLayout
      pageTitle={`COVID ${signal.name} as of ${formatLocal(date)}`}
      mainActive="overview"
      title="COVID"
      subTitle={
        <>
          <SignalSelect signal={signal} path={`/signal/[signal]/[date]`} clearPath={`/date/[date]`} />
          as of
          <DateSelect date={date} path={`/signal/[signal]/[date]`} clearPath={`/signal/all/[date]`} />
        </>
      }
      breadcrumb={[
        {
          breadcrumbName: signal.name,
          path: `/signal/[signal]`,
        },
        {
          breadcrumbName: apiDate,
          path: `/signal/[signal]/[date]`,
        },
      ]}
      extra={[
        <FavoriteToggle signal={signal} key="bookmark" warning={false} />,
        <DownloadMenu key="download" path={`/signal/${signal.id}/${apiDate}`} />,
      ]}
    >
      <Row>
        <Col span={24}>
          <Typography.Paragraph>{signal.description(date)}</Typography.Paragraph>
        </Col>
        <Col span={24}>
          <MapImage src={validDate ? image : undefined} alt={`US Map of ${signal.name}`} large />
        </Col>
        <Divider />
        <Col span={24}>
          <Typography.Title level={2}>Description</Typography.Title>
          <Typography.Paragraph>{signal.longDescription(date)}</Typography.Paragraph>
        </Col>

        <Col span={24}>
          <Typography.Title level={2}>Background</Typography.Title>
          <Typography.Paragraph>{signal.longDescription(date)}</Typography.Paragraph>
        </Col>

        <Col span={24}>
          <Typography.Title level={2}>Detail Table</Typography.Title>
          <SignalTable signal={signal} date={date} />
        </Col>
      </Row>
    </BaseLayout>
  );
}
