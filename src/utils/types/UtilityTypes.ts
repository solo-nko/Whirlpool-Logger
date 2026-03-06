/**
 * Example:
 * ```ts
 * type ModifiedType = WithReplaced<OriginalType, {
  replacedKey1: string;
  replacedKey2?: Date;
}>
 ```
 */
export type WithReplaced<T, R extends Partial<Record<keyof T, unknown>>> = Omit<T, keyof R> & R;
