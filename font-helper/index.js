/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */

const { registerFont } = require('canvas');
const { existsSync, readdirSync } = require('fs');
const { join, resolve } = require('path');

let canvasInited = false;

module.exports.initCanvas = () => {
  console.error('init canvas');
  if (canvasInited || process.env.NODE_ENV !== 'production') {
    return;
  }
  console.error('init canvas do');
  canvasInited = false;
  // follow https://medium.com/@adamhooper/fonts-in-node-canvas-bbf0b6b0cabf
  // process.env.PANGOCAIRO_BACKEND = 'fontconfig';
  // process.env.FONTCONFIG_PATH = resolve('./public/fonts');
  console.error(readdirSync(__dirname));
  console.error(readdirSync(process.cwd()));

  const file = resolve('./fonts/Roboto-Regular.ttf');
  const file2 = resolve('./node_modules/font-helper/fonts/Roboto-Regular.ttf');
  const file3 = resolve(join(__dirname, './fonts/Roboto-Regular.ttf'));
  console.error(`${file} ${existsSync(file)}, ${file2} ${existsSync(file)}, ${file3} ${existsSync(file)}`);
  console.error(resolve(file) + existsSync(file).toString());
  if (existsSync(file2)) {
    registerFont(file2, { family: 'Roboto' });
  }
};
