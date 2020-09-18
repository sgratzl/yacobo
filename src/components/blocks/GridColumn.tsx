import { Col } from 'antd';
import type { ColProps } from 'antd/lib/col';
import { PropsWithChildren } from 'react';

export default function GridColumn(props: PropsWithChildren<ColProps>) {
  return (
    <Col xs={24} sm={24} md={12} lg={8} className="col" {...props}>
      <style jsx>{`
        .col {
          display: flex;
          flex-direction: column;
          max-width: 30em;
          contain: content;
          content-visibility: auto;
        }

        @media (max-width: 768px) {
          .col {
            max-width: unset;
          }
        }
      `}</style>
      {props.children}
    </Col>
  );
}
