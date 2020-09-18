import { useMemo } from 'react';
import { VegaLite, VisualizationSpec } from 'react-vega';
import styles from './VegaWrapper.module.css';

export default function VegaWrapper({ spec, data }: { spec: VisualizationSpec; data: any[] }) {
  const v = useMemo(() => ({ values: data }), [data]);
  return (
    <div className={styles.root}>
      <VegaLite spec={spec} data={v} />
    </div>
  );
}
