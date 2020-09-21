import { IRegion, ISignal } from '@/model';
import { Card } from 'antd';
import styles from './Section.module.css';

export default function RegionsSignalCompareSection({}: {
  regions: IRegion[];
  signal?: ISignal;
  date?: Date;
  focus: 'region' | 'signal' | 'both';
}) {
  const title = 'Test';
  return (
    <Card className={styles.card}>
      <Card.Meta title={title} />
    </Card>
  );
}
