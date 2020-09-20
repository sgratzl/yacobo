import { compareDate, compareRegionName, compareRegionState, compareStdErr, compareValue } from '@/client/compare';
import { useFetchSignalMeta } from '@/client/utils';
import { Table } from 'antd';
import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import { IRegionObjectValue, useDateValue, useRegionValue } from '../../client/data';
import { formatAPIDate, formatFixedValue } from '../../common';
import { getValueScale, IDateValue, IRegion, ISignal, ISignalWithMeta } from '../../model';
import styles from './SignalTable.module.css';

// export type ISignalMultiRow = { region: string } & Record<string, string | number | undefined | null>;

const renderStdErr = (value: number | null) => {
  return <span>{value == null ? 'Missing' : value.toFixed(2)}</span>;
};

function generateGradient(meta?: ISignalWithMeta, value?: number | null) {
  if (!meta || value == null) {
    return undefined;
  }
  const scale = getValueScale(meta, meta.meta);
  const p = Math.round(1000 * scale(value)) / 10;
  return `linear-gradient(to right, var(--color) ${p}%, transparent ${p}%)`;
}

function useRenderBarValue(signal?: ISignal) {
  const meta = useFetchSignalMeta(signal);
  return useCallback(
    (value?: number | null) => {
      if (value == null) {
        return <div>Missing</div>;
      }
      return (
        <div className={styles.gradient} style={{ background: generateGradient(meta, value) }}>
          {formatFixedValue(value)}
        </div>
      );
    },
    [meta]
  );
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

export default function SignalTable({ signal, date }: { signal: ISignal; date?: Date }) {
  const apiDate = formatAPIDate(date);
  const { data } = useRegionValue(signal, date);
  const filtered = useMemo(() => data?.filter((d) => !d.region.endsWith('000')), [data]);

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
  const renderBarValue = useRenderBarValue(signal);

  return (
    <Table<IRegionObjectValue> dataSource={filtered} loading={!data} rowKey="region">
      <Table.Column<IRegionObjectValue>
        title="County"
        dataIndex={['regionObj', 'name']}
        render={renderRegion}
        sorter={compareRegionName}
        sortDirections={['ascend', 'descend']}
      />
      <Table.Column<IRegionObjectValue>
        title="State"
        dataIndex={['regionObj', 'state', 'name']}
        render={renderState}
        sorter={compareRegionState}
        sortDirections={['ascend', 'descend']}
      />
      <Table.Column<IRegionObjectValue>
        title={signal.name}
        dataIndex="value"
        render={renderBarValue}
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
  const renderBarValue = useRenderBarValue(signal);

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
        render={renderBarValue}
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
