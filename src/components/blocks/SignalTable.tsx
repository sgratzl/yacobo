import { compareDate, compareRegionName, compareRegionState, compareStdErr, compareValue } from '@/client/compare';
import { Table } from 'antd';
import Link from 'next/link';
import { useCallback } from 'react';
import { IRegionObjectValue, useDateValue, useRegionValue } from '../../client/data';
import { formatAPIDate, formatFixedValue } from '../../common';
import { IDateValue, IRegion, ISignal } from '../../model';

// export type ISignalMultiRow = { region: string } & Record<string, string | number | undefined | null>;

const renderValue = (value: number | null) => {
  return <span>{value == null ? 'Missing' : formatFixedValue(value)}</span>;
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

export default function SignalTable({ signal, date }: { signal: ISignal; date?: Date }) {
  const apiDate = formatAPIDate(date);
  const { data } = useRegionValue(signal, date);

  const renderRegion = useCallback(
    (value: string, row: IRegionObjectValue) => {
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
    <Table<IRegionObjectValue> dataSource={data} loading={!data} rowKey="region">
      <Table.Column<IRegionObjectValue> title="FIPS" dataIndex="region" />
      <Table.Column<IRegionObjectValue>
        title="County"
        dataIndex={['region', 'name']}
        render={renderRegion}
        sorter={compareRegionName}
        sortDirections={['ascend', 'descend']}
      />
      <Table.Column<IRegionObjectValue>
        title="State"
        dataIndex={['region', 'state', 'name']}
        render={renderState}
        sorter={compareRegionState}
        sortDirections={['ascend', 'descend']}
      />
      <Table.Column<IRegionObjectValue>
        title={signal.name}
        dataIndex="value"
        render={renderValue}
        align="right"
        defaultSortOrder="descend"
        sorter={compareValue}
        sortDirections={['descend', 'ascend']}
      />
      {signal.data.hasStdErr && (
        <Table.Column<IRegionObjectValue>
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

export function DateTable({ signal, region }: { signal?: ISignal; region?: IRegion }) {
  const { data } = useDateValue(region, signal);

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
      <Table.Column<IDateValue>
        title={signal?.name ?? 'Signal'}
        dataIndex="value"
        render={renderValue}
        align="right"
        sorter={compareValue}
        sortDirections={['descend', 'ascend']}
      />
      {signal?.data.hasStdErr && (
        <Table.Column<IDateValue>
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
