import { z } from 'zod';
import { loginRequestSchema } from '../request-schemas/login.schema';

export type TLoginRequestDto = z.infer<typeof loginRequestSchema>;
