import { Col } from 'antd';
import type { ColProps } from 'antd/lib/col';
import { PropsWithChildren } from 'react';
import styles from './GridColumn.module.css';

export default function GridColumn(props: PropsWithChildren<ColProps>) {
  return (
    <Col xs={24} sm={24} md={12} lg={8} className={styles.col} {...props}>
      {props.children}
    </Col>
  );
}
