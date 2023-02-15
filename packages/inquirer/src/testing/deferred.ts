export class Deferred<T> {
  promise: Promise<T>;
  private _resolve: ((value: T) => void) | undefined;
  private _reject: ((reason: unknown) => void) | undefined;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  resolve(value: T) {
    this._resolve!(value);
  }

  reject(reason: unknown) {
    this._reject!(reason);
  }
}
