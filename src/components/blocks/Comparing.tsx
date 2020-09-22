import { formatAPIRegions } from '@/common';
import { COMPARE_COLORS, IRegion, isCountyRegion, regionByID } from '@/model';
import { Typography, List } from 'antd';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';
import { injectQuery } from './BaseLayout';
import { CompareCircleFilled } from './CompareCircleFilled';
import { RegionCustomSelect } from './RegionSelect';

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
          router.push(path, injectQuery(router, path, { regions: formatAPIRegions(newRegions) }));
        } else if (ids.length === 1) {
          // last one
          router.push(clearPath, injectQuery(router, clearPath));
        } else {
          const newRegions = ids.slice();
          newRegions.splice(i, 1);
          router.push(path, injectQuery(router, path, { regions: formatAPIRegions(newRegions) }));
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
          const newRegions = ids.slice();
          newRegions.push(s);
          const region = regionByID(s);
          if (regions.length === 0 && isCountyRegion(region)) {
            // compare with state automatically
            newRegions.push(region.state.id);
          }
          router.push(path, injectQuery(router, path, { regions: formatAPIRegions(newRegions) }));
        },
      });
    }
    return ds;
  }, [router, path, clearPath, regions]);

  const renderItem = useCallback(
    (item: IRegionItem) => {
      return (
        <List.Item>
          <List.Item.Meta
            style={{ alignItems: 'center' }}
            avatar={<CompareCircleFilled i={item.i} />}
            title={
              <RegionCustomSelect
                region={item.region}
                onSelect={item.select}
                allowClear
                selected={regions}
                defaultValue={false}
                open={item.i === 0 && !item.region ? true : undefined}
              />
            }
          />
        </List.Item>
      );
    },
    [regions]
  );

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
