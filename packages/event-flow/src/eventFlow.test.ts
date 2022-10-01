import { describe, expect, test, vi } from "vitest";

import { createEventFlow } from "./eventFlow";

import type { IEventFlow, IEventFlowHandler } from "./types";

describe("/eventFlow.ts", () => {
  describe("createEventFlow()", () => {
    describe("functions test", () => {
      testOnFunc(createEventFlow(), (source) => source);
      testOnceFunc(createEventFlow(), (source) => source);
      testOffFunc(createEventFlow(), (source) => source);
      testOffAllFunc(createEventFlow(), (source) => source);
    });
  });

  describe("filter()", () => {
    describe("functions test", () => {
      testOnFunc(createEventFlow(), (source) => source.filter(() => true));
      testOnceFunc(createEventFlow(), (source) => source.filter(() => true));
      testOffFunc(createEventFlow(), (source) => source.filter(() => true));
      testOffAllFunc(createEventFlow(), (source) => source.filter(() => true));
      testOffAllInBranchFunc(createEventFlow(), (source) =>
        source.filter(() => true)
      );
    });

    test("元のflowに影響を与えない", () => {
      const handler = vi.fn();

      const flow = createEventFlow<number>();
      flow.filter(() => false);

      flow.on(handler);
      flow.emit(0);

      expect(handler).toHaveBeenCalledWith(0);
    });

    test("filterに通過したemitしか発火しない", () => {
      const handler = vi.fn();

      const flow = createEventFlow<number>();
      const filteredFlow = flow.filter((num) => num % 2 === 0);

      filteredFlow.on(handler);

      flow.emit(0);
      flow.emit(1);
      flow.emit(2);

      expect(handler).toHaveBeenCalledWith(0);
      expect(handler).not.toHaveBeenCalledWith(1);
      expect(handler).toHaveBeenCalledWith(2);
    });

    test("複数指定したfilterに通過したemitしか発火しない", () => {
      const handler = vi.fn();

      const flow = createEventFlow<number>();

      const filteredFlow = flow.filter(
        (num) => num % 2 === 0,
        (num) => num % 3 === 0
      );

      //6の倍数だけ通過する
      filteredFlow.on(handler);

      flow.emit(0);
      flow.emit(2);
      flow.emit(3);
      flow.emit(6);

      expect(handler).toHaveBeenCalledWith(0);
      expect(handler).not.toHaveBeenCalledWith(2);
      expect(handler).not.toHaveBeenCalledWith(3);
      expect(handler).toHaveBeenCalledWith(6);
    });

    test("重ねられたfilterに通過したemitしか発火しない", () => {
      const handler = vi.fn();

      const flow = createEventFlow<number>();

      const filteredFlow = flow
        .filter((num) => num % 2 === 0)
        .filter((num) => num % 3 === 0);

      //6の倍数だけ通過する
      filteredFlow.on(handler);

      flow.emit(0);
      flow.emit(2);
      flow.emit(3);
      flow.emit(6);

      expect(handler).toHaveBeenCalledWith(0);
      expect(handler).not.toHaveBeenCalledWith(2);
      expect(handler).not.toHaveBeenCalledWith(3);
      expect(handler).toHaveBeenCalledWith(6);
    });

    test("型を絞り込むことができる", () => {
      const handler = vi.fn<[string], void>();

      const flow = createEventFlow<number | string>();
      const stringGuard = (numOrStr: number | string): numOrStr is string =>
        typeof numOrStr === "string";
      const filteredFlow = flow.filter<string>(stringGuard);

      filteredFlow.on((numOrStr) => handler(numOrStr));
      flow.emit(0);

      expect(handler).not.toHaveBeenCalledWith(0);
    });
  });

  describe("map()", () => {
    describe("functions test", () => {
      testOnFunc(createEventFlow(), (source) => source.map((value) => value));
      testOnceFunc(createEventFlow(), (source) => source.map((value) => value));
      testOffFunc(createEventFlow(), (source) => source.map((value) => value));
      testOffAllFunc(createEventFlow(), (source) =>
        source.map((value) => value)
      );
      testOffAllInBranchFunc(createEventFlow(), (source) =>
        source.map((value) => value)
      );
    });

    test("元のflowに影響を与えない", () => {
      const handler = vi.fn();

      const flow = createEventFlow<number>();
      flow.map((value) => value);

      flow.on(handler);
      flow.emit(0);

      expect(handler).toHaveBeenCalledWith(0);
    });

    test("変換された値を受け取れる", () => {
      const handler = vi.fn();

      const numberFlow = createEventFlow<number>();
      const stringFlow = numberFlow.map((value) => String(value));

      stringFlow.on(handler);
      numberFlow.emit(0);

      expect(handler).toHaveBeenCalledWith("0");
    });
  });

  describe("tap()", () => {
    describe("functions test", () => {
      testOnFunc(createEventFlow(), (source) => source.tap({}));
      testOnceFunc(createEventFlow(), (source) => source.tap({}));
      testOffFunc(createEventFlow(), (source) => source.tap({}));
      testOffAllFunc(createEventFlow(), (source) => source.tap({}));
      testOffAllInBranchFunc(createEventFlow(), (source) => source.tap({}));
    });

    test("元のflowに影響を与えない", () => {
      const handler = vi.fn();

      const flow = createEventFlow<number>();
      flow.map((value) => value);

      flow.on(handler);
      flow.emit(0);

      expect(handler).toHaveBeenCalledWith(0);
    });

    test("preとpostが呼ばれる", () => {
      const handler = vi.fn();
      const pre = vi.fn();
      const post = vi.fn();

      const flow = createEventFlow<number>().tap({ pre, post });

      flow.on(handler);
      flow.emit(0);

      expect(handler).toHaveBeenCalledWith(0);
      expect(pre).toHaveBeenCalledWith(0);
      expect(post).toHaveBeenCalledWith(0);
    });
  });

  describe("wait()", () => {
    vi.useFakeTimers();

    test("emitされるとresolve", async () => {
      const flow = createEventFlow<number>();

      const promise = flow.wait();
      flow.emit(0);
      await expect(promise).resolves.toBe(0);
    });

    test("引数で指定された時間が経過するとreject", async () => {
      const flow = createEventFlow<number>();

      const promise = flow.wait(1000);

      vi.runAllTimers();
      flow.emit(0);

      await expect(promise).rejects.toThrowError("timeout");
    });

    test("引数を指定しない場合はタイムアウトしない", async () => {
      const flow = createEventFlow<number>();

      const promise = flow.wait();

      vi.runAllTimers();
      flow.emit(0);

      await expect(promise).resolves.toBe(0);
    });
  });

  const testOnFunc = (
    sourceFlow: IEventFlow<number>,
    createBranchFlow: (source: IEventFlow<number>) => IEventFlowHandler<number>
  ) => {
    test("on()", () => {
      const branchFlow = createBranchFlow(sourceFlow);
      const handlers = [vi.fn(), vi.fn()] as const;

      branchFlow.on(handlers[0]);
      branchFlow.on(handlers[1]);

      sourceFlow.emit(0);
      sourceFlow.emit(2);

      expect(handlers[0]).toHaveBeenCalledWith(0);
      expect(handlers[1]).toHaveBeenCalledWith(0);

      expect(handlers[0]).toHaveBeenCalledWith(2);
      expect(handlers[1]).toHaveBeenCalledWith(2);

      expect(handlers[0]).toHaveBeenCalledTimes(2);
      expect(handlers[1]).toHaveBeenCalledTimes(2);
    });
  };

  const testOnceFunc = (
    sourceFlow: IEventFlow<number>,
    createBranchFlow: (source: IEventFlow<number>) => IEventFlowHandler<number>
  ) => {
    test("once()", () => {
      const branchFlow = createBranchFlow(sourceFlow);
      const handler = vi.fn();

      branchFlow.once(handler);

      sourceFlow.emit(0);
      sourceFlow.emit(1);

      expect(handler).toBeCalledTimes(1);
    });
  };

  const testOffFunc = (
    sourceFlow: IEventFlow<number>,
    createBranchFlow: (source: IEventFlow<number>) => IEventFlowHandler<number>
  ) => {
    test("off()", () => {
      const branchFlow = createBranchFlow(sourceFlow);
      const handler = vi.fn();

      branchFlow.on(handler);
      branchFlow.off(handler);

      branchFlow.on(handler).off();

      sourceFlow.emit(0);
      expect(handler).not.toBeCalled();
    });
  };

  const testOffAllFunc = (
    sourceFlow: IEventFlow<number>,
    createBranchFlow: (source: IEventFlow<number>) => IEventFlowHandler<number>
  ) => {
    test("offAll()", () => {
      const branchFlow = createBranchFlow(sourceFlow);
      const handlers = [vi.fn(), vi.fn(), vi.fn()] as const;

      branchFlow.on(handlers[0]);
      branchFlow.on(handlers[1]);
      sourceFlow.on(handlers[2]);

      branchFlow.offAll();

      sourceFlow.emit(0);
      expect(handlers[0]).not.toBeCalled();
      expect(handlers[1]).not.toBeCalled();
      expect(handlers[2]).not.toBeCalled();
    });
  };

  const testOffAllInBranchFunc = (
    sourceFlow: IEventFlow<number>,
    createBranchFlow: (source: IEventFlow<number>) => IEventFlowHandler<number>
  ) => {
    test("offAllInBranch()", () => {
      const branchFlow = createBranchFlow(sourceFlow);
      const handlers = [vi.fn(), vi.fn(), vi.fn()] as const;
      branchFlow.on(handlers[0]);
      branchFlow.on(handlers[1]);
      sourceFlow.on(handlers[2]);

      branchFlow.offAllInBranch();

      sourceFlow.emit(0);

      expect(handlers[0]).not.toBeCalled();
      expect(handlers[1]).not.toBeCalled();
      expect(handlers[2]).toBeCalled();
    });
  };
});
