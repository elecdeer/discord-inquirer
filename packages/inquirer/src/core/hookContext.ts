import type { Snowflake } from "../adaptor";

export type HookContext = {
  index: number;
  hookValues: {
    value: unknown;
    hookType: string;
    index: number;
  }[];
  mountHooks: ((messageId: Snowflake) => void)[];
  unmountHooks: (() => void)[];
  dispatch: () => void;
};

let hookContext: HookContext | undefined;

export const getHookContext = (): HookContext => {
  if (hookContext === undefined) {
    throw new Error("prompt以外の場所でhookは使用できません");
  }
  return hookContext;
};

const bindHookContext = (context: HookContext) => {
  if (hookContext !== undefined) {
    throw new Error("既にhookContextがbindされています");
  }
  hookContext = context;
};

const unbindHookContext = () => {
  if (hookContext === undefined) {
    throw new Error("hookContextがbindされていません");
  }
  hookContext = undefined;
};

export const createHookContext = (dispatch: () => void) => {
  const context: HookContext = {
    index: 0,
    hookValues: [],
    mountHooks: [],
    unmountHooks: [],
    dispatch: dispatch,
  };

  const startRender = () => {
    context.index = 0;
    bindHookContext(context);
  };

  const endRender = () => {
    unbindHookContext();
  };

  const afterMount = (messageId: Snowflake) => {
    context.mountHooks.forEach((hook) => hook(messageId));
    context.mountHooks = [];
  };

  const beforeUnmount = () => {
    context.unmountHooks.forEach((hook) => hook());
    context.unmountHooks = [];
  };

  const close = () => {
    beforeUnmount();
  };

  return { startRender, endRender, afterMount, beforeUnmount, close };
};

export const assertHookValue =
  (hookType: string) => (ctx: HookContext, current: number) => {
    if (ctx.hookValues[current] === undefined) {
      return;
    }
    if (
      ctx.hookValues[current].hookType !== hookType ||
      ctx.hookValues[current].index !== current
    ) {
      throw new Error("hookを呼び出す順序を変えてはいけません");
    }
  };
