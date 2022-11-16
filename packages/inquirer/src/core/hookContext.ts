import type { DiscordAdaptor, Snowflake } from "../adaptor";

export type HookContext = {
  index: number;
  hookValues: {
    value: unknown;
    hookType: string;
    index: number;
  }[];
  mountHooks: ((messageId: Snowflake) => void)[];
  unmountHooks: (() => void)[];
  adaptor: DiscordAdaptor;
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

export const createHookContext = (
  adaptor: DiscordAdaptor,
  dispatch: () => void
) => {
  const context: HookContext = {
    index: 0,
    hookValues: [],
    mountHooks: [],
    unmountHooks: [],
    adaptor: adaptor,
    dispatch: dispatch,
  };

  const startRender = () => {
    context.index = 0;
    bindHookContext(context);
  };

  const endRender = () => {
    unbindHookContext();
  };

  const mount = (messageId: Snowflake) => {
    context.mountHooks.forEach((hook) => hook(messageId));
    context.mountHooks = [];
  };

  const update = (messageId: Snowflake) => {
    unmount();
    mount(messageId);
  };

  const unmount = () => {
    context.unmountHooks.forEach((hook) => hook());
    context.unmountHooks = [];
  };

  return {
    startRender,
    endRender,
    mount,
    unmount,
    update,
  };
};

export const takeIndex = (ctx: HookContext) => {
  const index = ctx.index;
  ctx.index++;
  return index;
};

export const isInitial = (ctx: HookContext, index: number) => {
  //undefinedが入っている可能性があるため、inで判定する
  return !(index in ctx.hookValues);
};

export const stockHookValue =
  (hookType: string) => (ctx: HookContext, index: number, value: unknown) => {
    ctx.hookValues[index] = {
      value,
      hookType,
      index,
    };
  };

export const takeValue = <T>(ctx: HookContext, index: number): T => {
  return ctx.hookValues[index]?.value as T;
};

export const isDepsChanged = (
  prevDeps: unknown[] | undefined,
  deps: unknown[] | undefined
) => {
  return (
    prevDeps === undefined ||
    deps === undefined ||
    deps.some((dep, i) => !Object.is(dep, prevDeps[i]))
  );
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
