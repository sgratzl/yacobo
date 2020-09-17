import { Table } from 'antd';
import type { SortOrder } from 'antd/lib/table/interface';
import { parseJSON, isValid } from 'date-fns';
import Link from 'next/link';
import { useCallback } from 'react';
import useSWR from 'swr';
import { IRegionWithDetailsValue, IDateValue, IRegion, ISignal } from '../../model';
import { formatAPIDate } from '../../common';

// export type ISignalMultiRow = { region: string } & Record<string, string | number | undefined | null>;

function compare<T>(a?: T | null, b?: T | null, sortOrder?: SortOrder) {
  if (a === b) {
    return 0;
  }
  if (a == null) {
    return sortOrder === 'ascend' ? 1 : -1;
  }
  if (b == null) {
    return sortOrder === 'ascend' ? -1 : 1;
  }
  return a < b ? -1 : +1;
}

function compareName(a: IRegionWithDetailsValue, b: IRegionWithDetailsValue, sortOrder?: SortOrder) {
  return compare(a.regionName, b.regionName, sortOrder);
}
function compareState(a: IRegionWithDetailsValue, b: IRegionWithDetailsValue, sortOrder?: SortOrder) {
  return compare(a.regionState, b.regionState, sortOrder);
}
function compareValue(a: IRegionWithDetailsValue, b: IRegionWithDetailsValue, sortOrder?: SortOrder) {
  return compare(a.value, b.value, sortOrder);
}
function compareStdErr(a: IRegionWithDetailsValue, b: IRegionWithDetailsValue, sortOrder?: SortOrder) {
  return compare(a.stderr, b.stderr, sortOrder);
}
function compareDate(a: IDateValue, b: IDateValue, sortOrder?: SortOrder) {
  return compare(a.date, b.date, sortOrder);
}

const renderValue = (value: number | null) => {
  return (
    <span>
      {value == null
        ? 'Missing'
        : value.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
    </span>
  );
};

const renderStdErr = (value: number | null) => {
  return <span>{value == null ? 'Missing' : value.toFixed(2)}</span>;
};

// export const columns: ColumnsType<ISignalMultiRow> = [
//   {
//     title: 'Region',
//     dataIndex: 'region',
//     sorter: (a: ISignalMultiRow, b: ISignalMultiRow) => a.region.length - b.region.length,
//     sortDirections: ['descend', 'ascend'],
//   },
//   ...signals.map((signal) => ({
//     title: signal.name,
//     dataIndex: signal.id,
//     defaultSortOrder: 'descend' as const,
//     sorter: (a: ISignalMultiRow, b: ISignalMultiRow) => compare(a[signal.id] as number, b[signal.id] as number),
//   })),
// ];

function fetchFilter(key: string) {
  return fetch(key)
    .then((r) => r.json())
    .then((r: IRegionWithDetailsValue[]) => r.filter((d) => !d.region.endsWith('000')).sort(compareValue));
}

export default function SignalTable({ signal, date }: { signal: ISignal; date?: Date }) {
  const apiDate = formatAPIDate(date);
  const validDate = isValid(date);

  const { data } = useSWR<IRegionWithDetailsValue[]>(
    validDate ? `/api/signal/${signal.id}/${apiDate}.json?details` : null,
    fetchFilter,
    {}
  );

  const renderRegion = useCallback(
    (value: string, row: IRegionWithDetailsValue) => {
      return (
        <Link href="/region/[region]/[signal]/[date]" as={`/region/${row.region}/${signal.id}/${apiDate}`} passHref>
          <a href="a">{value}</a>
        </Link>
      );
    },
    [signal, apiDate]
  );
  const renderState = useCallback(
    (value: string) => {
      return (
        <Link href="/region/[region]/[signal]/[date]" as={`/region/${value}/${signal.id}/${apiDate}`} passHref>
          <a href="a">{value}</a>
        </Link>
      );
    },
    [signal, apiDate]
  );

  return (
    <Table<IRegionWithDetailsValue> dataSource={data} loading={!data} rowKey="region">
      <Table.Column<IRegionWithDetailsValue> title="FIPS" dataIndex="region" />
      <Table.Column<IRegionWithDetailsValue>
        title="County"
        dataIndex="regionName"
        render={renderRegion}
        sorter={compareName}
        sortDirections={['ascend', 'descend']}
      />
      <Table.Column<IRegionWithDetailsValue>
        title="State"
        dataIndex="regionState"
        render={renderState}
        sorter={compareState}
        sortDirections={['ascend', 'descend']}
      />
      <Table.Column<IRegionWithDetailsValue>
        title={signal.name}
        dataIndex="value"
        render={renderValue}
        align="right"
        defaultSortOrder="descend"
        sorter={compareValue}
        sortDirections={['descend', 'ascend']}
      />
      {signal.data.hasStdErr && (
        <Table.Column<IRegionWithDetailsValue>
          title="Standard Error"
          dataIndex="stderr"
          align="right"
          render={renderStdErr}
          sorter={compareStdErr}
          sortDirections={['descend', 'ascend']}
        />
      )}
    </Table>
  );
}

function fetchDated(key: string) {
  return fetch(key)
    .then((r) => r.json())
    .then((r: IDateValue[]) =>
      r
        .map((r) => {
          r.date = parseJSON(r.date);
          return r;
        })
        .sort(compareDate)
    );
}

export function DateTable({ signal, region }: { signal?: ISignal; region?: IRegion }) {
  const { data } = useSWR<IDateValue[]>(
    signal && region ? `/api/region/${region.id}/${signal.id}.json?details` : null,
    fetchDated
  );

  const renderDate = useCallback(
    (value: Date) => {
      return (
        <Link
          href="/region/[region]/[signal]/[date]"
          as={`/region/${region!.id}/${signal!.id}/${formatAPIDate(value)}`}
          passHref
        >
          <a href="a">{formatAPIDate(value)}</a>
        </Link>
      );
    },
    [signal, region]
  );

  return (
    <Table<IDateValue> dataSource={data} loading={!data} rowKey="date">
      <Table.Column<IDateValue>
        title="Date"
        dataIndex="date"
        render={renderDate}
        sorter={compareDate}
        defaultSortOrder="descend"
        sortDirections={['ascend', 'descend']}
      />
      <Table.Column<IRegionWithDetailsValue>
        title={signal?.name ?? 'Signal'}
        dataIndex="value"
        render={renderValue}
        align="right"
        sorter={compareValue}
        sortDirections={['descend', 'ascend']}
      />
      {signal?.data.hasStdErr && (
        <Table.Column<IRegionWithDetailsValue>
          title="Standard Error"
          dataIndex="stderr"
          align="right"
          render={renderStdErr}
          sorter={compareStdErr}
          sortDirections={['descend', 'ascend']}
        />
      )}
    </Table>
  );
}
