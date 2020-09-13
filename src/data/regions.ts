import data from './data.json';

export interface IRegion {
  id: string;
  name: string;
  population: number | null;
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
    byId.set(`${state.id}000`, {
      id: `${state.id}000`,
      name: `Rest of ${state.name}`,
      population: null,
      state,
    } as ICountyRegion);
  }

  return { states, counties, byId };
})();

export { counties, states };

export function regionByID(region: string) {
  if (byId.has(region)) {
    return byId.get(region)!;
  }
  // create a fake and store it
  if (region.length === 2) {
    // fake state
    const fake: IStateRegion = {
      id: region,
      name: region,
      counties: [],
      population: null,
      short: region,
    };
    byId.set(region, fake);
    return fake;
  }
  // fake county
  const fake: ICountyRegion = {
    id: region,
    name: region,
    state: regionByID(region.slice(0, 2)) as IStateRegion,
    population: null,
  };
  byId.set(region, fake);
  return fake;
}

export function isStateRegion(region: IRegion): region is IStateRegion {
  return Array.isArray((region as IStateRegion).counties);
}
export function isCountyRegion(region: IRegion): region is ICountyRegion {
  return (region as ICountyRegion).state != null;
}
