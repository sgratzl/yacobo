import { NextApiRequest, NextApiResponse } from 'next';
import { CustomHTTPError } from '../common/error';
import Cors from 'cors';

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

export function withMiddleware(handler: (req: NextApiRequest, res: NextApiResponse) => any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await runCORS(req, res);
      await handler(req, res);
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
    }
  };
}
