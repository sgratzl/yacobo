import data from './data.json';

export interface IRegion {
  id: string;
  name: string;
  population: number | null;
}

export interface ICountyRegion extends IRegion {
  state: IRegion;
}

export interface IStateRegion extends IRegion {
  short: string;
  counties: ICountyRegion[];
}

export const { counties, states } = (() => {
  const exceptions = new Set(data.exceptions);
  const states = data.states.map((s) => {
    // reuse object to save memory
    const state = (s as unknown) as IStateRegion;
    state.counties = s.counties.id.map((id, i) => ({
      id: `${s.id}${id}`,
      name: `${s.counties.name[i]}${exceptions.has(`${s.id}${id}`) ? '' : ' County'}, ${state.short}`,
      population: s.counties.population[i],
      state,
    }));
    return state;
  });
  const counties = states.map((d) => d.counties).flat();
  return { states, counties };
})();
