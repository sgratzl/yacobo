import { useMemo } from 'react';
import { VegaLite } from 'react-vega';
import { Error as ErrorLevel } from 'vega';
import { TopLevelSpec } from 'vega-lite';
import { classNames } from '../utils';
import styles from './VegaImage.module.css';

export default function VegaWrapper({ spec, data }: { spec: TopLevelSpec; data: any[] | Record<string, any[]> }) {
  const v = useMemo(() => (Array.isArray(data) ? { data } : data), [data]);
  delete (spec as any).datasets;
  const patched = useMemo(
    () =>
      ({
        ...spec,
        width: 'container',
        height: 'container',
        autosize: {
          contains: 'padding',
        },
      } as TopLevelSpec),
    [spec]
  );
  return (
    <VegaLite
      spec={patched}
      data={v}
      className={classNames(styles.abs, styles.overlay)}
      actions={false}
      logLevel={ErrorLevel}
    />
  );
}
