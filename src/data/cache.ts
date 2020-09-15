import { createClient } from 'redis';
import { promisify } from 'util';

const client = createClient(process.env.REDIS_URL!);

export const getAsync = promisify(client.get).bind(client);
export const setAsync = promisify(client.set).bind(client);
export const existsAsync = promisify(client.exists).bind(client);
export const expireAsync = promisify(client.expire).bind(client);
