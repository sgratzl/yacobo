import Head from 'next/head';
import styles from './BaseLayout.module.scss';
import Link from 'next/link';
import { Layout, Menu, Breadcrumb, BackTop } from 'antd';
import { UpCircleOutlined } from '@ant-design/icons';

export interface BaseLayoutProps {
  title: string;
  mainActive: 'overview' | 'single' | 'compare';
}

export default function BaseLayout({ children, title, mainActive }: React.PropsWithChildren<BaseLayoutProps>) {
  return (
    <Layout className={styles.layout}>
      <Head>
        <title>{title}</title>
      </Head>
      <Layout.Header>
        <div className={styles.logo}>COVIDCast-Lite</div>
        <Menu theme="dark" mode="horizontal" activeKey={mainActive}>
          <Menu.Item key="overview">
            <Link href="/">US</Link>
          </Menu.Item>
          <Menu.Item key="single">
            <Link href="/signal">County</Link>
          </Menu.Item>
          <Menu.Item key="compare">
            C<Link href="/compare">Compare Counties</Link>
          </Menu.Item>
        </Menu>
      </Layout.Header>
      <Layout.Content className={styles.content}>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/">Home</Link>
          </Breadcrumb.Item>
          {/* TODO */}
        </Breadcrumb>
        <main className={styles.main}>{children}</main>
        <BackTop className={styles.backTop}>
          <UpCircleOutlined />
        </BackTop>
      </Layout.Content>
      <Layout.Footer>Samuel Gratzl ©2020</Layout.Footer>
    </Layout>
  );
}
