import { createHookCycle } from "./hookContext";
import { createScheduler } from "./scheduler";

import type { DiscordAdaptor, Snowflake } from "../adaptor";
import type { Logger } from "../util/logger";

export const createRenderer = <T>(
  prompt: () => T,
  commitWithEffect: (value: T) => Promise<Snowflake>,
  adaptor: DiscordAdaptor,
  logger: Logger
) => {
  const scheduler = createScheduler((work) => () => {
    setTimeout(() => {
      work();
    }, 10);
  });

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

  const act = (cb: () => void) => {
    cb();
    scheduler.flushWork();
  };

  const actAsync = async (cb: () => Promise<void>) => {
    await cb();
    scheduler.flushWork();
  };

  return {
    mount,
    update,
    unmount,
    act,
    actAsync,
  };
};
