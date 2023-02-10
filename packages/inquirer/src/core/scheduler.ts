const maxQueueSize = 50;

export const createScheduler = (
  workScheduler = (work: () => void) => () => {
    setTimeout(() => {
      work();
    }, 10);
  }
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

  const scheduleDispatch = (dispatch: () => void) => {
    console.log(`scheduleDispatch: ${dispatchCount}`);
    dispatchQueue.push({
      index: ++dispatchCount,
      dispatch,
    });
    if (dispatchQueue.length > maxQueueSize) {
      throw new Error("dispatchQueue is too large");
    }
    scheduleWork();
  };

  const scheduleCommit = (commit: () => Promise<void>) => {
    console.log(`scheduleCommit: ${commitCount}`);
    commitQueue.push({
      index: ++commitCount,
      commit,
    });
    if (commitQueue.length > maxQueueSize) {
      throw new Error("dispatchQueue is too large");
    }
    scheduleWork();
  };

  const work = () => {
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
  const flushWork = () => {
    while (dispatchQueue.length > 0 || commitQueue.length > 0) {
      if (dispatchQueue.length > 0) {
        workDispatch();
      }
      if (commitQueue.length > 0) {
        void workCommit();
      }
    }
  };

  const scheduleWork = workScheduler(work);

  const workDispatch = () => {
    while (dispatchQueue.length > 0) {
      const dispatchTask = dispatchQueue.shift()!;
      if (dispatchTask.index < dispatchCount) {
        //より新しいdispatchが予約されているのでスキップ
        console.log("skip dispatch");
      } else {
        console.log("dispatch");
        dispatchTask.dispatch();
      }
    }
  };

  const workCommit = async () => {
    const commitTask = commitQueue.shift();
    if (commitTask === undefined) return;
    if (commitTask.index < commitCount) {
      //より新しいcommitが予約されているのでスキップ
      console.log("skip commit");
    } else {
      console.log("commit");
      await commitTask.commit();
    }
  };

  return {
    scheduleDispatch,
    scheduleCommit,
    flushWork,
    scheduleWork,
  };
};
