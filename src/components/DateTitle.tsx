import { CalendarOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import DatePicker from '../components/DatePicker';
import { formatISODate, formatLocal } from '../ui/utils';
import styles from './DateTitle.module.scss';

export default function DateTitle({ date }: { date?: Date }) {
  const router = useRouter();
  const jump = useCallback(
    (date: Date | null) => {
      if (date) {
        router.push(`/history/[date]`, `/history/${formatISODate(date)}`);
      }
    },
    [router]
  );

  const [picker, setPicker] = useState(false);
  const showPicker = useCallback(() => setPicker(true), [setPicker]);
  return (
    <span className={styles.title}>
      {`COVID as of ${formatLocal(date)}`}
      <Tooltip title="pick another date">
        <Button type="default" shape="circle" size="large" onClick={showPicker} icon={<CalendarOutlined />} />
      </Tooltip>
      <DatePicker
        className={styles.smallDate}
        value={date}
        onChange={jump}
        open={picker}
        allowClear={false}
        size="small"
        onOpenChange={setPicker}
      />
    </span>
  );
}
