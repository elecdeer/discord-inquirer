import type { Logger } from "../util/logger";

const maxQueueSize = 50;

export const createScheduler = (
  workScheduler: (work: () => void) => () => void,
  logger: Logger
) => {
  let dispatchCount = 0;
  let commitCount = 0;
  const dispatchQueue: {
    index: number;
    dispatch: () => void;
  }[] = [];
  const commitQueue: {
    index: number;
    commit: () => Promise<void>;
  }[] = [];

  let commitPending = false;

  const scheduleDispatch = (dispatch: () => void) => {
    const index = ++dispatchCount;

    logger.pushContext(`dispatch #${index}`);
    logger.log("trace", `scheduled`);

    dispatchQueue.push({
      index: index,
      dispatch,
    });
    if (dispatchQueue.length > maxQueueSize) {
      logger.popContext();
      throw new Error("dispatchQueue is too large");
    }
    scheduleWork();
    logger.popContext();
  };

  const scheduleCommit = (commit: () => Promise<void>) => {
    const index = ++commitCount;

    logger.pushContext(`commit #${index}`);
    logger.log("trace", `scheduled`);

    commitQueue.push({
      index: index,
      commit,
    });
    if (commitQueue.length > maxQueueSize) {
      logger.popContext();
      throw new Error("dispatchQueue is too large");
    }
    logger.popContext();
    scheduleWork();
  };

  const work = () => {
    if (commitPending) {
      //commitの処理中は他の処理を行ってはいけない
      scheduleWork();
      return;
    }
    if (dispatchQueue.length > 0) {
      workDispatch();
      scheduleWork();
      return;
    }
    if (commitQueue.length > 0) {
      void workCommit();
      scheduleWork();
      return;
    }
    //両方空なら次のworkは予約されない
  };

  //同期的にキューを全て処理する
  const flushWork = async () => {
    logger.pushContext("flushWork");

    logger.log("trace", "start");
    while (dispatchQueue.length > 0 || commitQueue.length > 0) {
      if (dispatchQueue.length > 0) {
        workDispatch();
      }
      if (commitQueue.length > 0) {
        await workCommit();
      }
    }
    logger.log("trace", "end");
  };

  const scheduleWork = workScheduler(work);

  const workDispatch = () => {
    while (dispatchQueue.length > 0) {
      const dispatchTask = dispatchQueue.shift()!;
      logger.pushContext(`dispatch #${dispatchTask.index}`);
      if (dispatchTask.index < dispatchCount) {
        //より新しいdispatchが予約されているのでスキップ
        logger.log("trace", `skipped`);
      } else {
        logger.log("trace", `start`);
        dispatchTask.dispatch();
        logger.log("trace", `end`);
      }
      logger.popContext();
    }
  };

  const workCommit = async () => {
    const commitTask = commitQueue.shift();
    if (commitTask === undefined) return;

    if (commitPending) {
      throw new Error("Concurrent execution of commit tasks is not allowed");
    }

    commitPending = true;

    logger.pushContext(`commit #${commitTask.index}`);
    if (commitTask.index < commitCount) {
      //より新しいcommitが予約されているのでスキップ
      logger.log("trace", "skipped");
    } else {
      logger.log("trace", "start");
      await commitTask.commit();
      logger.log("trace", "end");
    }
    logger.popContext();

    commitPending = false;
  };

  return {
    scheduleDispatch,
    scheduleCommit,
    flushWork,
    scheduleWork,
  };
};
