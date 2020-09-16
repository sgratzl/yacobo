/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */

const { existsSync, readdirSync } = require('fs');
const { join, resolve } = require('path');
process.env.PANGOCAIRO_BACKEND = 'fontconfig';
process.env.FONTCONFIG_PATH = resolve(join(__dirname, './fonts'));

const { registerFont } = require('canvas');

let canvasInited = false;

module.exports.initCanvas = () => {
  console.error('init canvas');
  if (canvasInited || process.env.NODE_ENV !== 'production') {
    return;
  }
  console.error('init canvas do');
  canvasInited = false;
  // follow https://medium.com/@adamhooper/fonts-in-node-canvas-bbf0b6b0cabf

  console.error(readdirSync(__dirname));

  const file3 = resolve(join(__dirname, './fonts/Roboto-Regular.ttf'));
  console.error(`${file3} ${existsSync(file3)}`);

  if (existsSync(file3)) {
    console.error('register font');
    registerFont(file3, { family: 'Roboto' });
  }
};
