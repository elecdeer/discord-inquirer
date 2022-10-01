export type Awaitable<T> = Promise<T> | T;

export type Handler<T> = (value: T) => Awaitable<void>;
export type Filter<T> = (value: T) => boolean;
export type TypeGuardFilter<T, U extends T> = (value: T) => value is U;
export type Mapper<T, U> = (value: T) => U;

export type HookReturn<T> = {
  /**
   * 登録されたhandler
   */
  handler: Handler<T>;

  /**
   * handlerをoffする
   */
  off: () => void;
};

export interface IEventFlowEmitter<T> {
  /**
   * 登録されたhandlerを呼び出す
   * 呼び出しは同期的に順に行われる
   *
   * @param value
   */
  emit(value: T): void;
}

export interface IEventFlowHandler<T> {
  /**
   * 子EventFlowを生成する
   * この方法で生成されたEventFlowはoffAllが伝播する
   *
   * @returns eventFlow
   */
  createBranchNode: <U>() => IEventFlow<U>;

  /**
   * handlerを登録する
   * 同じhandlerは登録されない
   * @param handler
   */
  on(handler: Handler<T>): HookReturn<T>;

  /**
   * 1度のみ呼ばれるhandlerを登録する
   * 同じhandlerは登録されない
   * @param handler
   */
  once(handler: Handler<T>): HookReturn<T>;

  /**
   * 次にemitされた値を持ったPromiseを返す
   */
  wait(): Promise<T>;

  /**
   * handlerを削除する
   * @param handler
   */
  off(handler: Handler<T>): void;

  /**
   * 接続するEventFlowの全てのhandlerを削除する
   */
  offAll(): void;

  /**
   * このeventFlow以下の全てのhandlerを削除する
   */
  offAllInBranch(): void;

  /**
   * filterを通過したemitのみを受け取るEventFlowを作成する
   * @param filters
   */
  filter(...filters: Filter<T>[]): IEventFlowHandler<T>;

  filter<U extends T = T>(
    ...filters: TypeGuardFilter<T, U>[]
  ): IEventFlowHandler<U>;

  /**
   * 変換された値をhandlerで受け取るEventFlowを作成する
   * @param mapper
   */
  map<U>(mapper: Mapper<T, U>): IEventFlowHandler<U>;

  /**
   * handler全体が呼ばれる前と後に関数呼び出しを挟むEventFlowを作成する
   * @param param
   */
  tap(param: {
    pre?: (value: T) => void;
    post?: (value: T) => void;
  }): IEventFlow<T>;
}

export interface IEventFlow<T>
  extends IEventFlowEmitter<T>,
    IEventFlowHandler<T> {}
