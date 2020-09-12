import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllCounties } from '@/data';
import { signalByID } from '@/data/constants';
import { parseISO } from 'date-fns';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const signal = signalByID.get(req.query.signal as string);
  if (!signal) {
    return res.status(404).json({ message: `signal "${signal}" not found` });
  }
  const date = parseISO(req.query.date as string);
  if (!date || Number.isNaN(date.getTime())) {
    return res.status(401).json({ message: `bad date "${req.query.date}" not found` });
  }
  const r = await fetchAllCounties(signal.data, date);
  return res.status(200).json(r);
};
