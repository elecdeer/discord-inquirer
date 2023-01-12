import { randomUUID } from "crypto";

import { useState } from "./useState";

export const useCustomId = (prefix: string) => {
  const [customId] = useState(() => generateCustomId(prefix));
  return customId;
};

export const generateCustomId = (prefix: string) =>
  `${prefix}-${generateRandomId()}`;

export const generateRandomId = () => {
  return randomUUID();
};
