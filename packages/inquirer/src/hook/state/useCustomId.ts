import { randomUUID } from "crypto";

import { useState } from "./useState";

/**
 * customId用のランダムな文字列を生成し返す
 * Promptがcloseするまでは同じ値を返す
 * @param prefix customIdのprefix
 */
export const useCustomId = (prefix: string) => {
  const [customId] = useState(() => generateCustomId(prefix));
  return customId;
};

export const generateCustomId = (prefix: string) =>
  `${prefix}-${generateRandomId()}`;

export const generateRandomId = () => {
  return randomUUID();
};
