import { createClient } from 'redis';
import { promisify } from 'util';

const client = createClient(process.env.REDIS_URL!);

export const getAsync = promisify(client.get).bind(client);
export const setAsyncImpl = promisify(client.set).bind(client);

export function setAsync(key: string, value: string | Buffer): Promise<'OK'>;
export function setAsync(key: string, value: string | Buffer, flag: 'NX' | 'XX' | 'KEEPTTL'): Promise<'OK'>;
export function setAsync(key: string, value: string | Buffer, mode: 'EX' | 'PX', duration: number): Promise<'OK'>;
export function setAsync(
  key: string,
  value: string | Buffer,
  mode: 'EX' | 'PX',
  duration: number,
  flag: 'NX' | 'XX' | 'KEEPTTL'
): Promise<'OK'>;
export function setAsync(...args: any[]) {
  return setAsyncImpl.apply(client, args as any);
}

// export const existsAsync = promisify(client.exists).bind(client);
export const expireAsync = promisify(client.expire).bind(client);
