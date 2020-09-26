import { isCountyRegion, ITripleValue, regionByID, signalByID } from '@/model';
import type { ICommonOptions } from '../format';

// eslint-disable-next-line @typescript-eslint/ban-types
export function injectDetails<T extends ITripleValue>(data: T[], constantFields: ICommonOptions['constantFields']) {
  const headers = ['date', 'region', 'regionName', 'regionPopulation', 'signal', 'signalName', 'value', 'stderr'];

  const isCounty = data.length > 0 && isCountyRegion(regionByID((data[0] as any).region)!);
  if (isCounty) {
    headers.splice(headers.indexOf('regionPopulation'), 0, 'regionState');
  }

  const enhancedData = data.map((row) => {
    const enhanced: any = { ...constantFields, ...row };
    enhanced.signalName = signalByID(enhanced.signal!)!.name;
    const region = regionByID(enhanced.region!);
    enhanced.regionName = region.name;
    enhanced.regionPopulation = region.population;
    if (isCountyRegion(region)) {
      enhanced.regionState = region.state.short;
    }
    return enhanced;
  });

  return { data: enhancedData, headers };
}

export function injectCustomDetails<T>(data: T[], headers: (keyof T)[]) {
  const enhancedHeaders: string[] = headers.map(String);

  const hasSignal = enhancedHeaders.includes('signal');
  const hasRegion = enhancedHeaders.includes('region');
  if (!hasSignal && !hasRegion) {
    return { data, headers };
  }
  if (hasSignal) {
    enhancedHeaders.splice(enhancedHeaders.indexOf('signal'), 0, 'signalName');
  }
  if (hasRegion) {
    enhancedHeaders.splice(enhancedHeaders.indexOf('region'), 0, 'regionName', 'regionPopulation');
  }
  const isCounty = data.length > 0 && isCountyRegion(regionByID((data[0] as any).region)!);
  if (isCounty) {
    enhancedHeaders.splice(enhancedHeaders.indexOf('regionPopulation'), 0, 'regionState');
  }

  const enhancedData: any[] = (data as any[]).map((row) => {
    const enhanced = { ...row };
    if (hasSignal) {
      enhanced.signalName = signalByID(row.signal)!.name;
    }
    if (hasRegion) {
      const region = regionByID(row.region);
      enhanced.regionName = region.name;
      enhanced.regionPopulation = region.population;
      if (isCountyRegion(region)) {
        enhanced.regionState = region.state.short;
      }
    }
    return enhanced;
  });
  return { data: enhancedData, headers: enhancedHeaders };
}
