import { Card } from 'antd';
import styles from './Section.module.css';
import AppstoreAddOutlined from '@ant-design/icons/AppstoreAddOutlined';

export default function AddFavorite() {
  return (
    <Card className={styles.card} cover={<AppstoreAddOutlined />}>
      <Card.Meta title="Add Favorite" />
    </Card>
  );
}
