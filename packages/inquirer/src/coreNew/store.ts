export type Store<TValue> = {
  get: (key: string) => Promise<TValue | undefined>;
  set: (key: string, value: TValue) => Promise<void>;
  delete: (key: string) => Promise<void>;
};

export const createInMemoryStore = <TValue>(): Store<TValue> => {
  const store = new Map<string, TValue>();

  return {
    get: async (key) => store.get(key),
    set: async (key, value) => {
      store.set(key, value);
    },
    delete: async (key) => {
      store.delete(key);
    },
  };
};
