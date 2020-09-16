import { registerFont } from 'canvas';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

process.env.PANGOCAIRO_BACKEND = 'fontconfig';
process.env.FONTCONFIG_PATH = resolve(join(__dirname, './fonts'));

let fontRegistered = false;

export function initCanvas() {
  if (fontRegistered || process.env.NODE_ENV !== 'production') {
    return;
  }
  fontRegistered = true;
  // follow https://medium.com/@adamhooper/fonts-in-node-canvas-bbf0b6b0cabf

  const font = resolve(join(__dirname, './fonts/Roboto-Regular.ttf'));
  if (existsSync(font)) {
    console.info('register font');
    registerFont(font, { family: 'Roboto' });
  } else {
    console.error('cannot find font: ' + font);
  }
}
