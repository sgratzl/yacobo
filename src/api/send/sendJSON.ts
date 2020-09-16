import { NextApiRequest, NextApiResponse } from 'next';
import { isCountyRegion } from '../../data/regions';
import { ICommonOptions } from '../format';
import { setCommonHeaders } from './setCommonHeaders';

export default function sendJSON<T>(req: NextApiRequest, res: NextApiResponse, data: T[], options: ICommonOptions) {
  setCommonHeaders(req, res, options, 'json');
  if (req.query.details == null || (!options.signals && !options.regions)) {
    res.json(data);
    return;
  }
  // inject details
  let data2: any[] = data;
  if (options.signals) {
    data2 = data.map((row: any) => ({
      ...row,
      signalName: options.signals!(row.signal)!.name,
    }));
  }
  if (options.regions) {
    data2 = data.map((row: any) => {
      const region = options.regions!(row.region);
      return {
        ...row,
        regionName: region.name,
        regionPopulation: region.population,
        ...(isCountyRegion(region) ? { regionState: region.state.short } : {}),
      };
    });
  }
  res.json(data2);
}
