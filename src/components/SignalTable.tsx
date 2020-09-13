import { Table } from 'antd';
import type { SortOrder } from 'antd/lib/table/interface';
import { isValid } from 'date-fns';
import Link from 'next/link';
import { useCallback } from 'react';
import useSWR from 'swr';
import { ICountyWithDetailsValue } from '../data';
import { ISignal } from '../data/constants';
import { formatISODate } from '../ui/utils';

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

function compareName(a: ICountyWithDetailsValue, b: ICountyWithDetailsValue, sortOrder?: SortOrder) {
  return compare(a.regionName, b.regionName, sortOrder);
}
function compareState(a: ICountyWithDetailsValue, b: ICountyWithDetailsValue, sortOrder?: SortOrder) {
  return compare(a.regionState, b.regionState, sortOrder);
}
function compareValue(a: ICountyWithDetailsValue, b: ICountyWithDetailsValue, sortOrder?: SortOrder) {
  return compare(a.value, b.value, sortOrder);
}
function compareStdErr(a: ICountyWithDetailsValue, b: ICountyWithDetailsValue, sortOrder?: SortOrder) {
  return compare(a.stderr, b.stderr, sortOrder);
}

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
    .then((r: ICountyWithDetailsValue[]) => r.filter((d) => !d.region.endsWith('000')).sort(compareValue));
}

export default function SignalTable({ signal, date }: { signal: ISignal; date?: Date }) {
  const apiDate = formatISODate(date);
  const validDate = isValid(date);

  const { data } = useSWR<ICountyWithDetailsValue[]>(
    validDate ? `/api/signal/${signal.id}/${apiDate}.json?details` : null,
    fetchFilter,
    {}
  );

  const renderRegion = useCallback(
    (value: string, row: ICountyWithDetailsValue) => {
      return (
        <Link href="/region/[region]/[signal]/[date]" as={`/region/${row.region}/${signal.id}/${apiDate}`} passHref>
          <a>{value}</a>
        </Link>
      );
    },
    [signal, apiDate]
  );
  const renderState = useCallback(
    (value: string) => {
      return (
        <Link href="/region/[region]/[signal]/[date]" as={`/region/${value}/${signal.id}/${apiDate}`} passHref>
          <a>{value}</a>
        </Link>
      );
    },
    [signal, apiDate]
  );
  const renderValue = useCallback((value: number | null) => {
    return (
      <span>
        {value == null
          ? 'Missing'
          : value.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
      </span>
    );
  }, []);
  const renderStdErr = useCallback((value: number | null) => {
    return <span>{value == null ? 'Missing' : value.toFixed(2)}</span>;
  }, []);

  return (
    <Table<ICountyWithDetailsValue> dataSource={data} loading={!data} rowKey="region">
      <Table.Column<ICountyWithDetailsValue> title="ID" dataIndex="region" />
      <Table.Column<ICountyWithDetailsValue>
        title="County"
        dataIndex="regionName"
        render={renderRegion}
        sorter={compareName}
        sortDirections={['ascend', 'descend']}
      />
      <Table.Column<ICountyWithDetailsValue>
        title="State"
        dataIndex="regionState"
        render={renderState}
        sorter={compareState}
        sortDirections={['ascend', 'descend']}
      />
      <Table.Column<ICountyWithDetailsValue>
        title={signal.name}
        dataIndex="value"
        render={renderValue}
        align="right"
        defaultSortOrder="descend"
        sorter={compareValue}
        sortDirections={['descend', 'ascend']}
      />
      {signal.data.hasStdErr && (
        <Table.Column<ICountyWithDetailsValue>
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
