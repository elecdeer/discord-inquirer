import nodeObjectHash from "node-object-hash";

const hasher = nodeObjectHash({
  sort: {
    object: true,
    map: true,
    array: false,
    set: false,
  },
  coerce: false,
});

export const hash = (obj: unknown) => hasher.hash(obj);

export const isMatchHash = (a: unknown, b: unknown) => {
  if (Object.is(a, b)) return true;
  return hasher.hash(a) === hasher.hash(b);
};
