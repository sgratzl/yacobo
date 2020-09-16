import BaseLayout, { DateSelect } from '@/components/BaseLayout';
import SignalSection from '@/components/SignalSection';
import { signals } from '@/model/signals';
import { formatAPIDate, formatLocal } from '@/common';
import { Row } from 'antd';
import GridColumn from '@/components/GridColumn';
import { parseISO } from 'date-fns/esm';
import { GetStaticPaths, GetStaticProps } from 'next';
import { fetchMinMaxDate } from '@/api/data';
import { estimateDateToPreRender } from '@/api/model';
import { useRouter } from 'next/router';

export default function History({ queryDate }: { queryDate?: string }) {
  const router = useRouter();
  const date = router.isFallback || !queryDate ? undefined : parseISO(queryDate!);

  return (
    <BaseLayout
      pageTitle={`COVID as of ${formatLocal(date)}`}
      mainActive="overview"
      title="COVID"
      subTitle={
        <>
          as of
          <DateSelect date={date} path="/history/[date]" />
        </>
      }
      breadcrumb={[
        {
          breadcrumbName: formatAPIDate(date),
          path: `/history/[date]`,
        },
      ]}
    >
      <Row>
        {signals.map((s) => (
          <GridColumn key={s.id}>
            <SignalSection signal={s} date={date} />
          </GridColumn>
        ))}
      </Row>
    </BaseLayout>
  );
}

export const getStaticProps: GetStaticProps<{ queryDate: string }> = async (context) => {
  return {
    props: {
      queryDate: context.params!.date as string,
    },
  };
};

export const getStaticPaths: GetStaticPaths<{ date: string }> = async () => {
  const { max } = await fetchMinMaxDate();
  const datesToRender = estimateDateToPreRender(max);
  return {
    paths: datesToRender.map((date) => ({
      params: {
        date: formatAPIDate(date),
      },
    })),
    fallback: true,
  };
};
