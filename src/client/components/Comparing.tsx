import { IRouterQuery, useRouterWrapper } from '@/client/hooks';
import { COMPARE_COLORS, IRegion, isCountyRegion, regionByID } from '@/model';
import { Typography, List, Row, Col } from 'antd';
import { useCallback, useMemo } from 'react';
import { CompareCircleFilled, CompareIcon } from './CompareIcon';
import { RegionCustomSelect } from './RegionSelect';

interface IRegionItem {
  id: string;
  region: IRegion | undefined;
  select: (s: string | null) => void;
  i: number;
}

export function Comparing({
  regions,
  path,
  clearPath,
  query,
}: {
  regions: IRegion[];
  path: string;
  clearPath: string;
  query: IRouterQuery;
}) {
  const router = useRouterWrapper();

  const dataSource = useMemo(() => {
    const ids = regions.map((d) => d.id);
    const ds: IRegionItem[] = regions.map((region, i) => {
      const select = (s: string | null) => {
        if (s && s !== 'US') {
          // replace
          const newRegions = [...ids.slice(0, i), s, ...ids.slice(i + 1)];
          router.push(path, { ...query, regions: newRegions });
        } else if (ids.length === 1) {
          // last one
          router.push(clearPath, query);
        } else {
          const newRegions = ids.slice();
          newRegions.splice(i, 1);
          router.push(path, { ...query, regions: newRegions });
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
          router.push(path, { ...query, regions: newRegions });
        },
      });
    }
    return ds;
  }, [router, path, clearPath, regions, query]);

  return (
    <>
      <Typography.Title level={2}>{regions.length === 0 ? 'Select' : 'Selected'} Regions</Typography.Title>
      <Row>
        {dataSource.map((item) => (
          <Col key={item.id} sm={12} md={8} lg={6}>
            <CompareIcon compare={item.i}>
              <RegionCustomSelect
                region={item.region}
                onSelect={item.select}
                allowClear
                selected={regions}
                defaultValue={false}
                open={item.i === 0 && !item.region ? true : undefined}
              />
            </CompareIcon>
          </Col>
        ))}
      </Row>
    </>
  );
}
