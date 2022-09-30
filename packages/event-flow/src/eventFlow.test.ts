import { beforeEach, describe, expect, test, vi } from "vitest";

import { createEventFlow } from "./eventFlow";

import type { IEventFlow, IEventFlowEmitter, IEventFlowHandler } from "./types";

describe("utils/eventFlow", () => {
  const createOnTestCase =
    (
      testFlow: IEventFlowHandler<number>,
      emitFlow: IEventFlowEmitter<number>
    ) =>
    () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      testFlow.on(handler1);
      testFlow.on(handler2);
      testFlow.on(handler3);

      const emitValue = 0;
      const emitValue2 = 2;
      emitFlow.emit(emitValue);
      emitFlow.emit(emitValue2);

      expect(handler1).toHaveBeenCalledWith(emitValue);
      expect(handler2).toHaveBeenCalledWith(emitValue);
      expect(handler3).toHaveBeenCalledWith(emitValue);

      expect(handler1).toHaveBeenCalledWith(emitValue2);
      expect(handler2).toHaveBeenCalledWith(emitValue2);
      expect(handler3).toHaveBeenCalledWith(emitValue2);

      expect(handler1).toHaveBeenCalledTimes(2);
      expect(handler2).toHaveBeenCalledTimes(2);
      expect(handler3).toHaveBeenCalledTimes(2);
    };

  const createOnceTestCase =
    (
      testFlow: IEventFlowHandler<number>,
      emitFlow: IEventFlowEmitter<number>
    ) =>
    () => {
      const handler = vi.fn();

      testFlow.once(handler);

      emitFlow.emit(0);
      emitFlow.emit(1);
      expect(handler).toBeCalledTimes(1);
    };

  const createOffTestCase =
    (
      testFlow: IEventFlowHandler<number>,
      emitFlow: IEventFlowEmitter<number>
    ) =>
    () => {
      const handler = vi.fn();

      testFlow.on(handler);
      testFlow.off(handler);

      testFlow.on(handler).off();

      emitFlow.emit(0);
      expect(handler).not.toBeCalled();
    };

  const createOffAllTestCase =
    (testFlow: IEventFlowHandler<number>, sourceFlow: IEventFlow<number>) =>
    () => {
      const handler = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      testFlow.on(handler);
      testFlow.on(handler2);
      sourceFlow.on(handler3);
      testFlow.offAll();

      sourceFlow.emit(0);
      expect(handler).not.toBeCalled();
      expect(handler2).not.toBeCalled();
      expect(handler3).not.toBeCalled();
    };

  const createOffAllInBranchTestCase =
    (testFlow: IEventFlowHandler<number>, sourceFlow: IEventFlow<number>) =>
    () => {
      const handler = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      testFlow.on(handler);
      testFlow.on(handler2);
      sourceFlow.on(handler3);
      testFlow.offAllInBranch();

      sourceFlow.emit(0);
      expect(handler).not.toBeCalled();
      expect(handler2).not.toBeCalled();
      expect(handler3).toBeCalled();
    };

  describe("createEventFlow()", () => {
    describe("functions test", () => {
      let flow: IEventFlow<number> = createEventFlow<number>();
      beforeEach(() => {
        flow = createEventFlow<number>();
      });

      test.each([
        ["on()", () => createOnTestCase(flow, flow)],
        ["once()", () => createOnceTestCase(flow, flow)],
        ["off()", () => createOffTestCase(flow, flow)],
        [
          "offAll()",
          () =>
            createOffAllTestCase(
              flow.filter(() => true),
              flow
            ),
        ],
        [
          "offAllInBranch()",
          () =>
            createOffAllInBranchTestCase(
              flow.filter(() => true),
              flow
            ),
        ],
      ])("%s", (_, testCase) => {
        testCase()();
      });
    });
  });

  describe("filter()", () => {
    describe("functions test", () => {
      let sourceFlow: IEventFlow<number> = createEventFlow<number>();
      let flow: IEventFlowHandler<number> = sourceFlow
        .filter(() => true)
        .filter(() => true);
      beforeEach(() => {
        sourceFlow = createEventFlow<number>();
        flow = sourceFlow.filter(() => true);
      });

      test.each([
        ["on()", () => createOnTestCase(flow, sourceFlow)],
        ["once()", () => createOnceTestCase(flow, sourceFlow)],
        ["off()", () => createOffTestCase(flow, sourceFlow)],
        ["offAll()", () => createOffAllTestCase(flow, sourceFlow)],
        [
          "offAllInBranch()",
          () => createOffAllInBranchTestCase(flow, sourceFlow),
        ],
      ])("%s", (_, testCase) => {
        testCase()();
      });
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
      let sourceFlow: IEventFlow<number> = createEventFlow<number>();
      let flow: IEventFlowHandler<number> = sourceFlow.map((value) => value);
      beforeEach(() => {
        sourceFlow = createEventFlow<number>();
        flow = sourceFlow.map((value) => value);
      });

      test.each([
        ["on()", () => createOnTestCase(flow, sourceFlow)],
        ["once()", () => createOnceTestCase(flow, sourceFlow)],
        ["off()", () => createOffTestCase(flow, sourceFlow)],
        ["offAll()", () => createOffAllTestCase(flow, sourceFlow)],
        [
          "offAllInBranch()",
          () => createOffAllInBranchTestCase(flow, sourceFlow),
        ],
      ])("%s", (_, testCase) => {
        testCase()();
      });
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
      let sourceFlow: IEventFlow<number> = createEventFlow<number>();
      let flow: IEventFlowHandler<number> = sourceFlow.tap({});
      beforeEach(() => {
        sourceFlow = createEventFlow<number>();
        flow = sourceFlow.tap({});
      });

      test.each([
        ["on()", () => createOnTestCase(flow, sourceFlow)],
        ["once()", () => createOnceTestCase(flow, sourceFlow)],
        ["off()", () => createOffTestCase(flow, sourceFlow)],
        ["offAll()", () => createOffAllTestCase(flow, sourceFlow)],
        [
          "offAllInBranch()",
          () => createOffAllInBranchTestCase(flow, sourceFlow),
        ],
      ])("%s", (_, testCase) => {
        testCase()();
      });
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
});
