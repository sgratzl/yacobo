import { ReactNode, useCallback, useState } from 'react';
import styles from './VegaImage.module.css';
import { classNames } from '../utils';
import InteractionOutlined from '@ant-design/icons/InteractionOutlined';
import dynamic from 'next/dynamic';
import { VegaWrapperProps } from './VegaWrapper';

export function InteractiveWrapper({ children }: { children?: ReactNode }) {
  const [interactive, setInteractive] = useState(false);
  if (!interactive) {
    return <MakeInteractive setInteractive={setInteractive} />;
  }
  return <>{children}</>;
}

export function MakeInteractive({ setInteractive }: { setInteractive: (v: boolean) => void }) {
  const makeInteractive = useCallback(() => setInteractive(true), [setInteractive]);
  return (
    <div className={classNames(styles.abs, styles.overlay, styles.interactive)} onClick={makeInteractive}>
      <div>
        <InteractionOutlined />
        <span>Click here to enable interactivity</span>
      </div>
    </div>
  );
}

export const VegaLoader = dynamic(() => import('./VegaWrapper')) as <T>(props: VegaWrapperProps<T>) => JSX.Element;
