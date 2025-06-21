export abstract class Result<T, E> {
    public static success<T>(value: T): Success<T> {
        return Success.create(value);
    }

    public static failure<E>(error: E): Failure<E> {
        return Failure.create(error);
    }

    public abstract isSuccess(): this is Success<T>;

    public abstract isFailure(): this is Failure<E>;

    public abstract reduce<TRet>(handler: (either: T | E) => TRet): TRet;

    public abstract match<TRet>(handlers: {
        success: (value: T) => TRet;
        failure: (error: E) => TRet;
    }): TRet;

    public abstract map<TRet>(fn: (prevRet: T) => TRet): Result<TRet, E>;

    public abstract mapError<ERet>(fn: (prevErr: E) => ERet): Result<T, ERet>;
}

export class Success<T> extends Result<T, never> {
    protected constructor(public readonly value: T) {
        super();
    }

    public isSuccess(): this is Success<T> {
        return true;
    }

    public isFailure(): this is Failure<never> {
        return false;
    }

    public static create<T>(value: T): Success<T> {
        return new Success(value);
    }

    public reduce<TRet>(handler: (either: T) => TRet): TRet {
        return handler(this.value);
    }

    public match<TRet>(handlers: {
        success: (value: T) => TRet;
        failure: (error: never) => TRet;
    }): TRet {
        return handlers.success(this.value);
    }

    public map<TRet>(fn: (prevRet: T) => TRet): Success<TRet> {
        return Success.create(fn(this.value));
    }

    public mapError<ERet>(_: (prevErr: never) => ERet): Result<T, ERet> {
        return this;
    }
}

export class Failure<E> extends Result<never, E> {
    protected constructor(public readonly error: E) {
        super();
    }

    public isSuccess(): this is Success<never> {
        return false;
    }

    public isFailure(): this is Failure<E> {
        return true;
    }

    public static create<E>(error: E): Failure<E> {
        return new Failure(error);
    }

    public reduce<TRet>(handler: (either: E) => TRet): TRet {
        return handler(this.error);
    }

    public match<TRet>(handlers: {
        success: (value: never) => TRet;
        failure: (error: E) => TRet;
    }): TRet {
        return handlers.failure(this.error);
    }

    public map<TRet>(_: (prevRet: never) => TRet): Result<TRet, E> {
        return this;
    }

    public mapError<ERet>(fn: (prevErr: E) => ERet): Failure<ERet> {
        return Failure.create(fn(this.error));
    }
}
