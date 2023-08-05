export const transformRecordValue = <K extends PropertyKey, T, U>(
  transform: (value: T) => U,
) => {
  return (record: Record<K, T>): Record<K, U> => {
    return Object.fromEntries(
      Object.entries(record).map(([id, value]) => [id, transform(value as T)]),
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

export const transformNullishDateString = (
  dateStr: string | null | undefined,
): Date | null => {
  if (dateStr === undefined || dateStr === null) return null;
  return new Date(dateStr);
};

export const transformAdaptorTimestamp = (
  timeStamp: number | Date | undefined,
): string | undefined => {
  if (timeStamp === undefined) return undefined;
  if (timeStamp instanceof Date) {
    return timeStamp.toISOString();
  }
  return new Date(timeStamp).toISOString();
};

export const transformAdaptorColor = (
  color: number | string | undefined,
): number | undefined => {
  if (color === undefined) return undefined;
  if (typeof color === "number") return color;
  return parseInt(color.replace("#", ""), 16);
};
