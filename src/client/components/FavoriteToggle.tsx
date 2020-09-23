import StarFilled from '@ant-design/icons/StarFilled';
import StarOutlined from '@ant-design/icons/StarOutlined';
import { Button, Tooltip } from 'antd';
import type { IRegion, ISignal } from '@/model';
import { useFavorite } from './useFavorites';
import dynamic from 'next/dynamic';

function FavoriteToggleImpl({
  signal,
  region,
  warning = true,
  history,
}: {
  signal?: ISignal;
  region?: IRegion | IRegion[];
  warning?: boolean;
  history?: boolean;
}) {
  const [bookmarked, toggleFavorite] = useFavorite(warning, signal ?? (region as any), region! as IRegion, history);

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