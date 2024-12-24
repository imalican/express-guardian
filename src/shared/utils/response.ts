import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message?: string, status = 200) {
    return res.status(status).json({
      status: 'success',
      message,
      data,
    });
  }

  static error(res: Response, message: string, status = 400) {
    return res.status(status).json({
      status: 'error',
      message,
    });
  }
}
