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

const createEventFlowSource = <T>(
  sourceFlow?: IEventFlow<unknown>
): IEventFlow<T> => {
  const handlers: Set<Handler<T>> = new Set();
  const branchFlows: IEventFlowHandler<unknown>[] = [];

  return {
    createBranchNode<U>(): IEventFlow<U> {
      const branchFlow = createEventFlowSource<U>(this as IEventFlow<unknown>);
      branchFlows.push(branchFlow as IEventFlowHandler<unknown>);
      return branchFlow;
    },
    emit(value: T): void {
      handlers.forEach((handler) => void handler(value));
    },
    on(handler: Handler<T>): HookReturn<T> {
      handlers.add(handler);
      return {
        handler,
        off: () => {
          this.off(handler);
        },
      };
    },
    once(handler: Handler<T>): HookReturn<T> {
      const onceHandler = (value: T) => {
        void handler(value);
        this.off(onceHandler);
      };
      return this.on(onceHandler);
    },
    wait(timeoutMs?: number): Promise<T> {
      return new Promise((resolve, reject) => {
        this.once(resolve);

        if (timeoutMs !== undefined) {
          setTimeout(() => {
            reject(new Error("timeout"));
          }, timeoutMs);
        }
      });
    },
    off(handler: Handler<T>): void {
      handlers.delete(handler);
    },
    offAll(): void {
      if (sourceFlow !== undefined) {
        sourceFlow.offAll();
      } else {
        this.offAllInBranch();
      }
    },
    offAllInBranch(): void {
      handlers.clear();
      branchFlows.forEach((branchFlow) => {
        branchFlow.offAllInBranch();
      });
    },
    filter(...filters: Filter<T>[]): IEventFlowHandler<T> {
      const branch = this.createBranchNode<T>();
      this.on((value: T) => {
        if (filters.some((filter) => !filter(value))) return;
        branch.emit(value);
      });

      return branch;
    },
    map<U>(mapper: Mapper<T, U>): IEventFlowHandler<U> {
      const branch = this.createBranchNode<U>();
      this.on((value: T) => {
        branch.emit(mapper(value));
      });

      return branch;
    },
    tap(param: {
      pre?: (value: T) => void;
      post?: (value: T) => void;
    }): IEventFlow<T> {
      const branch = this.createBranchNode<T>();
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
};
