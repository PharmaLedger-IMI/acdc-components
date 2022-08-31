// based on https://docs.nestjs.com/exception-filters#inheritance
import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class CatchAllFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
      
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    
    console.log("CatchAll request",request.method,request.url,"exception",exception);

    if (!(exception instanceof HttpException)) {
        super.catch(new HttpException('Internal server error - '+exception?.message,
                                      HttpStatus.INTERNAL_SERVER_ERROR),
                    host);
    } else {
        super.catch(exception, host);
    }
  }
  
  public isHttpError(err: any): err is { statusCode: number; message: string } {
    return err?.statusCode && err?.message;
  }
}
