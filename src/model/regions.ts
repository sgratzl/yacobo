import data from './data.json';

export interface IRegion {
  id: string;
  name: string;
  population: number | null;
  fake?: boolean;
}

export interface ICountyRegion extends IRegion {
  state: IStateRegion;
}

export interface IStateRegion extends IRegion {
  short: string;
  counties: ICountyRegion[];
}

const { counties, states, byId } = (() => {
  const exceptions = new Set(data.exceptions);
  const byId = new Map<string, IRegion>();
  const states = data.states.map((s) => {
    // reuse object to save memory
    const state = (s as unknown) as IStateRegion;
    byId.set(state.id, state);
    state.counties = s.counties.id.map((id, i) => ({
      id: `${s.id}${id}`,
      name: `${s.counties.name[i]}${exceptions.has(`${s.id}${id}`) ? '' : ' County'}, ${state.short}`,
      population: s.counties.population[i],
      state,
    }));
    for (const e of state.counties) {
      byId.set(e.id, e);
    }
    return state;
  });
  const counties = states.map((d) => d.counties).flat();

  // create mega fakes
  for (const state of states) {
    // by short code
    byId.set(state.short.toLowerCase(), state);

    byId.set(`${state.id}000`, {
      id: `${state.id}000`,
      name: `Rest of ${state.name}`,
      population: null,
      state,
      fake: true,
    } as ICountyRegion);
  }

  return { states, counties, byId };
})();

export { counties, states };

export function isValidRegionID(region: string): boolean {
  const search = region ? region.toLowerCase() : '';
  const r = byId.get(search);
  return r != null && !r.fake;
}

export function regionByID(region: string) {
  const search = region ? region.toLowerCase() : '';
  if (byId.has(search)) {
    return byId.get(search)!;
  }
  // create a fake and store it
  if (search.length <= 2) {
    // fake state
    const fake: IStateRegion = {
      id: search,
      name: search,
      counties: [],
      population: null,
      short: search.toUpperCase(),
      fake: true,
    };
    byId.set(search, fake);
    return fake;
  }
  // fake county
  const fake: ICountyRegion = {
    id: search,
    name: search,
    state: regionByID(search.slice(0, 2)) as IStateRegion,
    population: null,
    fake: true,
  };
  byId.set(search, fake);
  return fake;
}

export function isFakeRegion(region?: IRegion) {
  return region?.fake === true;
}

export function isStateRegion(region?: IRegion): region is IStateRegion {
  return region != null && Array.isArray((region as IStateRegion).counties) && !isFakeRegion(region);
}
export function isCountyRegion(region?: IRegion): region is ICountyRegion {
  return region != null && (region as ICountyRegion).state != null && !isFakeRegion(region);
}

export function plainLabel(region?: IRegion) {
  if (!region || isStateRegion(region)) {
    return region?.name;
  }
  const last = region.name.lastIndexOf(',');
  return region.name.slice(0, last);
}
