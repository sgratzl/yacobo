import { csvFormat } from 'd3-dsv';
import { NextApiRequest, NextApiResponse } from 'next';
import { IRegion, isCountyRegion, ISignal } from '../../model';
import { ICommonOptions } from '../format';
import { setCommonHeaders } from './setCommonHeaders';

// eslint-disable-next-line @typescript-eslint/ban-types
export default function sendCSV<T extends object>(
  req: NextApiRequest,
  res: NextApiResponse,
  data: T[],
  headers: (keyof T)[],
  options: ICommonOptions & {
    details?: Map<string, IRegion | ISignal>;
  }
) {
  setCommonHeaders(req, res, options, 'csv');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  if (req.query.details == null || (!options.signals && !options.regions)) {
    res.send(csvFormat(data, headers));
    res.end();
    return;
  }
  // inject details
  let data2: any[] = data;
  const headers2: string[] = headers.map(String);
  if (options.signals) {
    headers2.splice(headers2.indexOf('signal'), 0, 'signalName');
    data2 = data.map((row: any) => ({
      ...row,
      signalName: options.signals!(row.signal)!.name,
    }));
  }
  if (options.regions) {
    headers2.splice(headers2.indexOf('region'), 0, 'regionName', 'regionPopulation');
    if (data.length > 0 && isCountyRegion(options.regions!((data[0] as any).region)!)) {
      headers2.splice(headers2.indexOf('regionPopulation'), 0, 'regionState');
    }
    data2 = data.map((row: any) => {
      const region = options.regions!(row.region);
      return {
        ...row,
        regionName: region.name,
        regionPopulation: region.population,
        ...(isCountyRegion(region) ? { state: region.state.short } : {}),
      };
    });
  }
  res.send(csvFormat(data2, headers2));
  res.end();
}
