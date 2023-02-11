import { createHookCycle } from "./hookContext";
import { createScheduler } from "./scheduler";

import type { DiscordAdaptor, Snowflake } from "../adaptor";
import type { Logger } from "../util/logger";
import type { Awaitable } from "../util/types";

export const createRenderer = <T>(
  prompt: () => T,
  commitWithEffect: (value: T) => Promise<Snowflake>,
  adaptor: DiscordAdaptor,
  logger: Logger
) => {
  const scheduler = createScheduler((work) => {
    return () => {
      setTimeout(() => {
        work();
      }, 10);
    };
  }, logger);

  const hookCycle = createHookCycle(adaptor, logger, () => {
    update();
  });

  const mount = () => {
    scheduler.scheduleDispatch(() => {
      hookCycle.startRender();
      const result = prompt();
      hookCycle.endRender();

      scheduler.scheduleCommit(async () => {
        const messageId = await commitWithEffect(result);

        hookCycle.callEffectHooks(messageId);
      });
    });
  };

  const update = () => {
    scheduler.scheduleDispatch(() => {
      hookCycle.startRender();
      const result = prompt();
      hookCycle.endRender();

      scheduler.scheduleCommit(async () => {
        const messageId = await commitWithEffect(result);

        hookCycle.callRemoveEffectHooks();
        hookCycle.callEffectHooks(messageId);
      });
    });
  };

  const unmount = () => {
    //これはスキップされないで欲しいが
    scheduler.scheduleCommit(async () => {
      hookCycle.callRemoveEffectHooks();
    });
  };

  const act = async <T>(cb: () => Awaitable<T>) => {
    const result = await cb();
    await scheduler.flushWork();
    return result;
  };

  return {
    mount,
    update,
    unmount,
    act,
  };
};
