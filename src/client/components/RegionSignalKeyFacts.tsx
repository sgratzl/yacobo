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
  ITriple,
} from '@/model';
import FallOutlined from '@ant-design/icons/FallOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import { Spin, Statistic, Table, Tooltip } from 'antd';
import { formatDistance, isValid, subDays } from 'date-fns';
import { useCallback } from 'react';
import useSWR from 'swr';
import { classNames } from '../utils';
import LinkWrapper from './LinkWrapper';
import styles from './RegionSignalKeyFacts.module.css';

interface IDateTableRow {
  key: number;
  date: Date | null;
  label: string;
  value?: number;
  state?: number;
}

function useKeyFacts({ region, signal, date }: ITriple = {}) {
  const valid = region != null && signal != null && isValid(date);
  return useSWR(
    valid ? `/api/region/${region?.id}/${signal?.id}/${formatAPIDate(date)}.json?plain` : null,
    fetchRegionSignalDate
  );
}

export function RegionSignalKeyFactsTable({ region, signal, date }: ITriple) {
  const { data } = useKeyFacts({ region, signal, date });
  const dataSource = asDataSource(data, date, region);

  const renderDateLink = useCallback(
    (value: string, row: IDateTableRow) => {
      if (row.date) {
        return (
          <LinkWrapper
            passHref
            path="/region/[region]/[signal]/[date]"
            query={{ region, signal, date: row.date }}
            prefetch={false}
          >
            <a href="a">{value}</a>
          </LinkWrapper>
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
  const lookup = new Map(data?.map((d) => [`${d.region}:${formatAPIDate(d.date)}`, d]) ?? []);
  const dates = regionDateSummaryDates(date);
  return dates.map((d) => ({
    key: d.valueOf(),
    label: d === date ? formatLocal(d) : `${formatDistance(d, date, {})} ago`,
    date: d === date ? null : d,
    value: lookup.get(`${region.id}:${formatAPIDate(d)}`)?.value,
    state: lookup.get(`${isCountyRegion(region) ? region.state.id : ''}:${formatAPIDate(d)}`)?.value,
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
  const yesterdayData = data.find(
    (d) => d.region === current.region && formatAPIDate(d.date) === formatAPIDate(yesterdayDate)
  );
  if (!yesterdayData) {
    return undefined;
  }
  return current.value > yesterdayData.value ? (
    <Tooltip title={`increased compared to ${formatLocal(yesterdayDate)}`}>
      <RiseOutlined />
    </Tooltip>
  ) : (
    <Tooltip title={`decreased compared to ${formatLocal(yesterdayDate)}`}>
      <FallOutlined />
    </Tooltip>
  );
}

export function RegionSignalKeyFacts({ region, signal, date }: ITriple) {
  const { data } = useKeyFacts({ region, signal, date });

  const current =
    data && region && date
      ? data.find((d) => d.region === region.id && formatAPIDate(d.date) === formatAPIDate(date))
      : null;
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

function useKeyMultiFacts({ region, date }: { region?: IRegion; date?: Date } = {}) {
  const valid = region != null && isValid(date);
  return useSWR(
    valid ? `/api/region/${region?.id}/date/${formatAPIDate(date)}.json?plain` : null,
    fetchRegionMultiDate
  );
}

interface ISignalTableRow {
  label: string;
  signal: ISignal;
  value?: number;
}

function renderSignalOf(signal: ISignal) {
  return `of ${formatValue(signal.data.maxValue)}`;
}
const renderValue = (value: number | null) => {
  return <span>{value == null ? '?' : formatFixedValue(value)}</span>;
};

export function KeySignalMultiFacts({ region, date, signal }: ITriple) {
  const { data } = useKeyMultiFacts({ region, date });
  const bySignal = new Map(data?.map((row) => [row.signal, row]) ?? []);

  const dataSource: ISignalTableRow[] = signals.map((signal) => ({
    label: signal.name,
    signal,
    value: bySignal.get(signal.id)?.value,
  }));

  const renderSignalLink = useCallback(
    (value: string, row: ISignalTableRow) => {
      return (
        <LinkWrapper
          passHref
          path="/region/[region]/[signal]/[date]"
          query={{ region, signal: row.signal, date }}
          prefetch={false}
        >
          <a href="a" className={classNames(signal?.id === row.signal.id && styles.highlight)}>
            {value}
          </a>
        </LinkWrapper>
      );
    },
    [region, date, signal]
  );

  return (
    <Table<ISignalTableRow> pagination={false} loading={!data} dataSource={dataSource} size="small" rowKey="label">
      <Table.Column<ISignalTableRow> title="Signal" dataIndex="label" render={renderSignalLink} />
      <Table.Column<ISignalTableRow> align="right" title="Value" dataIndex="value" render={renderValue} />
      <Table.Column<ISignalTableRow> title="Unit" dataIndex="signal" render={renderSignalOf} />
    </Table>
  );
}
