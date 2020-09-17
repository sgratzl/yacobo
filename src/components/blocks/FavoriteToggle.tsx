import { StarFilled, StarOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { ISignal } from '../../model/signals';
import { IRegion } from '../../model/regions';
import { useFavorite } from './useFavorites';
import dynamic from 'next/dynamic';

function FavoriteToggleImpl({
  signal,
  region,
  warning = true,
  history,
}: {
  signal?: ISignal;
  region?: IRegion;
  warning?: boolean;
  history?: boolean;
}) {
  const [bookmarked, toggleFavorite] = useFavorite(warning, signal ?? (region as any), region!, history);

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
