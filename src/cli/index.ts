import program, { Command } from 'commander';
import { parseISO } from 'date-fns';
import { config } from 'dotenv';
import { resolve } from 'path';
import pkg from '../../package.json';
import { regionByID, signalByID } from '../model';
import type { ICommonOptions } from './commands/charts';
import type { IImageOptions } from './vega';
import type { IVideoOptions } from './video';

config({
  path: resolve(process.cwd(), './.env.local'),
});
program.name(pkg.name).version(pkg.version).description(pkg.description);
program.option('-f, --force', 'force recreation');

interface IOptions extends ICommonOptions, IImageOptions, IVideoOptions {}

function withVideoOptions(command: Command) {
  return command.option('--fps <fps>', 'fps', (v) => Number.parseInt(v, 10));
}
function withImageOptions(command: Command) {
  return command
    .option('--plain', 'plain chart')
    .option('--scaleFactor <scaleFactor>', 'scale factor', (v) => Number.parseFloat(v), 1)
    .option('--devicePixelRatio <devicePixelRatio>', 'device pixel ratio', (v) => Number.parseFloat(v), 1)
    .option('--fps <fps>', 'fps', (v) => Number.parseInt(v, 10), 1);
}

withImageOptions(program.command('map <signal> <date>')).action((signal, date, options: IOptions) => {
  const s = signalByID(signal)!;
  const d = parseISO(date);
  import('./commands/charts').then((r) => r.runMap(s, d, options));
});
withVideoOptions(withImageOptions(program.command('map-history <signal>'))).action((signal, options: IOptions) => {
  const s = signalByID(signal)!;
  import('./commands/charts').then((r) => r.runMapHistory(s, options));
});
withVideoOptions(withImageOptions(program.command('map-history-all'))).action((options: IOptions) => {
  import('./commands/charts').then((r) => r.runMapHistoryAll(options));
});
withImageOptions(program.command('line <signal> <region>')).action((signal, region, options: IOptions) => {
  const s = signalByID(signal)!;
  const county = regionByID(region);
  import('./commands/charts').then((r) => r.runLine(s, county, options));
});
withVideoOptions(withImageOptions(program.command('line-regions <signal>'))).action((signal, options: IOptions) => {
  const s = signalByID(signal)!;
  import('./commands/charts').then((r) => r.runLineRegions(s, options));
});
withVideoOptions(withImageOptions(program.command('line-regions-all'))).action((options: IOptions) => {
  import('./commands/charts').then((r) => r.runLineRegionsAll(options));
});

withImageOptions(program.command('color-scale')).action((options: IOptions) => {
  import('./commands/heatmap').then((r) => r.colorScaleTexture(options));
});
withImageOptions(program.command('heatmap')).action((options: IOptions) => {
  import('./commands/heatmap').then((r) => r.heatmap(options));
});

program.parse(process.argv);
