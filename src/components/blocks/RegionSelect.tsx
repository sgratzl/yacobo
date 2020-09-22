import { TreeSelect } from 'antd';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { COMPARE_COLORS, IRegion, states } from '../../model';
import styles from './Select.module.css';
import { injectQuery } from './BaseLayout';
import { formatAPIRegions } from '@/common';

function generateTree(selected: IRegion[]) {
  const lookup = new Set(selected.map((d) => d.id));
  return [
    {
      key: 'US',
      label: 'US - whole country',
      value: 'US',
      disabled: lookup.has('US'),
      children: states.map((state) => ({
        key: state.id,
        label: state.name,
        value: state.id,
        disabled: lookup.has(state.id),
        filter: `${state.id} ${state.short} ${state.name}`,
        children: state.counties.map((county) => ({
          key: county.id,
          label: county.name,
          value: county.id,
          disabled: lookup.has(county.id),
          filter: `${county.id} ${county.name}`,
        })),
      })),
    },
  ];
}

export const treeData = generateTree([]);

export function RegionCustomSelect({
  region,
  onSelect,
  allowClear,
  defaultValue = true,
  selected,
  open,
}: {
  region?: IRegion;
  defaultValue?: boolean;
  onSelect: (v: string | null) => void;
  allowClear?: boolean;
  selected?: IRegion[];
  open?: boolean;
}) {
  return (
    <TreeSelect
      className={`${styles.select} ${styles.selectTree}`}
      value={region?.id ?? (defaultValue ? 'US' : undefined)}
      onChange={onSelect}
      allowClear={allowClear}
      showSearch
      treeData={selected ? generateTree(selected) : treeData}
      placeholder="Select Region"
      treeDefaultExpandedKeys={['US']}
      treeNodeFilterProp="filter"
      open={open}
      dropdownMatchSelectWidth={300}
    ></TreeSelect>
  );
}

export function RegionSelect({ region, path, clearPath }: { region?: IRegion; path: string; clearPath?: string }) {
  const router = useRouter();
  const onSelect = useCallback(
    (s: string | null) => {
      if (s && s !== 'US') {
        router.push(path, injectQuery(router, path, { region: s }));
      } else if (clearPath) {
        router.push(clearPath, injectQuery(router, clearPath));
      }
    },
    [router, path, clearPath]
  );

  return <RegionCustomSelect region={region} onSelect={onSelect} allowClear={clearPath != null} />;
}

export function RegionsSelect({ regions, path, clearPath }: { regions: IRegion[]; path: string; clearPath?: string }) {
  const router = useRouter();
  const onSelect = useCallback(
    (s: { value: string; label: string }[]) => {
      const validRegions = Array.isArray(s) ? s.map((d) => d.value).filter((d) => d !== 'US') : [];
      if (validRegions.length > COMPARE_COLORS.length) {
        validRegions.splice(COMPARE_COLORS.length - 1, validRegions.length - COMPARE_COLORS.length - 1 - 1);
      }
      if (validRegions.length > 0) {
        router.push(path, injectQuery(router, path, { regions: formatAPIRegions(validRegions) }));
      } else if (clearPath) {
        router.push(clearPath, injectQuery(router, clearPath));
      }
    },
    [router, path, clearPath]
  );

  return (
    <TreeSelect
      treeCheckStrictly
      treeCheckable
      maxTagCount={COMPARE_COLORS.length}
      className={`${styles.select} ${styles.selectTreeMultiple}`}
      value={regions.length === 0 ? undefined : (regions.map((r) => r.id) as any)}
      onChange={onSelect}
      allowClear={clearPath != null}
      showSearch
      treeData={treeData}
      placeholder="Select Region"
      treeDefaultExpandedKeys={['US']}
      treeNodeFilterProp="filter"
      dropdownMatchSelectWidth={300}
    ></TreeSelect>
  );
}
