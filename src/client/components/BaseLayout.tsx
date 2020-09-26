import UpCircleOutlined from '@ant-design/icons/UpCircleOutlined';
import { BackTop, Layout, PageHeader } from 'antd';
import type { BreadcrumbProps } from 'antd/lib/breadcrumb';
import type { PageHeaderProps } from 'antd/lib/page-header';
import Head from 'next/head';
import type { IRouterQuery } from '../hooks';
import styles from './BaseLayout.module.css';
import FooterLayout from './LayoutFooter';
import { LayoutHeader, MainEntries } from './LayoutHeader';
import LinkWrapper from './LinkWrapper';

export interface BaseLayoutProps {
  pageTitle: string;
  description?: string;
  previewImage?: string;
  mainActive: MainEntries;
  breadcrumb: { breadcrumbName: string; path: string; query?: IRouterQuery }[];
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? '';

export default function BaseLayout({
  children,
  pageTitle,
  previewImage,
  description,
  mainActive,
  breadcrumb,
  ...pageHeader
}: React.PropsWithChildren<BaseLayoutProps & Omit<PageHeaderProps, 'breadcrumb'>>) {
  return (
    <Layout className={styles.layout}>
      <LayoutHeader mainActive={mainActive} />
      <Layout.Content className={styles.content}>
        <Head>
          <title>YaCoBo - {pageTitle}</title>
          <meta name="description" content={description} />
          {/** generate social media tags */}
          <meta key="og:site_name" property="og:title" content={`YaCoBo - Yet another COVID-19 board - ${pageTitle}`} />
          <meta key="og:description" property="og:description" content={description} />
          <meta key="og:url" property="og:url" content={BASE_URL} />
          {previewImage && <meta key="og:image" property="og:image" content={`${BASE_URL}${previewImage}`} />}
          {/* <meta name="twitter:site" content="@caleydo_org"/> */}
          <meta name="twitter:title" content={`YaCoBo - Yet another COVID-19 board - ${pageTitle}`} />
          <meta name="twitter:description" content={description} />
          {/* <meta name="twitter:creator" content="@caleydo_org"/> */}
          {previewImage && <meta name="twitter:image:src" content={`${BASE_URL}${previewImage}`} />}
        </Head>
        <PageHeader className={styles.header} breadcrumb={createBreadcrumbProps(breadcrumb)} {...pageHeader}>
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

const breadcrumbRender: BreadcrumbProps['itemRender'] = (
  route: { breadcrumbName: string; path: string; query?: IRouterQuery },
  _params,
  routes
) => {
  const isLastItem = routes.indexOf(route) === routes.length - 1;
  if (isLastItem) {
    return <span>{route.breadcrumbName}</span>;
  }
  return (
    <LinkWrapper path={route.path} query={route.query ?? {}}>
      {route.breadcrumbName}
    </LinkWrapper>
  );
};

function createBreadcrumbProps(
  routes: { breadcrumbName: string; path: string; query?: IRouterQuery }[]
): BreadcrumbProps {
  return {
    itemRender: breadcrumbRender,
    routes: [
      {
        breadcrumbName: 'Home',
        path: '/',
      },
      ...routes,
    ],
  };
}
