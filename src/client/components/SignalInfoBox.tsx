import type { ISignal } from '@/model';
import { Typography, Modal, List, Tooltip, Button } from 'antd';
import { PropsWithChildren, ReactNode, useCallback } from 'react';
import QuestionOutlined from '@ant-design/icons/QuestionOutlined';

function renderLink(item: { alt: string; href: string }) {
  return (
    <List.Item>
      <Typography.Link href={item.href}>{item.alt}</Typography.Link>
    </List.Item>
  );
}

function SignalInfoBox({ signal, date, children }: PropsWithChildren<{ signal: ISignal; date?: Date }>) {
  return (
    <>
      <Typography.Paragraph>{signal.longDescription(date)}</Typography.Paragraph>
      <List
        size="small"
        header={<Typography.Text>See also</Typography.Text>}
        dataSource={signal.seeAlso}
        renderItem={renderLink}
      />
      {children}
    </>
  );
}

export function SignalInfoBlock({ signal, date }: { signal?: ISignal; date?: Date }) {
  return (
    <>
      <Typography.Title level={2}>About the signal</Typography.Title>
      <Typography.Paragraph>{signal?.longDescription(date)}</Typography.Paragraph>
      <Typography.Title level={3}>See Also</Typography.Title>
      <List size="small" dataSource={signal?.seeAlso} renderItem={renderLink} />
    </>
  );
}

export function ShowInfo({ signal, date, chart }: { signal?: ISignal; date?: Date; chart?: ReactNode }) {
  const showInfo = useCallback(() => {
    if (!signal) {
      return;
    }
    Modal.info({
      title: signal.name,
      content: (
        <SignalInfoBox signal={signal} date={date}>
          {chart && (
            <>
              <Typography.Title level={4}>About the chart</Typography.Title>
              {chart}
            </>
          )}
        </SignalInfoBox>
      ),
      width: '50em',
    });
  }, [signal, date, chart]);

  return (
    <Tooltip key="i" title="show description">
      <Button type="default" shape="circle" onClick={showInfo} icon={<QuestionOutlined />} />
    </Tooltip>
  );
}
