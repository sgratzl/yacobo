import BaseLayout from '@/components/blocks/BaseLayout';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import { Button, Tooltip } from 'antd';
import SwaggerUI from 'swagger-ui-react';

export default function OpenAPI() {
  return (
    <BaseLayout
      pageTitle="YaCoBo OpenAPI"
      title="YaCoBo OpenAPI"
      mainActive="api"
      breadcrumb={[
        {
          breadcrumbName: 'OpenAPI',
          path: `/openapi`,
        },
      ]}
      extra={[
        <Tooltip title="Download OpenAPI JSON file">
          <Button type="default" shape="circle" icon={<DownloadOutlined />} href="/api/openapi.json" download />
        </Tooltip>,
      ]}
    >
      <SwaggerUI url="./api/openapi.json" />
    </BaseLayout>
  );
}
