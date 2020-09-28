import program from 'commander';
import { config } from 'dotenv';
import { resolve } from 'path';
import pkg from '../../package.json';

config({
  path: resolve(process.cwd(), './.env.local'),
});
program.name(pkg.name).version(pkg.version).description(pkg.description);

program.command('map').action(() => {
  import('./commands/map').then((r) => r.run());
});
program.command('map-video').action(() => {
  import('./commands/mapVideo').then((r) => r.run());
});

program.parse(process.argv);
