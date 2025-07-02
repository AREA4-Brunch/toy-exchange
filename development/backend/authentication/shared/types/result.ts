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

    public abstract flatMap<TRet, EAdded>(
        fn: (prevRet: T) => Result<TRet, EAdded>,
    ): Result<TRet, E | EAdded>;

    /** Just like mapError but only for given error type. */
    public abstract catchRethrow<ECaught, ERet>(
        TErrCaught: new (...args: any[]) => ECaught,
        fn: (prevErr: ECaught) => Result<T, ERet>,
    ): Result<T, ERet | Exclude<E, ECaught>>;

    /** Like flatMapError but only for given error type. */
    public abstract catch<ECaught>(
        TErrCaught: new (...args: any[]) => ECaught,
        fn: (prevErr: ECaught) => T,
    ): Success<T> | Failure<Exclude<E, ECaught>>;

    public abstract getOrThrow(): T;
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

    public mapError<ERet>(fn: (prevErr: never) => ERet): Success<T> {
        return this;
    }

    public flatMap<TRet, EAdded>(
        fn: (prevRet: T) => Result<TRet, EAdded>,
    ): Result<TRet, EAdded> {
        return fn(this.value);
    }

    public catchRethrow<ECaught, ERet>(
        TErrCaught: new (...args: any[]) => ECaught,
        fn: (prevErr: ECaught) => Result<T, ERet>,
    ): Success<T> {
        return this;
    }

    public catch<ECaught, E>(
        _: new (...args: any[]) => ECaught,
        __: (prevErr: ECaught) => T,
    ): Success<T> | Failure<Exclude<E, ECaught>> {
        return this;
    }

    public getOrThrow(): T {
        return this.value;
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

    public map<TRet>(fn: (prevRet: never) => TRet): Failure<E> {
        return this;
    }

    public mapError<ERet>(fn: (prevErr: E) => ERet): Failure<ERet> {
        return Failure.create(fn(this.error));
    }

    public flatMap<TRet, EAdded>(
        fn: (prevRet: never) => Result<TRet, EAdded>,
    ): Failure<E> {
        return this;
    }

    public catchRethrow<ECaught, ERet, TRet>(
        TErrCaught: new (...args: any[]) => ECaught,
        fn: (prevErr: ECaught) => Result<TRet, ERet>,
    ): Result<TRet, ERet | Exclude<E, ECaught>> {
        if (this.error instanceof TErrCaught) {
            return fn(this.error);
        }
        return this as Failure<Exclude<E, ECaught>>;
    }

    public catch<ECaught, T>(
        TErrCaught: new (...args: any[]) => ECaught,
        fn: (prevErr: ECaught) => T,
    ): Success<T> | Failure<Exclude<E, ECaught>> {
        if (this.error instanceof TErrCaught) {
            return Success.create(fn(this.error));
        }
        return this as Failure<Exclude<E, ECaught>>;
    }

    public getOrThrow(): never {
        throw this.error;
    }
}
