import styles from './VegaImage.module.css';
import { classNames } from '../utils';
import WarningOutlined from '@ant-design/icons/WarningOutlined';

export function LoadingImage({ loading, className, error }: { loading: boolean; error: boolean; className?: string }) {
  return loading || error ? (
    <div className={classNames(styles.abs, styles.overlay, className, 'ant-spin-lg')}>
      {error ? <WarningOutlined /> : <Loading />}
    </div>
  ) : null;
}

function Loading() {
  return (
    <div>
      <span className="ant-spin-dot ant-spin-dot-spin">
        <i className="ant-spin-dot-item" />
        <i className="ant-spin-dot-item" />
        <i className="ant-spin-dot-item" />
        <i className="ant-spin-dot-item" />
      </span>
    </div>
  );
}
