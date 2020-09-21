import { COMPARE_COLORS, IRegion } from '@/model';
import { Typography, List } from 'antd';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { injectQuery } from './BaseLayout';
import { RegionCustomSelect } from './RegionSelect';

function CircleIcon({ i }: { i: number }) {
  return (
    <span role="img" aria-label="plus-circle" className="anticon">
      <svg
        viewBox="64 64 896 896"
        focusable="false"
        data-icon="plus-circle"
        width="1em"
        height="1em"
        style={{ fill: `var(--compare-color${i + 1})` }}
        aria-hidden="true"
      >
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z"></path>
      </svg>
    </span>
  );
}

interface IRegionItem {
  id: string;
  region: IRegion | undefined;
  select: (s: string | null) => void;
  i: number;
}

export function Comparing({ regions, path, clearPath }: { regions: IRegion[]; path: string; clearPath: string }) {
  const router = useRouter();

  const dataSource = useMemo(() => {
    const ids = regions.map((d) => d.id);
    const ds: IRegionItem[] = regions.map((region, i) => {
      const select = (s: string | null) => {
        if (s && s !== 'US') {
          // replace
          const newRegions = [...ids.slice(0, i), s, ...ids.slice(i + 1)];
          router.push(path, injectQuery(router, path, { regions: newRegions.join(',') }));
        } else if (ids.length === 1) {
          // last one
          router.push(clearPath, injectQuery(router, clearPath));
        } else {
          const newRegions = ids.slice();
          newRegions.splice(i, 1);
          router.push(path, injectQuery(router, path, { regions: newRegions.join(',') }));
        }
      };
      return {
        id: region.id,
        region,
        select,
        i,
      };
    });
    if (regions.length < 4) {
      ds.push({
        id: '',
        region: undefined,
        i: regions.length,
        select: (s: string | null) => {
          if (!s || s === 'US') {
            return;
          }
          router.push(path, injectQuery(router, path, { regions: [...regions.map((d) => d.id), s].join(',') }));
        },
      });
    }
    return ds;
  }, [router, path, clearPath, regions]);

  const renderItem = useCallback((item: IRegionItem) => {
    return (
      <List.Item>
        <List.Item.Meta
          style={{ alignItems: 'center' }}
          avatar={<CircleIcon i={item.i} />}
          title={
            <RegionCustomSelect
              region={item.region}
              onSelect={item.select}
              allowClear
              defaultValue={false}
              open={item.i === 0 && !item.region ? true : undefined}
            />
          }
        />
      </List.Item>
    );
  }, []);

  return (
    <>
      <Typography.Title level={2}>{regions.length === 0 ? 'Select' : 'Selected'} Regions</Typography.Title>
      <List
        grid={{
          gutter: 16,
          column: COMPARE_COLORS.length,
          lg: COMPARE_COLORS.length,
          md: Math.floor(COMPARE_COLORS.length / 2),
          sm: 1,
        }}
        rowKey="id"
        dataSource={dataSource}
        renderItem={renderItem}
      />
    </>
  );
}
