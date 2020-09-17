import { formatAPIDate } from '@/common';
import { UpCircleOutlined } from '@ant-design/icons';
import { BackTop, Layout, Menu, Select, TreeSelect } from 'antd';
import { BreadcrumbProps } from 'antd/lib/breadcrumb';
import PageHeader, { PageHeaderProps } from 'antd/lib/page-header';
import Head from 'next/head';
import Link from 'next/link';
import { NextRouter, useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { IRegion, ISignal, signals, states } from '../../model';
import styles from './BaseLayout.module.scss';
import DatePicker from './DatePicker';

export interface BaseLayoutProps {
  pageTitle: string;
  description?: string;
  previewImage?: { url: string; width: number; height: number };
  mainActive: 'overview' | 'region' | 'compare' | 'favorites';
  breadcrumb: { breadcrumbName: string; path: string }[];
}

function injectQuery(router: NextRouter, path: string, extras: Record<string, string> = {}) {
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
  const back = useCallback(() => router.back(), [router]);
  return (
    <Layout className={styles.layout}>
      <Head>
        <title>YaCoBo - Yet another COVID-19 board - {pageTitle}</title>
        <meta key="description" name="description" content="YaCoBo - Yet another COVID-19 board" />
        <meta name="author" content="Samuel Gratzl" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-title" content="YaCoBo" />
        <meta name="application-name" content="YaCoBo" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        {/** generate social media tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:site_name" content="YaCoBo" />
        <meta property="og:description" content={description} />
        {previewImage && (
          <>
            <meta property="og:image:width" content={previewImage.width.toString()} />
            <meta property="og:image:height" content={previewImage.height.toString()} />
            <meta property="og:url" content={`${BASE_URL}${previewImage.url}`} />
            <meta property="og:image" content="https://lineup.js.org/app/preview.png" />
          </>
        )}

        {/* <!-- Twitter Card data --> */}
        <meta name="twitter:card" content="summary_large_image" />
        {/* <meta name="twitter:site" content="@caleydo_org"/> */}
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={description} />
        {/* <meta name="twitter:creator" content="@caleydo_org"/> */}
        {previewImage && <meta name="twitter:image:src" content={`${BASE_URL}${previewImage.url}`} />}
      </Head>
      <Layout.Header>
        <div className={styles.logo}>YaCoBo</div>
        <Menu theme="dark" mode="horizontal" activeKey={mainActive}>
          <Menu.Item key="overview" active={mainActive === 'overview'}>
            <Link href="/">Overview</Link>
          </Menu.Item>
          <Menu.Item key="favorites" active={mainActive === 'favorites'}>
            <Link href="/favorites">Favorites</Link>
          </Menu.Item>
          <Menu.Item key="region" active={mainActive === 'region'}>
            <Link href="/region">Single Region</Link>
          </Menu.Item>
          {/* <Menu.Item key="compare" active={mainActive === 'compare'}>
            <Link href="/compare">Compare Counties</Link>
          </Menu.Item> */}
        </Menu>
      </Layout.Header>
      <Layout.Content className={styles.content}>
        <PageHeader onBack={back} breadcrumb={createBreadcrumbProps(router, breadcrumb)} {...pageHeader}>
          {children}
          <BackTop className={styles.backTop}>
            <UpCircleOutlined />
          </BackTop>
        </PageHeader>
      </Layout.Content>
      <Layout.Footer>Samuel Gratzl ©2020</Layout.Footer>
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

export function SignalSelect({ signal, path, clearPath }: { signal?: ISignal; path: string; clearPath?: string }) {
  const router = useRouter();
  const onSelect = useCallback(
    (s: string | null) => {
      if (s) {
        router.push(path, injectQuery(router, path, { signal: s }));
      } else if (clearPath) {
        router.push(clearPath, injectQuery(router, clearPath));
      }
    },
    [router, path, clearPath]
  );

  return (
    <Select className={styles.select} value={signal?.id} onChange={onSelect} allowClear={clearPath != null}>
      {signals.map((s) => (
        <Select.Option key={s.id} value={s.id}>
          {s.name}
        </Select.Option>
      ))}
    </Select>
  );
}

export function RegionSelect({ region, path, clearPath }: { region?: IRegion; path: string; clearPath?: string }) {
  const router = useRouter();
  const onSelect = useCallback(
    (s: string | null) => {
      if (s) {
        router.push(path, injectQuery(router, path, { region: s }));
      } else if (clearPath) {
        router.push(clearPath, injectQuery(router, clearPath));
      }
    },
    [router, path, clearPath]
  );

  const treeData = useMemo(
    () =>
      states.map((state) => ({
        key: state.id,
        label: state.name,
        value: state.id,
        children: state.counties.map((county) => ({ key: county.id, label: county.name, value: county.id })),
      })),
    []
  );

  return (
    <TreeSelect
      className={`${styles.select} ${styles.selectTree}`}
      value={region?.id}
      onChange={onSelect}
      allowClear={clearPath != null}
      showSearch
      treeData={treeData}
      dropdownMatchSelectWidth={300}
    ></TreeSelect>
  );
}

export function DateSelect({ date, path, clearPath }: { date?: Date; path: string; clearPath?: string }) {
  const router = useRouter();
  const onSelect = useCallback(
    (s: Date | null) => {
      if (s) {
        router.push(path, injectQuery(router, path, { date: formatAPIDate(s) }));
      } else if (clearPath) {
        router.push(clearPath, injectQuery(router, clearPath));
      }
    },
    [router, path, clearPath]
  );
  return (
    <DatePicker
      className={styles.picker}
      value={date}
      onChange={onSelect}
      allowClear={clearPath != null}
      format="MMM, d"
    />
  );
}
