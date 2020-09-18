import { Layout, Menu } from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { memo } from 'react';
import styles from './BaseLayout.module.scss';

export const LayoutHeader = memo(({ mainActive }: { mainActive: string }) => {
  return (
    <Layout.Header>
      <Head>
        <meta name="author" content="Samuel Gratzl" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-title" content="YaCoBo" />
        <meta name="application-name" content="YaCoBo" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        {/** generate social media tags */}
        <meta key="og:site_name" property="og:site_name" content="YaCoBo" />
        {/* <!-- Twitter Card data --> */}
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Link href="/" passHref>
        <a href="/" className={styles.logo}>
          YaCoBo
        </a>
      </Link>
      <Menu theme="dark" mode="horizontal" selectedKeys={[mainActive]}>
        <Menu.Item key="overview">
          <Link href="/">Overview</Link>
        </Menu.Item>
        <Menu.Item key="favorites">
          <Link href="/favorites">Favorites</Link>
        </Menu.Item>
      </Menu>
    </Layout.Header>
  );
});
