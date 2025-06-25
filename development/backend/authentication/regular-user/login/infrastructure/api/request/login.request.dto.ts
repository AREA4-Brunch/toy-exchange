import { z } from 'zod';
import { loginRequestSchema } from './login.request.schema';

export type TLoginReq = z.infer<typeof loginRequestSchema>;

export type TLoginReqBody = TLoginReq['body'];

export type TLoginReqParam = TLoginReq['params'];
