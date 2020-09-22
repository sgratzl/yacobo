import { formatAPIDate } from '@/common';
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

function formatValue(value: undefined | null | string | string[] | Date | { id: string } | { id: string }[]): string {
  if (value == null) {
    return '?'; // dummy value for to be loaded once
  }
  if (value instanceof Date) {
    return formatAPIDate(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return (value as any[]).map((d) => formatValue(d)).join(',');
  }
  return value.id;
}

function injectQuery(path: string, query: IRouterQuery) {
  const keys = new Set(Object.keys(query));
  return path.replace(/\[(\w+)\]/gm, (_, key) => {
    if (!keys.has(key)) {
      if (process.env.NODE_ENV === 'development') {
        console.error('generate url for key not found', path, key, query);
      }
      return key;
    }
    const r = query[key];
    return formatValue(r);
  });
}

export function fullUrl(path: string, query: IRouterQuery) {
  return injectQuery(path, query);
}

export type IRouterQuery = Record<
  string,
  undefined | null | string | string[] | Date | { id: string } | { id: string }[]
>;

export function useRouterWrapper() {
  const router = useRouter();

  const generate = useCallback(
    (path: string, query: IRouterQuery) => {
      const fullQuery = { ...router.query, ...query };
      const href = injectQuery(path, fullQuery);
      return { href, as: undefined };
    },
    [router.query]
  );
  const push = useCallback(
    (path: string, query: IRouterQuery) => {
      const { href, as } = generate(path, query);
      router.push(href, as);
    },
    [router, generate]
  );
  return { push, generate };
}
