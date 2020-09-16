import { NextApiRequest, NextApiResponse } from 'next';
import { CustomHTTPError } from '../common/error';
import Cors from 'cors';
import { Redis } from './redis';

// Initialize the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  // Only allow requests with GET, POST and OPTIONS
  methods: ['GET', 'POST', 'OPTIONS'],
});

function runCORS(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve, reject) => {
    cors(req as any, res as any, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export interface IRequestContext {
  redis: Redis;
}

const sharedContext: IRequestContext | null =
  process.env.NODE_ENV === 'production'
    ? null
    : {
        redis: new Redis(),
      };

export async function withContext<R>(handler: (context: IRequestContext) => Promise<R>): Promise<R> {
  if (sharedContext) {
    return handler(sharedContext);
  }

  let ctx: IRequestContext | null = null;
  try {
    ctx = sharedContext ?? { redis: new Redis() };
    return await handler(ctx);
  } finally {
    if (ctx && !sharedContext) {
      try {
        ctx.redis.destroy();
      } catch (error) {
        console.log(error);
      }
    }
  }
}

export function withMiddleware(handler: (req: NextApiRequest, res: NextApiResponse, context: IRequestContext) => any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    let ctx: IRequestContext | null = null;
    try {
      ctx = sharedContext ?? { redis: new Redis() };
      await runCORS(req, res);
      await handler(req, res, ctx);
    } catch (error: unknown) {
      if (error instanceof CustomHTTPError) {
        const out: any = {
          message: error.message,
        };
        if (process.env.NODE_ENV !== 'production') {
          out.name = error.name;
          out.stackTrace = error.stack;
        }
        res.status(error.statusCode).json(out);
      } else {
        throw error;
      }
    } finally {
      if (ctx && !sharedContext) {
        try {
          ctx.redis.destroy();
        } catch (error) {
          console.log(error);
        }
      }
    }
  };
}
