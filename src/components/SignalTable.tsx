import { Table } from 'antd';
import type { SortOrder } from 'antd/lib/table/interface';
import { isValid } from 'date-fns';
import Link from 'next/link';
import { useCallback } from 'react';
import useSWR from 'swr';
import { ICountyValue } from '../data';
import { ISignal } from '../data/constants';
import { formatISODate } from '../ui/utils';

export type ISignalMultiRow = { region: string } & Record<string, string | number | undefined | null>;

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

function compareRegion(a: ICountyValue, b: ICountyValue, sortOrder?: SortOrder) {
  return compare(a.region, b.region, sortOrder);
}
function compareValue(a: ICountyValue, b: ICountyValue, sortOrder?: SortOrder) {
  return compare(a.value, b.value, sortOrder);
}
function compareStdErr(a: ICountyValue, b: ICountyValue, sortOrder?: SortOrder) {
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
    .then((r: ICountyValue[]) => r.filter((d) => !d.region.endsWith('000')));
}

export default function SignalTable({ signal, date }: { signal: ISignal; date?: Date }) {
  const apiDate = formatISODate(date);
  const validDate = isValid(date);

  const { data } = useSWR<{ region: string }[]>(
    validDate ? `/api/signal/${signal.id}/${apiDate}.json` : null,
    fetchFilter,
    {}
  );

  const renderRegion = useCallback(
    (region: string) => {
      return (
        <Link href="/region/[region]/[signal]/[date]" as={`/region/${region}/${signal.id}/${apiDate}`} passHref>
          <a>{region}</a>
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
    <Table<ICountyValue> dataSource={data} loading={!data} rowKey="region">
      <Table.Column<ICountyValue> title="Region" dataIndex="region" render={renderRegion} sorter={compareRegion} />
      <Table.Column<ICountyValue>
        title={signal.name}
        dataIndex="value"
        render={renderValue}
        align="right"
        defaultSortOrder="descend"
        sorter={compareValue}
      />
      {signal.data.hasStdErr && (
        <Table.Column<ICountyValue>
          title="Standard Error"
          dataIndex="stderr"
          align="right"
          sortOrder="descend"
          render={renderStdErr}
          defaultSortOrder="descend"
          sorter={compareStdErr}
        />
      )}
    </Table>
  );
}
