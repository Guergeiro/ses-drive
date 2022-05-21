import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";

@Catch(UniqueConstraintViolationException)
export class MongoExceptionFilter<T = UniqueConstraintViolationException>
  implements ExceptionFilter<T>
{
  public catch(exception: T, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    if (exception["code"] === 11000) {
      return response
        .status(400)
        .json({ statusCode: 400, message: "Bad Request" });
    }
    return response
      .status(500)
      .json({ statusCode: 500, message: "Internal Server Error" });
  }
}
