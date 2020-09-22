import { createClient, RedisClient } from 'redis';

export class Redis {
  private client: RedisClient | null = null;

  private getClient() {
    // lazy init
    if (this.client) {
      return this.client;
    }
    this.client = createClient(process.env.REDIS_URL!, {
      no_ready_check: true, // to save some command
    });
    return this.client;
  }

  destroy() {
    if (!this.client) {
      return;
    }
    this.client.quit();
    this.client = null;
  }

  getAsync(key: string): Promise<string | null> {
    return new Promise<string | null>((resolve, reject) => {
      const c = this.getClient();
      c.get(key, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  }

  setAsync(key: string, value: string | Buffer, mode: 'EX' | 'PX', duration: number): Promise<'OK'> {
    return new Promise<'OK'>((resolve, reject) => {
      const c = this.getClient();
      c.set(key, value as any, mode, duration, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(value);
        }
      });
    });
  }
}
