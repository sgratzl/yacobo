import { IRegionValue, fetchSignalMeta } from '../data';
import { TopLevelSpec } from 'vega-lite';
import { ISignal, ISignalMeta } from '../data/signals';
import { LayerSpec, UnitSpec } from 'vega-lite/build/src/spec';
import { DataSource } from 'vega-lite/build/src/data';

export const font = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`;

export interface IVegaOptions {
  scaleFactor: number;
  details: boolean;
  devicePixelRatio: number;
}
