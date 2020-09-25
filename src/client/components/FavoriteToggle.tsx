import StarFilled from '@ant-design/icons/StarFilled';
import StarOutlined from '@ant-design/icons/StarOutlined';
import { Button, Tooltip } from 'antd';
import { IFavorite, useFavorite } from './useFavorites';
import dynamic from 'next/dynamic';

function FavoriteToggleImpl({ favorite, warning = true }: { favorite: IFavorite; warning?: boolean }) {
  const [bookmarked, toggleFavorite] = useFavorite(warning, favorite);

  return (
    <Tooltip title={bookmarked ? 'remove from favorites' : 'mark as favorite'}>
      <Button
        type="default"
        shape="circle"
        onClick={toggleFavorite}
        icon={bookmarked ? <StarFilled /> : <StarOutlined />}
      />
    </Tooltip>
  );
}

export const FavoriteToggle = dynamic(() => Promise.resolve(FavoriteToggleImpl), { ssr: false });
