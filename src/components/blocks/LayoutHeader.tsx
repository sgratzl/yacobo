import { Layout, Menu, TreeSelect } from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { memo, useCallback } from 'react';
import styles from './LayoutHeader.module.css';
import { treeData } from './RegionSelect';

export function Search() {
  const router = useRouter();
  const onSelect = useCallback(
    (s: string | null) => {
      if (s && s !== 'US') {
        router.push('/region/[region]', `/region/${s}`);
      } else if (s === 'US') {
        router.push('/', '/');
      }
    },
    [router]
  );

  return (
    <TreeSelect
      size="large"
      className={styles.search}
      onChange={onSelect}
      allowClear
      showSearch
      value={undefined}
      treeData={treeData}
      placeholder="Search for Region"
      treeDefaultExpandedKeys={['US']}
      treeNodeFilterProp="label"
      dropdownMatchSelectWidth={300}
    ></TreeSelect>
  );
}

export const LayoutHeader = memo(({ mainActive }: { mainActive: 'overview' | 'compare' | 'favorites' | 'api' }) => {
  return (
    <Layout.Header className={styles.topHeader}>
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
        <Menu.Item key="api">
          <Link href="/api">API</Link>
        </Menu.Item>
      </Menu>
      <div className={styles.span} />
      <Search />
    </Layout.Header>
  );
});
