import { fetchMinMaxDate } from '@/api/data';
import { ISerializedMinMax, useFetchMinMaxDate } from '@/client/utils';
import { formatLocal } from '@/common';
import GridColumn from '@/components/GridColumn';
import SignalSection from '@/components/SignalSection';
import { signals } from '@/model';
import { Row } from 'antd';
import { GetStaticProps } from 'next';
import BaseLayout, { DateSelect } from '../components/BaseLayout';

export default function Home(props: ISerializedMinMax) {
  const { max: date } = useFetchMinMaxDate(props);
  return (
    <BaseLayout
      pageTitle={`COVID-19${date ? ` as of ${formatLocal(date)}` : ''}`}
      mainActive="overview"
      backIcon={false}
      title="YaCoBo"
      subTitle={
        date ? (
          <>
            as of
            <DateSelect date={date} path="/history/[date]" />
          </>
        ) : undefined
      }
      breadcrumb={[]}
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

export const getStaticProps: GetStaticProps<ISerializedMinMax> = async () => {
  const data = await fetchMinMaxDate();
  return {
    props: {
      min: data.min.getTime(),
      max: data.max.getTime(),
    },
  };
};
