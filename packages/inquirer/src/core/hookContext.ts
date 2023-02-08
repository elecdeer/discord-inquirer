import assert from "node:assert";

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
  mountHooks: ((messageId: Snowflake, updated: boolean) => void)[][];
  unmountHooks: (() => void)[][];
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
  mount: (renderIndex: number, messageId: Snowflake) => void;
  unmount: (renderIndex: number) => void;
  update: (renderIndex: number, messageId: Snowflake, edited: boolean) => void;
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
    bindHookContext(context);

    context.mountHooks.push([]);
    context.unmountHooks.push([]);
    return context.renderIndex;
  };

  const endRender = () => {
    unbindHookContext();
    context.renderIndex++;
  };

  const callMountHooks = (
    renderIndex: number,
    messageId: Snowflake,
    updated: boolean
  ) => {
    const currentMountHooks = context.mountHooks[renderIndex];
    assert(currentMountHooks !== undefined);

    while (currentMountHooks.length > 0) {
      const hook = currentMountHooks.shift();
      //length > 0の時点でhookは存在する
      hook!(messageId, updated);
    }
  };

  const callUnmountHooks = (renderIndex: number) => {
    const prevUnmountHooks = context.unmountHooks[renderIndex];
    assert(prevUnmountHooks !== undefined);

    while (prevUnmountHooks.length > 0) {
      const hook = prevUnmountHooks.shift();
      //length > 0の時点でhookは存在する
      hook!();
    }
  };

  const mount = (renderIndex: number, messageId: Snowflake) => {
    callMountHooks(renderIndex, messageId, true);
  };

  const update = (
    renderIndex: number,
    messageId: Snowflake,
    edited: boolean
  ) => {
    callUnmountHooks(renderIndex - 1);
    callMountHooks(renderIndex, messageId, edited);
  };

  const unmount = (renderIndex: number) => {
    callUnmountHooks(renderIndex);
  };

  return {
    startRender,
    endRender,
    mount,
    unmount,
    update,
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
  const prevDispatch = ctx.dispatch;
  let dispatched = false;

  ctx.dispatch = () => {
    dispatched = true;
  };
  const result = cb();

  ctx.dispatch = prevDispatch;

  return {
    dispatched,
    result,
  };
};

export const deferDispatchAsync = async <T>(
  ctx: HookContext,
  cb: () => Awaitable<T>
) => {
  const prevDispatch = ctx.dispatch;
  let dispatched = false;

  ctx.dispatch = () => {
    dispatched = true;
  };
  const result = await cb();

  ctx.dispatch = prevDispatch;

  return {
    dispatched,
    result,
  };
};

export const batchDispatch = <T>(ctx: HookContext, cb: () => T): T => {
  console.log("batchDispatch");
  const prevDispatch = ctx.dispatch;
  console.log(`#${ctx.renderIndex} patch dispatch`);

  let isDispatched = false;
  ctx.dispatch = () => {
    isDispatched = true;
  };
  const result = cb();
  ctx.dispatch = prevDispatch;
  console.log(`#${ctx.renderIndex} unpatch dispatch`);

  if (isDispatched) {
    console.log(`#${ctx.renderIndex} call dispatch`);
    ctx.dispatch();
  }

  return result;
};

export const batchDispatchAsync = async <T>(
  ctx: HookContext,
  cb: () => Awaitable<T>
): Promise<T> => {
  console.log("batchDispatchAsync");
  const prevDispatch = ctx.dispatch;
  console.log(`#${ctx.renderIndex} patch dispatch async`);

  let isDispatched = false;
  ctx.dispatch = () => {
    isDispatched = true;
  };
  const result = await cb();
  ctx.dispatch = prevDispatch;
  console.log(`#${ctx.renderIndex} unpatch dispatch async`);

  if (isDispatched) {
    console.log(`#${ctx.renderIndex} call dispatch async`);
    ctx.dispatch();
  }

  return result;
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
