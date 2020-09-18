import { UpCircleOutlined } from '@ant-design/icons';
import { BackTop, Layout, PageHeader } from 'antd';
import type { BreadcrumbProps } from 'antd/lib/breadcrumb';
import type { PageHeaderProps } from 'antd/lib/page-header';
import Head from 'next/head';
import Link from 'next/link';
import { NextRouter, useRouter } from 'next/router';
import { useCallback } from 'react';
import styles from './BaseLayout.module.css';
import FooterLayout from './LayoutFooter';
import { LayoutHeader } from './LayoutHeader';

export interface BaseLayoutProps {
  pageTitle: string;
  description?: string;
  previewImage?: { url: string; width: number; height: number };
  mainActive: 'overview' | 'compare' | 'favorites';
  breadcrumb: { breadcrumbName: string; path: string }[];
}

export function injectQuery(router: NextRouter, path: string, extras: Record<string, string> = {}) {
  return path.replace(/\[(\w+)\]/gm, (_, key) => {
    return extras[key] ?? router.query[key] ?? key;
  });
}

const BASE_URL = process.env.VERCEL_URL ?? '';

export default function BaseLayout({
  children,
  pageTitle,
  previewImage,
  description,
  mainActive,
  breadcrumb,
  ...pageHeader
}: React.PropsWithChildren<BaseLayoutProps & Omit<PageHeaderProps, 'breadcrumb'>>) {
  const router = useRouter();
  return (
    <Layout className={styles.layout}>
      <LayoutHeader mainActive={mainActive} />
      <Layout.Content className={styles.content}>
        <Head>
          <title>YaCoBo - Yet another COVID-19 board - {pageTitle}</title>
          <meta name="description" content={description} />
          {/** generate social media tags */}
          <meta key="og:site_name" property="og:title" content={pageTitle} />
          <meta key="og:description" property="og:description" content={description} />
          {previewImage && (
            <>
              <meta key="og:image:width" property="og:image:width" content={previewImage.width.toString()} />
              <meta key="og:image:height" property="og:image:height" content={previewImage.height.toString()} />
              <meta key="og:url" property="og:url" content={BASE_URL} />
              <meta key="og:image" property="og:image" content={`${BASE_URL}${previewImage.url}`} />
            </>
          )}
          {/* <meta name="twitter:site" content="@caleydo_org"/> */}
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={description} />
          {/* <meta name="twitter:creator" content="@caleydo_org"/> */}
          {previewImage && <meta name="twitter:image:src" content={`${BASE_URL}${previewImage.url}`} />}
        </Head>
        <PageHeader className={styles.header} breadcrumb={createBreadcrumbProps(router, breadcrumb)} {...pageHeader}>
          {children}
          <BackTop className={styles.backTop}>
            <UpCircleOutlined />
          </BackTop>
        </PageHeader>
      </Layout.Content>
      <FooterLayout />
    </Layout>
  );
}

const breadcrumbRender: BreadcrumbProps['itemRender'] = (route, _params, routes) => {
  const isLastItem = routes.indexOf(route) === routes.length - 1;
  if (isLastItem) {
    return <span>{route.breadcrumbName}</span>;
  }
  if (route.path.includes(':')) {
    const [href, as] = route.path.split(':');
    return (
      <Link href={href} as={as}>
        {route.breadcrumbName}
      </Link>
    );
  }
  return <Link href={route.path}>{route.breadcrumbName}</Link>;
};

function createBreadcrumbProps(
  router: NextRouter,
  routes: { breadcrumbName: string; path: string }[]
): BreadcrumbProps {
  return {
    itemRender: breadcrumbRender,
    routes: [
      {
        breadcrumbName: 'Home',
        path: '/',
      },
      ...routes.map((r) => ({ ...r, path: `${r.path}:${injectQuery(router, r.path)}` })),
    ],
  };
}
