import { StarFilled, StarOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { ISignal } from '../model/signals';
import { IRegion } from '../model/regions';
import { useFavorite } from './useFavorites';

export function FavoriteToggle({
  signal,
  region,
  warning = true,
}: {
  signal?: ISignal;
  region?: IRegion;
  warning?: boolean;
}) {
  const [bookmarked, toggleFavorite] = useFavorite(warning, signal ?? (region as any), region!);

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
