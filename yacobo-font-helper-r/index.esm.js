import { registerFont } from 'canvas';
import { existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

let canvasInited = false;

export function initCanvas() {
  console.error('init canvas');
  if (canvasInited || process.env.NODE_ENV !== 'production') {
    return;
  }
  console.error('init canvas do');
  canvasInited = false;
  // follow https://medium.com/@adamhooper/fonts-in-node-canvas-bbf0b6b0cabf
  process.env.PANGOCAIRO_BACKEND = 'fontconfig';

  console.error(readdirSync(__dirname));

  process.env.FONTCONFIG_PATH = resolve(join(__dirname, './fonts'));
  const file3 = resolve(join(__dirname, './fonts/Roboto-Regular.ttf'));
  console.error(`${file3} ${existsSync(file3)}`);

  if (existsSync(file3)) {
    console.error('register font');
    registerFont(file3, { family: 'Roboto' });
  }
}
