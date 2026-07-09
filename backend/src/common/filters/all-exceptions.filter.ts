import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      const resp = exception.getResponse() as any;
      if (typeof resp === 'object') {
        code = resp.error || resp.code || HttpStatus[status] || 'ERROR';
        message = Array.isArray(resp.message) ? resp.message[0] : resp.message;
      } else {
        message = resp;
      }
    } else if (exception instanceof Error) {
      console.error('Unhandled Exception:', exception);
      message = 'Internal server error';
    }

    // specific mappings based on requirements
    if (status === 401 && message === 'Unauthorized') {
        code = 'INVALID_CREDENTIALS';
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
      },
    });
  }
}
