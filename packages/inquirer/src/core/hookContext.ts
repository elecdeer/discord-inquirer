import type { DiscordAdaptor, Snowflake } from "../adaptor";
import type { Logger } from "../util/logger";
import type { Awaitable } from "../util/types";

export type HookContext = {
  index: number;
  hookValues: {
    value: unknown;
    hookType: string;
    index: number;
  }[];
  renderIndex: number;
  mountHooks: ((messageId: Snowflake) => void)[];
  unmountHooks: (() => void)[];
  adaptor: DiscordAdaptor;
  dispatch: () => void;
  logger: Logger;
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

export type HookCycle = {
  startRender: () => number;
  endRender: () => void;
  callEffectHooks: (messageId: Snowflake) => void;
  callRemoveEffectHooks: () => void;
  context: HookContext;
};

export const createHookCycle = (
  adaptor: DiscordAdaptor,
  logger: Logger,
  dispatch: () => void
): HookCycle => {
  const context: HookContext = {
    index: 0,
    hookValues: [],
    renderIndex: 0,
    mountHooks: [],
    unmountHooks: [],
    adaptor: adaptor,
    dispatch: dispatch,
    logger: logger,
  };

  const startRender = () => {
    context.index = 0;
    context.mountHooks = [];
    bindHookContext(context);

    return context.renderIndex;
  };

  const endRender = () => {
    unbindHookContext();
    context.renderIndex++;
  };

  const callEffectHooks = (messageId: Snowflake) => {
    while (context.mountHooks.length > 0) {
      //length > 0の時点でhookは存在する
      const hook = context.mountHooks.shift()!;
      hook(messageId);
    }
  };

  const callRemoveEffectHooks = () => {
    while (context.unmountHooks.length > 0) {
      //length > 0の時点でhookは存在する
      const hook = context.unmountHooks.shift();
      hook!();
    }
  };

  return {
    startRender,
    endRender,
    callEffectHooks,
    callRemoveEffectHooks,
    context,
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

export const deferDispatch = <T>(ctx: HookContext, cb: () => T) => {
  console.log("deferDispatch");
  const prevDispatch = ctx.dispatch;
  let dispatched = false;

  console.log(`  #${ctx.renderIndex} patch defer dispatch`);
  ctx.dispatch = () => {
    dispatched = true;
  };
  const result = cb();

  ctx.dispatch = prevDispatch;
  console.log(
    `  #${ctx.renderIndex} unpatch defer dispatch dispatched: ${dispatched}`
  );

  return {
    dispatched,
    result,
  };
};

export const deferDispatchAsync = async <T>(
  ctx: HookContext,
  cb: () => Awaitable<T>
) => {
  console.log("deferDispatchAsync");
  const prevDispatch = ctx.dispatch;
  let dispatched = false;

  console.log(`  #${ctx.renderIndex} patch defer dispatch async`);

  ctx.dispatch = () => {
    dispatched = true;
  };
  const result = await cb();

  ctx.dispatch = prevDispatch;
  console.log(
    `  #${ctx.renderIndex} unpatch defer dispatch async dispatched: ${dispatched}`
  );

  return {
    dispatched,
    result,
  };
};

export const batchDispatch = <T>(ctx: HookContext, cb: () => T): T => {
  // console.log("batchDispatch");
  // const prevDispatch = ctx.dispatch;
  // console.log(`  #${ctx.renderIndex} patch dispatch`);
  //
  // let isDispatched = false;
  // ctx.dispatch = () => {
  //   isDispatched = true;
  // };
  // const result = cb();
  // ctx.dispatch = prevDispatch;
  // console.log(`  #${ctx.renderIndex} unpatch dispatch`);
  //
  // if (isDispatched) {
  //   console.log(`  #${ctx.renderIndex} call dispatch`);
  //   ctx.dispatch();
  // }
  //
  // return result;
  return cb();
};

export const batchDispatchAsync = async <T>(
  ctx: HookContext,
  cb: () => Awaitable<T>
): Promise<T> => {
  // console.log("batchDispatchAsync");
  // const prevDispatch = ctx.dispatch;
  // console.log(`  #${ctx.renderIndex} patch dispatch async`);
  //
  // let isDispatched = false;
  // ctx.dispatch = () => {
  //   isDispatched = true;
  // };
  // const result = await cb();
  // ctx.dispatch = prevDispatch;
  // console.log(`  #${ctx.renderIndex} unpatch dispatch async`);
  //
  // if (isDispatched) {
  //   console.log(`  #${ctx.renderIndex} call dispatch async`);
  //   ctx.dispatch();
  // }
  //
  // return result;

  return cb();
};

export const isDepsChanged = (
  prevDeps: readonly unknown[] | undefined,
  deps: readonly unknown[] | undefined
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
