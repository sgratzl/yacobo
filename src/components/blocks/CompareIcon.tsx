import { IRegion } from '@/model';
import { classNames } from '../utils';
import styles from './CompareIcon.module.css';

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
