import { ISignal } from '@/model';
import { Typography, Modal, List } from 'antd';
import { useCallback } from 'react';

export default function SignalInfoBox({ signal, date }: { signal: ISignal; date?: Date }) {
  const render = useCallback((item: { alt: string; href: string }) => {
    return (
      <List.Item>
        <Typography.Link href={item.href}>{item.alt}</Typography.Link>
      </List.Item>
    );
  }, []);
  return (
    <>
      <Typography.Paragraph>{signal.longDescription(date)}</Typography.Paragraph>

      <List
        size="small"
        header={<Typography.Title level={4}>See also:</Typography.Title>}
        bordered
        dataSource={signal.seeAlso}
        renderItem={render}
      />
    </>
  );
}

export function showInfoBox(signal: ISignal, date?: Date) {
  Modal.info({
    title: signal.name,
    content: <SignalInfoBox signal={signal} date={date} />,
  });
}
