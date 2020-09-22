import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import type { IRouterQuery } from '../../client/hooks';

export default function LinkWrapper({
  path,
  query,
  passHref,
  children,
}: PropsWithChildren<{ path: string; query: IRouterQuery; passHref?: boolean }>) {
  return (
    <Link href={path} passHref={passHref}>
      {children}
    </Link>
  );
}
