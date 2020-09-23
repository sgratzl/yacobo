import type { ITriple } from '@/model';

export interface IWidgetProps extends ITriple {
  focus: 'region' | 'signal' | 'both';
  compare?: number;
}
