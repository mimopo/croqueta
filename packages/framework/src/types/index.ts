/**
 * Represents a type that can be instantiated.
 * This is often used to represent a class constructor.
 * @template T The type of the instance that will be created.
 */
export interface Type<T> extends Function {
  new (...args: any[]): T;
}

/**
 * Constructs a type by picking the set of properties `R` from `T` and making them required,
 * while keeping the rest of `T` as is.
 * @template T The source type.
 * @template R The keys of `T` that should be made required.
 */
export type PartialRequired<T, R extends keyof T> = T & Required<Pick<T, R>>;

/**
 * Represents a type that can be a value or a promise of a value.
 * @template T The type of the value.
 */
export type MaybePromise<T> = T | Promise<T>;
