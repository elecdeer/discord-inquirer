/**
 * Recordのkeyとvalueを反転させた新しいRecord型オブジェクトを返す
 * 元のkeyがstring型かつnumberに変換可能である場合、変換後はnumberになる
 */
export const reverseRecord = <T extends Record<PropertyKey, PropertyKey>>(
  record: T
): ReversedRecord<T> => {
  const reversed = Object.fromEntries(
    Reflect.ownKeys(record).map((key) => {
      const value = record[key as keyof T];
      const numberedKey =
        typeof key === "string" && isFinite(Number(key)) ? Number(key) : key;
      return [value, numberedKey];
    })
  );
  return reversed as ReversedRecord<T>;
};

//from: https://stackoverflow.com/questions/70037753/record-type-reverser
export type ReversedRecord<T extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};
