import { fetcher } from '@/client/utils';
import { formatAPIDate, formatFixedValue, formatLocal, formatValue } from '@/common';
import { regionDateSummaryDates } from '@/common/helpers';
import { parseDates } from '@/common/parseDates';
import { IRegion, IRegionDateValue, isCountyRegion, ISignal, RequiredValue } from '@/model';
import { Statistic, Table, Spin } from 'antd';
import { formatDistance, isEqual, isValid } from 'date-fns';
import { subDays } from 'date-fns';
import useSWR from 'swr';
import styles from './RegionSignalKeyFacts.module.scss';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface ITableRow {
  key: number;
  date: string;
  value?: number;
  state?: number;
}

function useKeyFacts(region?: IRegion, signal?: ISignal, date?: Date) {
  const valid = region != null && signal != null && isValid(date);
  return useSWR(
    valid ? `/api/region/${region?.id}/${signal?.id}/${formatAPIDate(date)}.json` : null,
    fetchRegionSignalDate
  );
}

export function RegionSignalKeyFactsTable({
  region,
  signal,
  date,
}: {
  region?: IRegion;
  signal?: ISignal;
  date?: Date;
}) {
  const { data } = useKeyFacts(region, signal, date);
  const dataSource: ITableRow[] = asDataSource(data, date, region);

  return (
    <Table<ITableRow>
      pagination={false}
      loading={!data}
      dataSource={dataSource}
      showHeader={!region || isCountyRegion(region)}
      size="small"
    >
      <Table.Column<ITableRow> title="Date" dataIndex="date" />
      <Table.Column<ITableRow> align="right" title={region?.name} dataIndex="value" render={formatFixedValue} />
      {!region ||
        (isCountyRegion(region) && (
          <Table.Column<ITableRow>
            align="right"
            title={region.state.name}
            dataIndex="state"
            render={formatFixedValue}
          />
        ))}
    </Table>
  );
}

function asDataSource(data?: RequiredValue<IRegionDateValue>[], date?: Date, region?: IRegion): ITableRow[] {
  if (!data || !date || !region) {
    return [];
  }
  const lookup = new Map(data?.map((d) => [`${d.region}:${d.date.getTime()}`, d]) ?? []);
  const dates = regionDateSummaryDates(date);
  return dates.map((d) => ({
    key: d.getTime(),
    date: d === date ? formatLocal(d) : `${formatDistance(d, date, {})} ago`,
    value: lookup.get(`${region.id}:${d.getTime()}`)?.value,
    state: lookup.get(`${isCountyRegion(region) ? region.state.id : ''}:${d.getTime()}`)?.value,
  }));
}

function renderSpin() {
  return <Spin />;
}

function resolveTrend(current?: RequiredValue<IRegionDateValue> | null, data?: RequiredValue<IRegionDateValue>[]) {
  if (!current || !data) {
    return undefined;
  }
  const yesterdayDate = subDays(current.date, 1);
  const yesterdayData = data.find((d) => d.region === current.region && isEqual(d.date, yesterdayDate));
  if (!yesterdayData) {
    return undefined;
  }
  return current.value > yesterdayData.value ? (
    <ArrowUpOutlined title={`increased compared to ${formatLocal(yesterdayDate)}`} />
  ) : (
    <ArrowDownOutlined title={`decreased compared to ${formatLocal(yesterdayDate)}`} />
  );
}

export function RegionSignalKeyFacts({ region, signal, date }: { region?: IRegion; signal?: ISignal; date?: Date }) {
  const { data } = useKeyFacts(region, signal, date);

  const current = data && region && date ? data.find((d) => d.region === region.id && isEqual(d.date, date)) : null;
  const prefix = resolveTrend(current, data);

  return (
    <div className={styles.root}>
      <Statistic
        className={styles.stats}
        prefix={prefix}
        value={formatValue(current?.value)}
        valueRender={!data ? renderSpin : undefined}
        suffix={`of ${formatValue(signal?.data.maxValue ?? 100)} ${signal?.data.unit ?? 'people'}`}
      />
    </div>
  );
}

function fetchRegionSignalDate(key: string): Promise<RequiredValue<IRegionDateValue>[]> {
  const parse = parseDates<RequiredValue<IRegionDateValue>>(['date']);
  return fetcher(key).then((rows: RequiredValue<IRegionDateValue>[]) =>
    parse(rows).filter((d) => typeof d.value === 'number')
  );
}