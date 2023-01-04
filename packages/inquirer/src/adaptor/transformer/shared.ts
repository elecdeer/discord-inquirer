import { z } from "zod";

export const transformRecordValue = <K extends PropertyKey, T, U>(
  transform: (value: T) => U
) => {
  return (record: Record<K, T>): Record<K, U> => {
    return Object.fromEntries(
      Object.entries(record).map(([id, value]) => [id, transform(value as T)])
    ) as Record<K, U>;
  };
};

export const nullishThrough = <T, U>(func: (value: T) => U) => {
  return (value: T | null | undefined): U | null | undefined => {
    if (value === null) return null;
    if (value === undefined) return undefined;

    return func(value);
  };
};

export const SnowflakeSchema = z.string().regex(/\d+/);

export const transformNullishDateString = (
  dateStr: string | null | undefined
): Date | null => {
  if (dateStr === undefined || dateStr === null) return null;
  return new Date(dateStr);
};
