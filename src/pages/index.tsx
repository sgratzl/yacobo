import { max, parseJSON } from 'date-fns';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import SignalSection from '../components/SignalSection';
import { fetchMeta } from '../data';
import { signals } from '../data/constants';
import styles from './index.module.scss';
import { Layout, Menu, Breadcrumb } from 'antd';

export default function Home({ dateString }: { dateString: string }) {
  const date = parseJSON(dateString);
  return (
    <Layout className="layout">
      <Head>
        <title>My COVIDcast</title>
      </Head>
      <Layout.Header>
        <h1>My COVIDCast</h1>
        <Menu mode="horizontal" defaultSelectedKeys={['2']}>
          <Menu.Item key="1">nav 1</Menu.Item>
          <Menu.Item key="2">nav 2</Menu.Item>
          <Menu.Item key="3">nav 3</Menu.Item>
        </Menu>
      </Layout.Header>
      <Layout.Content style={{ padding: '0 50px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>List</Breadcrumb.Item>
          <Breadcrumb.Item>App</Breadcrumb.Item>
        </Breadcrumb>
        <main>
          {signals.map((s) => (
            <SignalSection key={s.id} signal={s} date={date} />
          ))}
        </main>
      </Layout.Content>
      <Layout.Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Layout.Footer>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // Get external data from the file system, API, DB, etc.
  const data = await fetchMeta();

  const maxDate = max(data.map((d) => d.meta.maxTime));
  // The value of the `props` key will be
  //  passed to the `Home` component
  return {
    props: {
      dateString: maxDate.getTime(),
    },
  };
};
