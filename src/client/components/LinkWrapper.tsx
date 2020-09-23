import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import { IRouterQuery, useRouterWrapper } from '../hooks';

export default function LinkWrapper({
  path,
  query,
  passHref,
  prefetch,
  children,
}: PropsWithChildren<{ path: string; query: IRouterQuery; passHref?: boolean; prefetch?: boolean }>) {
  const { href, as } = useRouterWrapper().generate(path, query);
  return (
    <Link href={href} as={as} passHref={passHref} prefetch={prefetch}>
      {children}
    </Link>
  );
}
