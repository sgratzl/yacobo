import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import { IRouterQuery, useRouterWrapper } from '../../client/hooks';

export default function LinkWrapper({
  path,
  query,
  passHref,
  children,
}: PropsWithChildren<{ path: string; query: IRouterQuery; passHref?: boolean }>) {
  const { href, as } = useRouterWrapper().generate(path, query);
  return (
    <Link href={href} as={as} passHref={passHref}>
      {children}
    </Link>
  );
}
