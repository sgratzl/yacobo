import Head from 'next/head';
import styles from './BaseLayout.module.scss';
import Link from 'next/link';
import { Layout, Menu, Breadcrumb, BackTop, Typography } from 'antd';
import { UpCircleOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

export interface BaseLayoutProps {
  title: string;
  mainActive: 'overview' | 'county' | 'compare';
  breadcrumbs: ReactNode[];
}

export default function BaseLayout({
  children,
  title,
  mainActive,
  breadcrumbs,
}: React.PropsWithChildren<BaseLayoutProps>) {
  return (
    <Layout className={styles.layout}>
      <Head>
        <title>COVIDCast-Lite - {title}</title>
      </Head>
      <Layout.Header>
        <div className={styles.logo}></div>
        <Menu theme="dark" mode="horizontal" activeKey={mainActive}>
          <Menu.Item key="overview">
            <Link href="/">COVIDCast-Lite</Link>
          </Menu.Item>
          <Menu.Item key="county">
            <Link href="/county">Single County</Link>
          </Menu.Item>
          <Menu.Item key="compare">
            <Link href="/compare">Compare Counties</Link>
          </Menu.Item>
        </Menu>
      </Layout.Header>
      <Layout.Content className={styles.content}>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/">Home</Link>
          </Breadcrumb.Item>
          {breadcrumbs.map((l, i) => (
            <Breadcrumb.Item key={i}>{l}</Breadcrumb.Item>
          ))}
        </Breadcrumb>
        <Typography.Title>{title}</Typography.Title>
        <main className={styles.main}>{children}</main>
        <BackTop className={styles.backTop}>
          <UpCircleOutlined />
        </BackTop>
      </Layout.Content>
      <Layout.Footer>Samuel Gratzl ©2020</Layout.Footer>
    </Layout>
  );
}
