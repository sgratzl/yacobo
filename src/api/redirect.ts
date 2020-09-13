import { NextApiRequest, NextApiResponse } from 'next';

export function redirectWithFormat(req: NextApiRequest, res: NextApiResponse, suffix: string) {
  const url = req.url!;
  const format = url.lastIndexOf('.');
  if (format < 0) {
    return res.redirect(`${url}/${suffix}`);
  }
  return res.redirect(`${url.slice(0, format - 1)}/${suffix}${url.slice(format)}`);
}
