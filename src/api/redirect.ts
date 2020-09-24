import type { NextApiRequest, NextApiResponse } from 'next';

export function redirectWithFormat(req: NextApiRequest, res: NextApiResponse, suffix: string) {
  const url = req.url!;
  const format = url.lastIndexOf('.');
  console.error(url, format);
  if (format < 0) {
    return res.redirect(`${url}/${suffix}`);
  }
  console.error(`${url.slice(0, format)}/${suffix}${url.slice(format)}`);
  return res.redirect(`${url.slice(0, format)}/${suffix}${url.slice(format)}`);
}
