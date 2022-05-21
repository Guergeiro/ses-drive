import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const UserDecorator = createParamDecorator(function (
  data: string,
  ctx: ExecutionContext,
) {
  const { user } = ctx.switchToHttp().getRequest<Request>();

  if (data == null) {
    return user;
  }
  return user?.[data];
});
