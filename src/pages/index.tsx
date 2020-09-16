import { formatLocal } from '@/common';
import GridColumn from '@/components/GridColumn';
import SignalSection from '@/components/SignalSection';
import { signals } from '@/model';
import { Row } from 'antd';
import { useFetchMinMaxDate } from '../client/utils';
import BaseLayout, { DateSelect } from '../components/BaseLayout';

export default function Home() {
  const { max: date } = useFetchMinMaxDate();
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
