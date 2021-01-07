import { Button, Dropdown, Menu, notification, Typography } from 'antd';
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';
import FileImageOutlined from '@ant-design/icons/FileImageOutlined';
import FileOutlined from '@ant-design/icons/FileOutlined';
import FileExcelOutlined from '@ant-design/icons/FileExcelOutlined';
import FilePdfOutlined from '@ant-design/icons/FilePdfOutlined';
import { useCallback } from 'react';

export function DownloadMenu({ path, img = true, params = '' }: { path: string; img?: boolean; params?: string }) {
  const hintDownload = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    notification.info({
      message: <>Start downloading {e.currentTarget.dataset.format} file shortly&hellip;</>,
    });
  }, []);
  const menu = (
    <Menu>
      {img && (
        <Menu.ItemGroup title="Image">
          <Menu.Item icon={<FileImageOutlined />}>
            <Typography.Link href={`/api${path}.svg?download${params}`} data-format="SVG" onClick={hintDownload}>
              Download SVG
            </Typography.Link>
          </Menu.Item>
          <Menu.Item icon={<FileImageOutlined />}>
            <Typography.Link href={`/api${path}.png?download${params}`} data-format="PNG" onClick={hintDownload}>
              Download PNG
            </Typography.Link>
          </Menu.Item>
          <Menu.Item icon={<FilePdfOutlined />}>
            <Typography.Link href={`/api${path}.pdf?download${params}`} data-format="PDF" onClick={hintDownload}>
              Download PDF
            </Typography.Link>
          </Menu.Item>
          <Menu.Item icon={<FileOutlined />}>
            <Typography.Link href={`/api${path}.vg?download${params}`} data-format="Vega Spec" onClick={hintDownload}>
              Download Vega Spec
            </Typography.Link>
          </Menu.Item>
        </Menu.ItemGroup>
      )}
      <Menu.ItemGroup title="Data">
        <Menu.Item icon={<FileOutlined />}>
          <Typography.Link href={`/api${path}.json?download${params}`} data-format="JSON" onClick={hintDownload}>
            Download JSON
          </Typography.Link>
        </Menu.Item>
        <Menu.Item icon={<FileExcelOutlined />}>
          <Typography.Link href={`/api${path}.csv?download${params}`} data-format="CSV" onClick={hintDownload}>
            Download CSV
          </Typography.Link>
        </Menu.Item>
        <Menu.Item icon={<FileOutlined />}>
          <Typography.Link href={`/api${path}.sql?download${params}`} data-format="SQL" onClick={hintDownload}>
            Download SQL
          </Typography.Link>
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
