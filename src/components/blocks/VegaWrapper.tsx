import { ReactNode, useEffect, useRef, Ref, useState, RefObject, MutableRefObject } from 'react';
import { parse, TooltipHandler, View } from 'vega';
import { Error as ErrorLevel } from 'vega';
import { compile, TopLevelSpec } from 'vega-lite';
import { classNames } from '../utils';
import styles from './VegaImage.module.css';
import { createPopper, VirtualElement } from '@popperjs/core';

function resolveDatum(item: any): any {
  if (item && item.datum != null) {
    return resolveDatum(item.datum);
  }
  return item;
}

function TooltipAdapter<T>({
  handler,
  render,
}: {
  handler: MutableRefObject<TooltipHandler | null>;
  render: (datum: T) => ReactNode;
}) {
  const [datum, setDatum] = useState(null as T | null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let x = 0;
    let y = 0;
    const ref: VirtualElement = {
      getBoundingClientRect: () => {
        return {
          left: x,
          right: x + 1,
          top: y,
          bottom: y + 1,
          width: 1,
          height: 1,
        };
      },
      contextElement: tooltipRef.current!.parentElement!,
    };
    const popper = createPopper(ref, tooltipRef.current!);
    handler.current = (_, event, item) => {
      if (!event) {
        tooltipRef.current!.style.display = 'none';
        return;
      }
      tooltipRef.current!.style.display = '';
      x = event.clientX;
      y = event.clientY;
      setDatum(resolveDatum(item));
      popper.update();
    };

    return () => {
      popper.destroy();
    };
  }, [setDatum, tooltipRef, handler]);

  return <div ref={tooltipRef}>{datum && render(datum)}</div>;
}

export interface VegaWrapperProps<T> {
  spec: TopLevelSpec;
  data: T[];
  onReady?: () => void;
  tooltip?: (datum: T) => ReactNode;
}

export default function VegaWrapper<T>({ spec, data, onReady, tooltip }: VegaWrapperProps<T>) {
  const vegaInstance = useRef<View | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<TooltipHandler>(null);

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
      container: containerRef.current!,
      logLevel: ErrorLevel,
      hover: true,
      tooltip: tooltipRef.current ?? undefined,
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
  }, [vegaInstance, spec, onReady, tooltipRef]);

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

  return (
    <div className={classNames(styles.abs, styles.overlay)}>
      <div ref={containerRef} className={styles.abs}></div>
      {tooltip && <TooltipAdapter handler={tooltipRef} render={tooltip} />}
    </div>
  );
}
