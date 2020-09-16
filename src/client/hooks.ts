import { useEffect, useState } from 'react';
import { NextRouter, useRouter } from 'next/router';

// // see https://github.com/vercel/next.js/issues/8259
// function isRouterReady(router: NextRouter) {
//   const hasQueryParams = /\[.+\]/.test(router.route) || /\?./.test(router.asPath);
//   return !hasQueryParams || Object.keys(router.query).length > 0;
// }

// export function useQueryParam<T>(resolver: (res: NextRouter) => T): T | undefined {
//   const [value, setValue] = useState(undefined as undefined | T);
//   const router = useRouter();
//   useEffect(() => {
//     if (isRouterReady(router)) {
//       setValue(resolver(router));
//     }
//   }, [router, setValue, resolver]);

//   return value;
// }

// export interface ILatestDateProps {
//   info: {
//     min: number;
//     max: number;
//   };
// }
