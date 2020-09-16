/* eslint-env node */

const dsv = require('d3-dsv');
const fs = require('fs');
const { resolve } = require('path');

const counties = dsv.csvParse(fs.readFileSync(resolve(__dirname, './county.csv')).toString());

const exceptions = [];
counties.forEach((d) => {
  delete d.lat;
  delete d.long;
  d.name = d.displayName;
  delete d.displayName;
  const index = d.name.lastIndexOf(',');
  d.name = d.name.slice(0, index);
  if (!d.name.endsWith(' County')) {
    exceptions.push(d.id);
  } else {
    d.name = d.name.slice(0, -' County'.length);
  }
  d.id = d.id.slice(2); // remove state prefix
});

// fs.writeFileSync(resolve(__dirname, './county2.csv'), dsv.csvFormat(counties, ['id', 'name', 'state', 'population']));

const states = dsv.csvParse(fs.readFileSync(resolve(__dirname, './state.csv')).toString());

states.forEach((d) => {
  delete d.lat;
  delete d.long;
  d.name = d.displayName;
  delete d.displayName;
  d.short = d.postal;
  delete d.postal;
  d.population = Number.parseInt(d.population);
  const c = counties.filter((c) => c.state === d.id).sort((a, b) => a.name.localeCompare(b.name));
  d.counties = {
    id: c.map((d) => d.id),
    name: c.map((d) => d.name),
    population: c.map((d) => Number.parseInt(d.population, 10)),
  };
});
states.sort((a, b) => a.name.localeCompare(b.name));

// fs.writeFileSync(resolve(__dirname, './states.csv'), dsv.csvFormat(states, ['id', 'name', 'short', 'population']));

const data = {
  states,
  exceptions,
};

fs.writeFileSync(resolve(__dirname, '../data.json'), JSON.stringify(data));
