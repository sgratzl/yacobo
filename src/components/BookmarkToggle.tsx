import { StarFilled, StarOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { ISignal } from '../data/constants';
import { IRegion } from '../data/regions';
import { useBookmark } from './useBookmarks';

export function BookmarkToggle({
  signal,
  region,
  warning = true,
}: {
  signal?: ISignal;
  region?: IRegion;
  warning?: boolean;
}) {
  const [bookmarked, toggleBookmark] = useBookmark(warning, signal ?? (region as any), region!);

  return (
    <Tooltip title={bookmarked ? 'remove from favorites' : 'mark as favorite'}>
      <Button
        type="default"
        shape="circle"
        onClick={toggleBookmark}
        icon={bookmarked ? <StarFilled /> : <StarOutlined />}
      />
    </Tooltip>
  );
}
