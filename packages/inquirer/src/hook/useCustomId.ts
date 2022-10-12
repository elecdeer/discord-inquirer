import { randomUUID } from "crypto";

import { useState } from "./useState";

export const useCustomId = (prefix: string) => {
  const [customId] = useState(`${prefix}-${getRandomId()}`);
  return customId;
};

const getRandomId = () => {
  return randomUUID();
};
