import BaseLayout from '@/components/blocks/BaseLayout';
import GithubOutlined from '@ant-design/icons/GithubOutlined';
import BugOutlined from '@ant-design/icons/BugOutlined';
import { Button, Tooltip, Typography } from 'antd';
import ContentLayout from '@/components/blocks/ContentLayout';

export default function OpenAPI() {
  return (
    <BaseLayout
      pageTitle="About"
      title="About YaCoBo"
      mainActive="about"
      breadcrumb={[
        {
          breadcrumbName: 'About',
          path: `/about`,
        },
      ]}
      extra={[
        <Tooltip key="github" title="Go to GitHub Repository">
          <Button
            type="default"
            shape="circle"
            icon={<GithubOutlined />}
            href="https://github.com/sgratzl/yacobo"
            target="_blank"
            rel="noopener noreferrer"
          />
        </Tooltip>,
        <Tooltip key="issue" title="File a Bug Report">
          <Button
            type="default"
            shape="circle"
            icon={<BugOutlined />}
            href="https://github.com/sgratzl/yacobo/issues/new"
            target="_blank"
            rel="noopener noreferrer"
          />
        </Tooltip>,
      ]}
    >
      <ContentLayout>
        <Typography.Title>About</Typography.Title>
        <Typography.Paragraph>
          <Typography.Text strong>YaCoBo</Typography.Text>
          {' is a hobby project by '}
          <Typography.Link href="https://www.sgratzl.com" target="_blank" rel="noopener noreferrer">
            Samuel Gratzl
          </Typography.Link>
          {'.'}
        </Typography.Paragraph>

        <Typography.Title level={2}>Bugs, Feature Requests, Feedback</Typography.Title>
        <Typography.Paragraph>
          {
            'If you find any bugs, wanna leave general feedback or have some requests for additional features, the easiest option is to create an '
          }
          <Typography.Link
            href="https://github.com/sgratzl/yacobo/issues/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub issue
          </Typography.Link>
          {'.'}
        </Typography.Paragraph>

        <Typography.Title level={2}>License</Typography.Title>
        <Typography.Paragraph>
          <Typography.Text strong>YaCoBo</Typography.Text>
          {' is released under the '}
          <Typography.Link
            href="https://github.com/sgratzl/yacobo/blob/master/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
          >
            MIT License
          </Typography.Link>
          {'. The data is fetched and cached from the public '}
          <Typography.Link
            href="https://cmu-delphi.github.io/delphi-epidata/api/covidcast.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            COVIDCast API
          </Typography.Link>
          {'. Their '}
          <Typography.Link
            href="there https://covidcast.cmu.edu/terms-of-use.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Use
          </Typography.Link>
          {' apply.'}
        </Typography.Paragraph>

        <Typography.Title level={2}>Privacy Notice</Typography.Title>
        <Typography.Paragraph>
          <Typography.Text strong>YaCoBo</Typography.Text>
          {' is not storing any user data on a server.'}
          {' The localstorage API of the web browser is used to store the personalized favorite list. '}
        </Typography.Paragraph>
      </ContentLayout>
    </BaseLayout>
  );
}
