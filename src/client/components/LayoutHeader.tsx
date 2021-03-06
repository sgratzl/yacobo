import { useRouterWrapper } from '@/client/hooks';
import { Layout, Menu, TreeSelect } from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import React, { memo, useCallback } from 'react';
import styles from './LayoutHeader.module.css';
import { treeData } from './RegionSelect';

export function Search() {
  const router = useRouterWrapper();
  const onSelect = useCallback(
    (s: string | null) => {
      if (s && s !== 'US') {
        router.push('/region/[region]', { region: s });
      } else if (s === 'US') {
        router.push('/', {});
      }
    },
    [router]
  );

  return (
    <TreeSelect<string>
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

export type MainEntries = 'overview' | 'compare' | 'favorites' | 'api' | 'about';

export const LayoutHeader = memo(({ mainActive }: { mainActive: MainEntries }) => {
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
        <Menu.Item key="compare">
          <Link href="/compare">Compare</Link>
        </Menu.Item>
        <Menu.Item key="favorites">
          <Link href="/favorites">Favorites</Link>
        </Menu.Item>
        <Menu.Item key="api">
          <Link href="/openapi">API</Link>
        </Menu.Item>
        <Menu.Item key="about">
          <Link href="/about">About</Link>
        </Menu.Item>
      </Menu>
      <div className={styles.span} />
      <Search />
    </Layout.Header>
  );
});
