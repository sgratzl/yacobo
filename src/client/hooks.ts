import { NextRouter, useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

// see https://github.com/vercel/next.js/issues/8259
function isRouterReady(router: NextRouter) {
  const hasQueryParams = /\[.+\]/.test(router.route) || /\?./.test(router.asPath);
  return router.isFallback || !hasQueryParams || Object.keys(router.query).length > 0;
}

export function useQueryParam<T>(resolver: (res: NextRouter) => T): T | undefined;
export function useQueryParam<T>(resolver: (res: NextRouter) => T, defaultValue: T): T;
export function useQueryParam<T>(
  resolver: (res: NextRouter) => T,
  defaultValue: T | undefined = undefined
): T | undefined {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();
  useEffect(() => {
    if (isRouterReady(router)) {
      setValue(resolver(router));
    }
  }, [router, setValue, resolver]);

  return value;
}

export function useFallback<T>(value: string | undefined, resolver: (value: string) => T, defaultValue: T): T {
  const router = useRouter();
  if (router.isFallback || !value) {
    return defaultValue;
  }
  return resolver(value!);
}

function injectQuery(router: NextRouter, path: string, extras: Record<string, string> = {}) {
  return path.replace(/\[(\w+)\]/gm, (_, key) => {
    return extras[key] ?? router.query[key] ?? key;
  });
}

export function fullUrl(path: string, query: IRouterQuery) {
  return path; // TODO
}

export type IRouterQuery = Record<
  string,
  undefined | null | string | string[] | Date | { id: string } | { id: string }[]
>;

export function useRouterWrapper() {
  const router = useRouter();

  const push = useCallback(
    (path: string, query: IRouterQuery) => {
      router.push(path);
    },
    [router]
  );
  return { push };
}
