import { useState } from "./useState";

export const useRef = <T>(
  value: T
): {
  current: T;
} => {
  const [state] = useState<{
    current: T;
  }>({
    current: value,
  });
  return state;
};
