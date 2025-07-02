import { Email } from '../../../../../shared/core/value-objects/email';
import { Result } from '../../../../../shared/types/result';

// in clean architecture diagrams input is presented as a data structure,
// not interface, and I find that keeping construction and validation in the
// application layer ensures that the input is by design valid before it reaches
// the use case, following the IDDD Vaughn Vernon's principles, and leaving,
// need be, adapting factories in the infrastructure layer
export class LoginInput {
    // prefer result pattern so static factory instead of constructor
    private constructor(
        public email: Email,
        public password: string,
    ) {}

    public static create(
        email: Email,
        password: string,
    ): Result<LoginInput, never> {
        return Result.success<LoginInput>(new LoginInput(email, password));
    }
}

export interface ILoginInputBoundary {
    execute(input: LoginInput): Promise<void>;
}
