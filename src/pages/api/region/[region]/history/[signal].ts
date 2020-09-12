import { NextApiRequest, NextApiResponse } from 'next';
import { EARLIEST, fetchSignalCounty, LATEST } from '@/data';
import { signalByID } from '@/data/constants';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const signal = signalByID.get(req.query.signal as string);
  if (!signal) {
    return res.status(404).json({ message: `signal "${signal}" not found` });
  }
  const region = req.query.region as string;
  if (!region) {
    return res.status(404).json({ message: `region "${region}" not found` });
  }
  const r = await fetchSignalCounty(signal.data, region, [EARLIEST, LATEST]);
  return res.status(200).json(r);
};
