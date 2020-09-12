import { NextApiRequest, NextApiResponse } from 'next';
import { fetchCounty } from '@/data';
import { parseISO } from 'date-fns';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const region = req.query.region as string;
  if (!region) {
    return res.status(404).json({ message: `region "${region}" not found` });
  }
  const date = parseISO(req.query.date as string);
  if (!date) {
    return res.status(401).json({ message: `bad date "${req.query.date}" not found` });
  }
  const r = await fetchCounty(region, date);
  return res.status(200).json(r);
};
