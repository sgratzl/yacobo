import { useEffect, useRef } from 'react';
import { parse, View } from 'vega';
import { Error as ErrorLevel } from 'vega';
import { compile, TopLevelSpec } from 'vega-lite';
import { classNames } from '../utils';
import styles from './VegaImage.module.css';

export default function VegaWrapper({
  spec,
  data,
  onReady,
}: {
  spec: TopLevelSpec;
  data: any[];
  onReady?: () => void;
}) {
  const vegaInstance = useRef<View | null>(null);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vegaLiteSpec = {
      ...spec,
      width: 'container',
      height: 'container',
      autosize: {
        contains: 'padding',
      },
    } as TopLevelSpec;
    const vegaSpec = compile(vegaLiteSpec);
    const view = new View(parse(vegaSpec.spec), {
      renderer: 'canvas',
      container: container.current!,
      logLevel: ErrorLevel,
      hover: true,
    });
    vegaInstance.current = view;
    view.runAsync().then(() => {
      if (onReady) {
        onReady();
      }
    });
    return () => {
      view.finalize();
    };
  }, [vegaInstance, spec, onReady]);

  useEffect(() => {
    if (!vegaInstance.current) {
      return;
    }
    const view = vegaInstance.current;
    view.change(
      'data',
      view
        .changeset()
        .remove(() => true)
        .insert(data)
    );
    view.runAsync();
  }, [vegaInstance, data]);

  return <div ref={container} className={classNames(styles.abs, styles.overlay)} />;
}
