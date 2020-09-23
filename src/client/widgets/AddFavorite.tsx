import { useCallback } from 'react';
import { Card, Modal } from 'antd';
import styles from './Section.module.css';
import AppstoreAddOutlined from '@ant-design/icons/AppstoreAddOutlined';

function FavoritePicker() {
  return <div></div>;
}

export default function AddFavorite() {
  const addFavorite = useCallback(() => {
    Modal.info({
      title: 'Add Favorite',
      content: <FavoritePicker />,
    });
  }, []);

  return (
    <Card
      className={styles.card}
      cover={
        <div className={styles.coverIcon}>
          <AppstoreAddOutlined />
        </div>
      }
      hoverable
      onClick={addFavorite}
    >
      <Card.Meta title="Add Favorite" />
    </Card>
  );
}
