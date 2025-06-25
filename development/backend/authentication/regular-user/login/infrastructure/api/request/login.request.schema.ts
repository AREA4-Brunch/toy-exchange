import { z } from 'zod';

// conceptually this is equivalent to constructor validation of the request DTO
// so it should be separated from DTO interface, whereas request DTO
// impl is express.Request
export const loginRequestSchema = z.object({
    body: z.object({
        email: z
            .string({ required_error: 'Email is required' })
            .email({ message: 'Invalid email format' }),
        password: z
            .string({ required_error: 'Password is required' })
            .min(8, { message: 'Password must be at least 8 characters long' }),
    }),
    query: z.object({}),
    params: z.object({}),
});
