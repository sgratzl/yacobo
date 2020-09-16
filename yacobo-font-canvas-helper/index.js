/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */

const { existsSync } = require('fs');
const { join, resolve } = require('path');
process.env.PANGOCAIRO_BACKEND = 'fontconfig';
process.env.FONTCONFIG_PATH = resolve(join(__dirname, './fonts'));

const { registerFont } = require('canvas');

let fontRegistered = false;

module.exports.initCanvas = () => {
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
};
