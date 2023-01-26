import assert from "node:assert";

import type { DiscordAdaptor, Snowflake } from "../adaptor";

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

export const createHookCycle = (
  adaptor: DiscordAdaptor,
  dispatch: () => void
) => {
  const context: HookContext = {
    index: 0,
    hookValues: [],
    renderIndex: 0,
    mountHooks: [],
    unmountHooks: [],
    adaptor: adaptor,
    dispatch: dispatch,
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
    const prevUnmountHooks = context.unmountHooks[renderIndex - 1];
    assert(prevUnmountHooks !== undefined);

    while (prevUnmountHooks.length > 0) {
      const hook = prevUnmountHooks.shift();
      //length > 0の時点でhookは存在する
      hook!();
    }
  };

  const mount = (renderIndex: number, messageId: Snowflake) => {
    batchDispatch(context, () => {
      callMountHooks(renderIndex, messageId, true);
    });
  };

  const update = (
    renderIndex: number,
    messageId: Snowflake,
    edited: boolean
  ) => {
    batchDispatch(context, () => {
      callUnmountHooks(renderIndex);
      callMountHooks(renderIndex, messageId, edited);
    });
  };

  const unmount = (renderIndex: number) => {
    batchDispatch(context, () => {
      callUnmountHooks(renderIndex);
    });
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

export const batchDispatch = (ctx: HookContext, cb: () => void) => {
  const prevDispatch = ctx.dispatch;

  let isDispatched = false;
  ctx.dispatch = () => {
    isDispatched = true;
  };
  cb();
  ctx.dispatch = prevDispatch;

  if (isDispatched) {
    ctx.dispatch();
  }
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
