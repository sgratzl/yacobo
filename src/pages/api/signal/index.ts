import { NextApiRequest, NextApiResponse } from 'next';
import { fetchMeta } from '@/data';
import { formatOutput } from '@/api/format';

export default (req: NextApiRequest, res: NextApiResponse) => {
  const data = fetchMeta();
  return formatOutput(data, ['id', 'label', 'description'], `signals`, req, res);
};
