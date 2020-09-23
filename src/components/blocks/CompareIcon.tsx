import type { IRegion, ITriple } from '@/model';
import { Button, Tooltip } from 'antd';
import { classNames } from '../utils';
import styles from './CompareIcon.module.css';
import BlockOutlined from '@ant-design/icons/BlockOutlined';
import { useCallback } from 'react';
import { useRouterWrapper } from '@/client/hooks';

export function CompareCircleFilled({ i, className }: { i?: number; className?: string }) {
  return (
    <span role="img" aria-label="plus-circle" className={classNames('anticon', className)}>
      <svg
        viewBox="64 64 896 896"
        focusable="false"
        data-icon="plus-circle"
        width="1em"
        height="1em"
        style={{ fill: i == null ? 'currentColor' : `var(--compare-color${i + 1})` }}
        aria-hidden="true"
      >
        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64z"></path>
      </svg>
    </span>
  );
}

export function CompareIcon({ title, compare }: { title: string; compare?: number }) {
  if (compare == null) {
    return <>{title}</>;
  }
  return (
    <span>
      <CompareCircleFilled i={compare} className={styles.compareIcon} />
      <span>{title}</span>
    </span>
  );
}

export function CompareLegend({ regions }: { regions: IRegion[] }) {
  return (
    <div className={styles.legend}>
      {regions.map((region, i) => (
        <CompareIcon key={region.id} title={region.name} compare={i} />
      ))}
    </div>
  );
}

export function CompareWithButton({ region, signal, date }: ITriple) {
  const router = useRouterWrapper();
  const compare = useCallback(() => {
    if (!region) {
      return;
    }
    if (signal && date) {
      router.push('/compare/[regions]/[signal]/[date]', { regions: region, signal, date });
    } else if (signal) {
      router.push('/compare/[regions]/[signal]', { regions: region, signal });
    } else if (signal) {
      router.push('/compare/[regions]/date/[date]', { regions: region, date });
    } else {
      router.push('/compare/[regions]', { regions: region });
    }
  }, [region, signal, date, router]);
  return (
    <Tooltip title="Compare with another region">
      <Button type="default" shape="circle" onClick={compare} icon={<BlockOutlined />} />
    </Tooltip>
  );
}
