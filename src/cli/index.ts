import program from 'commander';
import { parseISO } from 'date-fns';
import { config } from 'dotenv';
import { resolve } from 'path';
import pkg from '../../package.json';
import { signalByID } from '../model';

config({
  path: resolve(process.cwd(), './.env.local'),
});
program.name(pkg.name).version(pkg.version).description(pkg.description);
program
  .option('--plain', 'plain chart')
  .option('--scaleFactor <scaleFactor>', 'scale factor', (v) => Number.parseFloat(v))
  .option('--devicePixelRatio <devicePixelRatio>', 'device pixel ratio', (v) => Number.parseFloat(v));

program.command('map <signal> <date>').action((signal, date, options: { plain?: boolean }) => {
  const s = signalByID(signal)!;
  const d = parseISO(date);
  import('./commands/map').then((r) => r.run(s, d, options));
});
program.command('map-history <signal>').action((signal, options: { plain?: boolean }) => {
  const s = signalByID(signal)!;
  import('./commands/map').then((r) => r.runHistory(s, options));
});

program.parse(process.argv);
