import { ReactNode, useEffect, useRef, useState, MutableRefObject } from 'react';
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

const popperToAntdPlacments = {
  top: 'top',
  bottom: 'bottom',
  right: 'right',
  left: 'left',

  'top-start': 'topLeft',
  'top-end': 'topRight',
  'bottom-start': 'bottomLeft',
  'bottom-end': 'bottomRight',
  'right-start': 'rightTop',
  'right-end': 'rightBottom',
  'left-start': 'leftTop',
  'left-end': 'leftBottom',
};

interface ITooltipProps<T> {
  tooltipTitle: (datum: T) => ReactNode;
  tooltipContent: (datum: T) => ReactNode;
}

function TooltipAdapter<T>({
  handler,
  tooltipContent,
  tooltipTitle,
}: ITooltipProps<T> & {
  handler: MutableRefObject<TooltipHandler | null>;
}) {
  const [visible, setVisible] = useState(false);
  const [datum, setDatum] = useState(null as T | null);
  const [placement, setPlacement] = useState('top' as keyof typeof popperToAntdPlacments);
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
    // create a tooltip item with a virtual element
    const popper = createPopper(ref, tooltipRef.current!, {
      placement: 'top',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [x, 10],
          },
        },
      ],
    });

    // handle an vega item
    handler.current = (_, event, item, value) => {
      if (!event || !item || value == null || value === '') {
        setVisible(false);
        return;
      }
      setVisible(true);
      setDatum(resolveDatum(item));

      x = event.clientX;
      y = event.clientY;
      popper.update().then((r) => {
        setPlacement(
          r.placement === 'auto' || r.placement === 'auto-end' || r.placement === 'auto-start'
            ? 'bottom'
            : r.placement ?? 'bottom'
        );
      });
    };

    return () => {
      popper.destroy();
    };
  }, [setDatum, tooltipRef, handler, setVisible, setPlacement]);

  const placementClass = `ant-popover-placement-${popperToAntdPlacments[placement]}`;
  // fake a antd popover
  return (
    <div ref={tooltipRef} className={classNames('ant-popover', placementClass, !visible && 'ant-popover-hidden')}>
      <div className="ant-popover-content">
        <div className="ant-popover-arrow">
          <span className="ant-popover-arrow-content"></span>
        </div>
        <div className="ant-popover-inner" role="tooltip">
          <div className="ant-popover-title">{datum && tooltipTitle(datum)}</div>
          <div className="ant-popover-inner-content">{datum && tooltipContent(datum)}</div>
        </div>
      </div>
    </div>
  );
}

export interface VegaWrapperProps<T> extends ITooltipProps<T> {
  spec: TopLevelSpec;
  data: T[];
  onReady?: () => void;
  onClick?: (data: T) => void;
}

export default function VegaWrapper<T>({
  spec,
  data,
  onReady,
  tooltipTitle,
  tooltipContent,
  onClick,
}: VegaWrapperProps<T>) {
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
    if (onClick) {
      view.addEventListener('click', (_, item) => {
        if (!item) {
          return;
        }
        onClick(resolveDatum(item));
      });
    }
    vegaInstance.current = view;
    view.runAsync().then(() => {
      if (onReady) {
        onReady();
      }
    });
    return () => {
      view.finalize();
    };
  }, [vegaInstance, spec, onReady, tooltipRef, onClick]);

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
      <TooltipAdapter handler={tooltipRef} tooltipContent={tooltipContent} tooltipTitle={tooltipTitle} />
    </div>
  );
}
