import { Button, Dropdown, Menu } from 'antd';
import {
  DownloadOutlined,
  FileImageOutlined,
  FileOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';

export function DownloadMenu({ path, img = true }: { path: string; img?: boolean }) {
  const menu = (
    <Menu>
      {img && (
        <Menu.ItemGroup title="Image">
          <Menu.Item icon={<FileImageOutlined />}>
            <a href={`/api${path}.svg?download&details`}>Download SVG</a>
          </Menu.Item>
          <Menu.Item icon={<FileImageOutlined />}>
            <a href={`/api${path}.png?download&details`}>Download PNG</a>
          </Menu.Item>
          <Menu.Item icon={<FilePdfOutlined />}>
            <a href={`/api${path}.pdf?download&details`}>Download PDF</a>
          </Menu.Item>
          <Menu.Item icon={<FileOutlined />}>
            <a href={`/api${path}.vg?download&details`}>Download Vega Spec</a>
          </Menu.Item>
        </Menu.ItemGroup>
      )}
      <Menu.ItemGroup title="Data">
        <Menu.Item icon={<FileOutlined />}>
          <a href={`/api${path}.json?download&details`}>Download JSON</a>
        </Menu.Item>
        <Menu.Item icon={<FileExcelOutlined />}>
          <a href={`/api${path}.csv?download&details`}>Download CSV</a>
        </Menu.Item>
      </Menu.ItemGroup>
    </Menu>
  );
  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button type="default" shape="circle" icon={<DownloadOutlined />} />
    </Dropdown>
  );
}
