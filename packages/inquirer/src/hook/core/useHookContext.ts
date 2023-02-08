import { getHookContext } from "../../core/hookContext";

export const useHookContext = () => {
  return getHookContext();
};

export const useAdaptor = () => {
  const ctx = useHookContext();
  return ctx.adaptor;
};

// export const useLogger = () => {
//   const ctx = useHookContext();
//   return ctx.logger;
// };
