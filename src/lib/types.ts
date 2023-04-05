export type addPrefix<TKey, TPrefix extends string> = TKey extends string
  ? `${TPrefix}${TKey}`
  : never;

export type removePrefix<
  TPrefixedKey,
  TPrefix extends string
> = TPrefixedKey extends addPrefix<infer TKey, TPrefix> ? TKey : '';

export type prefixedValue<
  TObject extends Record<string, unknown>,
  TPrefixedKey extends string,
  TPrefix extends string
> = TObject extends { [K in removePrefix<TPrefixedKey, TPrefix>]: infer TValue }
  ? TValue
  : never;

export type addPrefixToObject<
  TObject extends Record<string, unknown>,
  TPrefix extends string
> = {
  [K in addPrefix<keyof TObject, TPrefix>]: prefixedValue<TObject, K, TPrefix>;
};

export type ObjectWithProp<K extends string, V> = {
  [key in K]: V;
};

export type Wrapped<K extends string, V> = Required<ObjectWithProp<K, V>>;
