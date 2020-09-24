import type { NextApiRequest, NextApiResponse } from 'next';

export function redirectWithFormat(req: NextApiRequest, res: NextApiResponse, suffix: string) {
  const url = req.headers.location ?? req.url!;
  const query = url.indexOf('?');
  const format = query >= 0 ? url.slice(0, query).lastIndexOf('.') : url.lastIndexOf('.');
  console.error(url, format, query);
  if (format < 0) {
    if (query >= 0) {
      return res.redirect(`${url.slice(0, query)}/${suffix}${url.slice(query)}`);
    }
    return res.redirect(`${url}/${suffix}`);
  }
  console.error(`${url.slice(0, format)}/${suffix}${url.slice(format)}`);
  return res.redirect(`${url.slice(0, format)}/${suffix}${url.slice(format)}`);
}
