import { NextApiRequest, NextApiResponse } from 'next';

export class CustomHTTPError extends Error {
  constructor(public readonly statusCode: number, message?: string) {
    super(message);
  }
}

export function withError(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error: unknown) {
      if (error instanceof CustomHTTPError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        throw error;
      }
    }
  };
}
