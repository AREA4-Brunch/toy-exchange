export interface IValidateable<T> {
    /**
     *
     * Validates the given value.
     * @param value The value to validate.
     * @throws {Error} Thrown if the value is invalid.
     */
    validate(value: T): void;
}
