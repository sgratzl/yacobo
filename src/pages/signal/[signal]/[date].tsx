import { useQueryParam } from '@/api/hooks';
import { extractDate, extractSignal } from '@/api/validator';
import BaseLayout, { DateSelect, SignalSelect } from '@/components/BaseLayout';
import MapImage from '@/components/MapImage';
import { signals } from '@/data/constants';
import { formatISODate, formatLocal } from '@/ui/utils';
import { Button, Col, Divider, Dropdown, Row, Typography } from 'antd';
import { isValid } from 'date-fns';
import React, { ReactNode } from 'react';
import SignalTable from '@/components/SignalTable';
import { DownloadSignalMenu } from '@/components/SignalSection';
import { BookmarkToggle } from '@/components/BookmarkToggle';
import { DownloadOutlined } from '@ant-design/icons';

function f(v: ReactNode | ((v?: Date) => ReactNode), date?: Date) {
  return typeof v === 'function' ? v(date) : v;
}

export default function SignalDate() {
  // TODO could be a fake one
  const signal = useQueryParam(extractSignal) ?? signals[0];
  const date = useQueryParam(extractDate);
  const apiDate = formatISODate(date);
  const validDate = isValid(date);
  const image = `/api/signal/${signal.id}/${apiDate}.png?plain`;

  return (
    <BaseLayout
      pageTitle={`COVID ${signal.name} as of ${formatLocal(date)}`}
      mainActive="overview"
      title="COVID"
      subTitle={
        <>
          <SignalSelect signal={signal} path={`/signal/[signal]/[date]`} />
          as of
          <DateSelect date={date} path={`/signal/[signal]/[date]`} />
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
        <BookmarkToggle signal={signal} key="a" />,
        <Dropdown key="b" overlay={<DownloadSignalMenu signal={signal} date={date} />} trigger={['click']}>
          <Button type="default" shape="circle" icon={<DownloadOutlined />} />
        </Dropdown>,
      ]}
    >
      <Row>
        <Col span={24}>
          <Typography.Paragraph>{f(signal.description, date)}</Typography.Paragraph>
        </Col>
        <Col span={24}>
          <MapImage src={validDate ? image : undefined} alt={`US Map of ${signal.name}`} large />
        </Col>
        <Divider />
        <Col span={24}>
          <Typography.Title level={2}>Description</Typography.Title>
          <Typography.Paragraph>{f(signal.longDescription, date)}</Typography.Paragraph>
        </Col>

        <Col span={24}>
          <Typography.Title level={2}>Background</Typography.Title>
          <Typography.Paragraph>{f(signal.longDescription, date)}</Typography.Paragraph>
        </Col>

        <Col span={24}>
          <Typography.Title level={2}>Detail Table</Typography.Title>
          <SignalTable signal={signal} date={date} />
        </Col>
      </Row>
    </BaseLayout>
  );
}
