import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import { IRouterQuery, useRouterWrapper } from '../hooks';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import { Button, Tooltip } from 'antd';

export interface ILinkWrapperProps {
  path: string;
  query: IRouterQuery;
  passHref?: boolean;
  prefetch?: boolean;
}

export default function LinkWrapper({
  path,
  query,
  passHref,
  prefetch,
  children,
}: PropsWithChildren<ILinkWrapperProps>) {
  const { href, as } = useRouterWrapper().generate(path, query);
  return (
    <Link href={href} as={as} passHref={passHref} prefetch={prefetch}>
      {children}
    </Link>
  );
}

export function DetailsLink(props: ILinkWrapperProps) {
  return (
    <LinkWrapper {...props}>
      <Tooltip title="show details">
        <Button type="default" shape="circle" icon={<EyeOutlined />} />
      </Tooltip>
    </LinkWrapper>
  );
}
