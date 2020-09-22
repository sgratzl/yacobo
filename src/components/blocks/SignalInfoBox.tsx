import type { ISignal } from '@/model';
import { Typography, Modal, List } from 'antd';

function renderLink(item: { alt: string; href: string }) {
  return (
    <List.Item>
      <Typography.Link href={item.href}>{item.alt}</Typography.Link>
    </List.Item>
  );
}

function SignalInfoBox({ signal, date }: { signal: ISignal; date?: Date }) {
  return (
    <>
      <Typography.Paragraph>{signal.longDescription(date)}</Typography.Paragraph>
      <List
        size="small"
        header={<Typography.Text>See also</Typography.Text>}
        dataSource={signal.seeAlso}
        renderItem={renderLink}
      />
    </>
  );
}

export function showInfoBox(signal: ISignal, date?: Date) {
  Modal.info({
    title: signal.name,
    content: <SignalInfoBox signal={signal} date={date} />,
    width: '50em',
  });
}

export function SignalInfoBlock({ signal, date }: { signal?: ISignal; date?: Date }) {
  return (
    <>
      <Typography.Title level={2}>Description</Typography.Title>
      <Typography.Paragraph>{signal?.longDescription(date)}</Typography.Paragraph>
      <Typography.Title level={3}>See Also</Typography.Title>
      <List size="small" dataSource={signal?.seeAlso} renderItem={renderLink} />
    </>
  );
}
