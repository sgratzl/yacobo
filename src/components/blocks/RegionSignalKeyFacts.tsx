import { fetcher } from '@/client/utils';
import { formatAPIDate, formatFixedValue, formatLocal, formatValue } from '@/common';
import { regionDateSummaryDates } from '@/common/helpers';
import { parseDates } from '@/common/parseDates';
import {
  IRegion,
  IRegionDateValue,
  isCountyRegion,
  ISignal,
  ISignalDateValue,
  plainLabel,
  RequiredValue,
  signals,
} from '@/model';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Spin, Statistic, Table, Tooltip } from 'antd';
import { formatDistance, isEqual, isValid, subDays } from 'date-fns';
import Link from 'next/link';
import { useCallback } from 'react';
import useSWR from 'swr';
import styles from './RegionSignalKeyFacts.module.scss';

interface IDateTableRow {
  key: number;
  date: Date | null;
  label: string;
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
  const dataSource = asDataSource(data, date, region);

  const renderDateLink = useCallback(
    (value: string, row: IDateTableRow) => {
      if (row.date) {
        return (
          <Link
            passHref
            href="/region/[region]/[signal]/[date]"
            as={`/region/${region?.id}/${signal?.id}/${formatAPIDate(row.date)}`}
          >
            <a href="a">{value}</a>
          </Link>
        );
      }
      return value;
    },
    [region, signal]
  );

  return (
    <Table<IDateTableRow>
      pagination={false}
      loading={!data}
      dataSource={dataSource}
      showHeader={!region || isCountyRegion(region)}
      size="small"
      rowKey="label"
    >
      <Table.Column<IDateTableRow> title="Date" dataIndex="label" render={renderDateLink} />
      <Table.Column<IDateTableRow>
        align="right"
        title={plainLabel(region)}
        dataIndex="value"
        render={formatFixedValue}
      />
      {!region ||
        (isCountyRegion(region) && (
          <Table.Column<IDateTableRow>
            align="right"
            title={region.state.name}
            dataIndex="state"
            render={formatFixedValue}
          />
        ))}
    </Table>
  );
}

function asDataSource(
  data?: RequiredValue<IRegionDateValue>[],
  date?: Date,
  region?: IRegion
): IDateTableRow[] | undefined {
  if (!data || !date || !region) {
    return undefined;
  }
  const lookup = new Map(data?.map((d) => [`${d.region}:${d.date.getTime()}`, d]) ?? []);
  const dates = regionDateSummaryDates(date);
  return dates.map((d) => ({
    key: d.getTime(),
    label: d === date ? formatLocal(d) : `${formatDistance(d, date, {})} ago`,
    date: d === date ? null : d,
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
    <Tooltip title={`increased compared to ${formatLocal(yesterdayDate)}`}>
      <ArrowUpOutlined />
    </Tooltip>
  ) : (
    <Tooltip title={`decreased compared to ${formatLocal(yesterdayDate)}`}>
      <ArrowDownOutlined />
    </Tooltip>
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

function fetchRegionMultiDate(key: string): Promise<RequiredValue<ISignalDateValue>[]> {
  const parse = parseDates<RequiredValue<ISignalDateValue>>(['date']);
  return fetcher(key).then((rows: RequiredValue<ISignalDateValue>[]) =>
    parse(rows).filter((d) => typeof d.value === 'number')
  );
}

function useKeyMultiFacts(region?: IRegion, date?: Date) {
  const valid = region != null && isValid(date);
  return useSWR(valid ? `/api/region/${region?.id}/date/${formatAPIDate(date)}.json` : null, fetchRegionMultiDate);
}

interface ISignalTableRow {
  label: string;
  signal: ISignal;
  value?: number;
}

function renderStats(value: number | undefined) {
  return <Statistic className={styles.smallStats} value={formatValue(value)} />;
}
function renderSignalOf(signal: ISignal) {
  return `of ${formatValue(signal.data.maxValue)}`;
}

export function KeySignalMultiFacts({ region, date }: { region?: IRegion; date?: Date }) {
  const { data } = useKeyMultiFacts(region, date);
  const bySignal = new Map(data?.map((row) => [row.signal, row]) ?? []);

  const dataSource: ISignalTableRow[] = signals.map((signal) => ({
    label: signal.name,
    signal,
    value: bySignal.get(signal.id)?.value,
  }));

  const renderSignalLink = useCallback(
    (value: string, row: ISignalTableRow) => {
      return (
        <Link
          passHref
          href="/region/[region]/[signal]/[date]"
          as={`/region/${region?.id}/${row.signal.id}/${formatAPIDate(date)}`}
        >
          <a href="a">{value}</a>
        </Link>
      );
    },
    [region, date]
  );

  return (
    <Table<ISignalTableRow> pagination={false} loading={!data} dataSource={dataSource} size="small" rowKey="label">
      <Table.Column<ISignalTableRow> title="Signal" dataIndex="label" render={renderSignalLink} />
      <Table.Column<ISignalTableRow> align="right" title="Value" dataIndex="value" render={renderStats} />
      <Table.Column<ISignalTableRow> title="Unit" dataIndex="signal" render={renderSignalOf} />
    </Table>
  );
}
