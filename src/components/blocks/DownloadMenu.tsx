import { Button, Dropdown, Menu } from 'antd';
import { DownloadOutlined, FileImageOutlined, FileOutlined, FileExcelOutlined } from '@ant-design/icons';

export function DownloadMenu({ path, img = true }: { path: string; img?: boolean }) {
  const menu = (
    <Menu>
      {img && (
        <Menu.Item key="svg" icon={<FileImageOutlined />}>
          <a href={`/api${path}.svg?download&details`}>Download SVG</a>
        </Menu.Item>
      )}
      {img && (
        <Menu.Item key="vg" icon={<FileImageOutlined />}>
          <a href={`/api${path}.vg?download&details`}>Download Vega Spec</a>
        </Menu.Item>
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
