import { parseISO } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';
import { signalByID } from '../data/constants';

export function extractSignal(req: NextApiRequest, res: NextApiResponse) {
  const signal = signalByID.get(req.query.signal as string);
  if (!signal) {
    res.status(404).json({ message: `signal "${signal}" not found` });
    return null;
  }
  return signal;
}

export function extractRegion(req: NextApiRequest, res: NextApiResponse) {
  const region = req.query.region as string;
  if (!region) {
    res.status(404).json({ message: `region "${region}" not found` });
    return null;
  }
  return region;
}

export function extractDate(req: NextApiRequest, res: NextApiResponse) {
  const date = parseISO(req.query.date as string);
  if (!date || Number.isNaN(date.getTime())) {
    res.status(401).json({ message: `bad date "${req.query.date}" not found` });
    return null;
  }
  return date;
}
