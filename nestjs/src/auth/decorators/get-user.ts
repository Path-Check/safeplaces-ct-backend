import { createParamDecorator } from '@nestjs/common'

export const GetUser = createParamDecorator((data, req) => 
  req.user
)
