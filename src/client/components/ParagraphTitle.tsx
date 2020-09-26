import { Typography } from 'antd';
import type { TitleProps } from 'antd/lib/typography/Title';
import type { ReactNodeArray } from 'react';
import styles from './ParagraphTitle.module.css';

export default function ParagraphTitle(props: TitleProps & { extra?: ReactNodeArray }) {
  if (!props.extra) {
    return <Typography.Title {...props} />;
  }
  return (
    <div className={styles.flex}>
      <Typography.Title {...props} />
      <div>{props.extra}</div>
    </div>
  );
}
