import CopyrightOutlined from '@ant-design/icons/CopyrightOutlined';
import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';
import GithubOutlined from '@ant-design/icons/GithubOutlined';
import HeartOutlined from '@ant-design/icons/HeartOutlined';

import { Layout, Typography } from 'antd';
import styles from './LayoutFooter.module.css';

export default function LayoutFooter() {
  return (
    <Layout.Footer className={styles.footer}>
      <div>
        Made with <HeartOutlined />
        {' by '}
        <Typography.Link href="https://www.sgratzl.com" target="_blank" rel="noopener noreferrer">
          Samuel Gratzl
        </Typography.Link>
      </div>
      <div>
        <DatabaseOutlined />
        {` Data from `}
        <Typography.Link href="https://covidcast.cmu.edu" target="_blank" rel="noopener noreferrer">
          COVIDCast by DELPHI group
        </Typography.Link>
        {' their '}
        <Typography.Link
          href="there https://covidcast.cmu.edu/terms-of-use.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Use
        </Typography.Link>
        {' apply'}
      </div>
      <div>
        <CopyrightOutlined /> Samuel Gratzl, 2020;{' '}
        <Typography.Link
          href="https://github.com/sgratzl/yacobo/blob/master/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
        >
          MIT License
        </Typography.Link>
        {`; v${process.env.NEXT_PUBLIC_VERSION} `}
        <Typography.Link href="https://github.com/sgratzl/yacobo" target="_blank" rel="noopener noreferrer">
          <GithubOutlined />
        </Typography.Link>
      </div>
    </Layout.Footer>
  );
}
