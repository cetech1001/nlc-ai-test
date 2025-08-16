import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        // Add standard response wrapper if data is not already wrapped
        if (data && typeof data === 'object' && !data.hasOwnProperty('success')) {
          return {
            success: true,
            data,
            meta: {
              timestamp: new Date().toISOString(),
              path: request.url,
              method: request.method,
            },
          };
        }

        return data;
      })
    );
  }
}
