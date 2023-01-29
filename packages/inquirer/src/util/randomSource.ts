export type RandomSource = () => number;

/**
 * 0 ~ 2^32-1の範囲の整数乱数を返す関数を返す
 * @param seed
 */
export const createRandomSource = (seed: number): RandomSource => {
  //xorshift

  const a = 13;
  const b = 17;
  const c = 15;

  let y = seed;

  return () => {
    y = y ^ (y << a);
    y = y ^ (y >> b);
    y = y ^ (y << c);
    //符号無し32bit整数に変換
    return y >>> 0;
  };
};

export const createRandomHelper = (next: RandomSource) => {
  return {
    next,
    nextString: nextString(next),
    nextInt: nextInt(next),
    nextSnowflake: nextSnowflake(next),
    nextDate: nextDate(next),
    nextColor: nextColor(next),
  };
};

const charSet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * 指定した長さのランダムな文字列を返す
 * 文字には英大文字、英小文字、数字が使われる
 * 文字列の数だけ乱数を消費する
 */
export const nextString = (next: RandomSource) => (length: number) => {
  return [...Array(length)]
    .map(() => {
      const rand = next();
      return charSet[rand % charSet.length];
    })
    .join("");
};

/**
 * min以上max未満の範囲のランダムな整数を返す
 */
export const nextInt = (next: RandomSource) => (min: number, max: number) => {
  const rand = next();
  return min + (rand % (max - min));
};

/**
 * ダミーのsnowflakeIdを生成する
 * 19桁の10進整数文字列を返す
 */
export const nextSnowflake = (next: RandomSource) => () => {
  const genNextInt = nextInt(next);
  //19桁の10進整数は1つの乱数からは生成できないので2つの乱数を使う
  const upper = genNextInt(10 ** 8, 10 ** 9);
  const lower = genNextInt(0, 10 ** 10);
  return `${upper}${lower.toString().padStart(10, "0")}`;
};

export const nextDate = (next: RandomSource) => (min: Date, max: Date) => {
  const minTime = min.getTime();
  const maxTime = max.getTime();
  const rand = next();
  const time = minTime + (rand % (maxTime - minTime));
  return new Date(time);
};

export const nextColor = (next: RandomSource) => () => {
  const rand = next();
  return rand % 0xffffff;
};
