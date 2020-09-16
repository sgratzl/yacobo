import { Button, Dropdown, Menu } from 'antd';
import {
  DownloadOutlined,
  FileImageOutlined,
  FileOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { Fragment } from 'react';

export function DownloadMenu({ path, img = true }: { path: string; img?: boolean }) {
  const menu = (
    <Menu>
      {img && (
        <Fragment key="img">
          (
          <Menu.Item key="svg" icon={<FileImageOutlined />}>
            <a href={`/api${path}.svg?download&details`}>Download SVG</a>
          </Menu.Item>
          <Menu.Item key="png" icon={<FileImageOutlined />}>
            <a href={`/api${path}.png?download&details`}>Download PNG</a>
          </Menu.Item>
          <Menu.Item key="pdf" icon={<FilePdfOutlined />}>
            <a href={`/api${path}.pdf?download&details`}>Download PDF</a>
          </Menu.Item>
          <Menu.Item key="vg" icon={<FileImageOutlined />}>
            <a href={`/api${path}.vg?download&details`}>Download Vega Spec</a>
          </Menu.Item>
          )
        </Fragment>
      )}
      <Menu.Item key="json" icon={<FileOutlined />}>
        <a href={`/api${path}.json?download&details`}>Download JSON</a>
      </Menu.Item>
      <Menu.Item key="csv" icon={<FileExcelOutlined />}>
        <a href={`/api${path}.csv?download&details`}>Download CSV</a>
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button type="default" shape="circle" icon={<DownloadOutlined />} />
    </Dropdown>
  );
}
