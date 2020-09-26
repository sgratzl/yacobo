import {
  compare,
  compareDate,
  compareRegionName,
  compareRegionState,
  compareStdErr,
  compareValue,
} from '@/client/compare';
import { useFetchSignalMeta } from '@/client/utils';
import { Table } from 'antd';
import { useCallback, useMemo } from 'react';
import type { SortOrder } from 'antd/lib/table/interface';
import {
  IRegionObjectDateValue,
  IRegionObjectValue,
  useDateMultiRegionValue,
  useDateValue,
  useRegionValue,
} from '../data';
import { formatAPIDate, formatFixedValue } from '../../common';
import {
  axisTitle,
  getColorScale,
  getValueScale,
  ICountyRegion,
  IDateValue,
  IRegion,
  ISignal,
  ITriple,
} from '../../model';
import { classNames } from '../utils';
import styles from './DataTables.module.css';
import colors from './ColorBox.module.css';
import { CompareIcon } from './CompareIcon';
import LinkWrapper from './LinkWrapper';

// export type ISignalMultiRow = { region: string } & Record<string, string | number | undefined | null>;

const renderStdErr = (value: number | null) => {
  return <span>{value == null ? '?' : value.toFixed(2)}</span>;
};

function useRenderBarValue(signal?: ISignal) {
  const meta = useFetchSignalMeta(signal);
  const scale = useMemo(
    () =>
      meta
        ? {
            value: getValueScale(meta, meta.meta),
            color: getColorScale(meta, meta.meta),
          }
        : undefined,
    [meta]
  );
  return useCallback(
    (value?: number | null) => {
      if (value == null || !scale) {
        return <div className={classNames(styles.gradient, colors.color, colors.missing)}>?</div>;
      }
      const p = Math.round(1000 * scale.value(value)) / 10;
      const gradient = `linear-gradient(to right, var(--g-color) ${p}%, transparent ${p}%)`;
      const color = scale.color(value);
      return (
        <div
          className={classNames(colors.color, styles.gradient)}
          style={{ background: gradient, '--color': color } as any}
        >
          {formatFixedValue(value)}
        </div>
      );
    },
    [scale]
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

export default function SignalTable({ signal, date, region }: ITriple) {
  const { data } = useRegionValue(signal, date);
  const filtered = useMemo(() => data?.filter((d) => !d.region.endsWith('000')), [data]);

  const renderRegion = useCallback(
    (value: string, row: IRegionObjectValue) => {
      return (
        <LinkWrapper
          path="/region/[region]/[signal]/[date]"
          query={{ region: row.region, signal, date }}
          passHref
          prefetch={false}
        >
          <a href="a" className={classNames(region?.id === row.region && styles.highlight)}>
            {value}
          </a>
        </LinkWrapper>
      );
    },
    [signal, date, region]
  );
  const renderState = useCallback(
    (value: string, row: IRegionObjectValue) => {
      return (
        <LinkWrapper
          path="/region/[region]/[signal]/[date]"
          query={{ region: (row.regionObj as ICountyRegion).state, signal, date }}
          passHref
          prefetch={false}
        >
          <a href="a">{value}</a>
        </LinkWrapper>
      );
    },
    [signal, date]
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
        title={`${signal?.name ?? 'Signal'} ${axisTitle(signal, 'per')}`}
        dataIndex="value"
        render={renderBarValue}
        align="right"
        defaultSortOrder="descend"
        sorter={compareValue}
        sortDirections={['descend', 'ascend']}
      />
      {signal?.data.hasStdErr && (
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

export function DateTable({ signal, region, date }: ITriple) {
  const { data } = useDateValue(region, signal);

  const renderDate = useCallback(
    (value: Date) => {
      return (
        <LinkWrapper
          path="/region/[region]/[signal]/[date]"
          query={{ region, signal, date: value }}
          passHref
          prefetch={false}
        >
          <a href="a" className={classNames(formatAPIDate(value) === formatAPIDate(date) && styles.highlight)}>
            {formatAPIDate(value)}
          </a>
        </LinkWrapper>
      );
    },
    [signal, region, date]
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
        title={`${signal?.name ?? 'Signal'} ${axisTitle(signal, 'per')}`}
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

interface IMultiDateValue {
  date: Date;
  values: { [id: string]: number | null | undefined };
}

function groupByRegion(data: IRegionObjectDateValue[]): IMultiDateValue[] {
  const rows: IMultiDateValue[] = [];
  const lookup = new Map<string, IMultiDateValue>();
  for (const row of data) {
    const key = formatAPIDate(row.date);
    if (lookup.has(key)) {
      lookup.get(key)!.values[row.region] = row.value;
    } else {
      const r: IMultiDateValue = {
        date: row.date,
        values: {
          [row.region]: row.value,
        },
      };
      lookup.set(key, r);
      rows.push(r);
    }
  }
  return rows;
}

function compareRegionValue(region: IRegion) {
  return (a: IMultiDateValue, b: IMultiDateValue, sortOrder?: SortOrder) => {
    return compare(a.values[region.id], b.values[region.id], sortOrder);
  };
}

export function DateMultiTable({ signal, regions, date }: { signal?: ISignal; regions: IRegion[]; date?: Date }) {
  const { data } = useDateMultiRegionValue(regions, signal);

  const renderDate = useCallback(
    (value: Date) => {
      return (
        <LinkWrapper
          path="/compare/[regions]/[signal]/[date]"
          query={{ regions, signal, date: value }}
          passHref
          prefetch={false}
        >
          <a href="a" className={classNames(formatAPIDate(value) === formatAPIDate(date) && styles.highlight)}>
            {formatAPIDate(value)}
          </a>
        </LinkWrapper>
      );
    },
    [signal, regions, date]
  );
  const renderBarValue = useRenderBarValue(signal);

  const grouped = data ? groupByRegion(data) : undefined;

  const comparators = useMemo(() => regions.map((region) => compareRegionValue(region)), [regions]);

  // TODO group by region and show in separate columns
  return (
    <Table<IMultiDateValue> dataSource={grouped} loading={!data} rowKey="date">
      <Table.Column<IMultiDateValue>
        title="Date"
        dataIndex="date"
        render={renderDate}
        sorter={compareDate}
        defaultSortOrder="descend"
        sortDirections={['ascend', 'descend']}
      />
      {regions.map((region, i) => (
        <Table.Column<IMultiDateValue>
          key={region.id}
          align="center"
          title={<CompareIcon title={region.name} compare={i} />}
          dataIndex={['values', region.id]}
          render={renderBarValue}
          sorter={comparators[i]}
          sortDirections={['descend', 'ascend']}
        />
      ))}
    </Table>
  );
}
