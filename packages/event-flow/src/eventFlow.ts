import type {
  Filter,
  Handler,
  HookReturn,
  IEventFlow,
  IEventFlowHandler,
  Mapper,
} from "./types";

export const createEventFlow = <
  THandlerParam = void
>(): IEventFlow<THandlerParam> => {
  return createEventFlowSource<THandlerParam>();
};

const createEventFlowSource = <T>(): IEventFlow<T> => {
  const handlers: Set<Handler<T>> = new Set();
  const branchFlows: IEventFlowHandler<unknown>[] = [];

  const createBranchNode = <T>(): IEventFlow<T> => {
    const branchFlow: IEventFlow<T> = {
      ...createEventFlowSource<T>(),
      offAll() {
        //sourceのを削除
        //源流までリフトアップされ、そこからoffAllInBranchで全て削除される
        methods.offAll();
      },
    };

    branchFlows.push(branchFlow as IEventFlowHandler<unknown>);
    return branchFlow;
  };

  const methods = {
    createBranchNode,
    emit(value: T): void {
      handlers.forEach((handler) => void handler(value));
    },
    on(handler: Handler<T>): HookReturn<T> {
      handlers.add(handler);
      return {
        handler,
        off: () => {
          methods.off(handler);
        },
      };
    },
    once(handler: Handler<T>): HookReturn<T> {
      const onceHandler = (value: T) => {
        void handler(value);
        methods.off(onceHandler);
      };
      return methods.on(onceHandler);
    },
    wait(): Promise<T> {
      return new Promise((resolve) => {
        methods.once(resolve);
      });
    },
    off(handler: Handler<T>): void {
      handlers.delete(handler);
    },
    offAll(): void {
      this.offAllInBranch();
    },
    offAllInBranch(): void {
      handlers.clear();
      branchFlows.forEach((branchFlow) => {
        branchFlow.offAllInBranch();
      });
    },
    filter(...filters: Filter<T>[]): IEventFlowHandler<T> {
      const branch = createBranchNode<T>();
      this.on((value: T) => {
        if (filters.some((filter) => !filter(value))) return;
        branch.emit(value);
      });

      return branch;
    },
    map<U>(mapper: Mapper<T, U>): IEventFlowHandler<U> {
      const branch = createBranchNode<U>();
      this.on((value: T) => {
        branch.emit(mapper(value));
      });

      return branch;
    },
    tap(param: {
      pre?: (value: T) => void;
      post?: (value: T) => void;
    }): IEventFlow<T> {
      const branch = createBranchNode<T>();
      this.on((value: T) => {
        branch.emit(value);
      });

      return {
        ...branch,
        emit(value: T) {
          param.pre?.(value);
          branch.emit(value);
          param.post?.(value);
        },
      };
    },
  };

  return methods;
};
