import { Card } from 'antd';
import type { CardProps } from 'antd/lib/card';

export function SectionCard(props: CardProps) {
  return (
    <Card className="card" {...props}>
      <style jsx>{`
        .card {
          margin: 0.5em 0.2em;
          flex: auto;
          display: flex;
          flex-direction: column;
        }
        .card > :global(.ant-card-body) {
          flex: auto;
        }
        .card > :global(.ant-card-actions) {
          flex-grow: 0;
        }
      `}</style>
      {props.children}
    </Card>
  );
}
