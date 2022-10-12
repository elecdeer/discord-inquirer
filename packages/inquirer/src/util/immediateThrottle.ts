export const immediateThrottle = (fn: () => void) => {
  let isPending = false;

  return () => {
    if (isPending) {
      return;
    }
    isPending = true;
    setImmediate(() => {
      fn();
      isPending = false;
    });
  };
};
