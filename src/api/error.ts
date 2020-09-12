import { NextApiRequest, NextApiResponse } from 'next';

export class CustomHTTPError extends Error {
  constructor(public readonly statusCode: number, message?: string) {
    super(message);
  }
}

export function withError(handler: (req: NextApiRequest, res: NextApiResponse) => any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
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
