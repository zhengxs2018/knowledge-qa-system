import { createSingleCallFunction } from './functional';

export interface IDisposable {
  dispose(): void;
}

export namespace Disposable {
  export const None = Object.freeze({
    dispose() {
      // pass
    },
  });
}

/**
 * Turn a function that implements dispose into an {@link IDisposable}.
 *
 * @param fn - Clean up function, guaranteed to be called only **once**.
 */
export function toDisposable(fn: () => void): IDisposable {
  const self = {
    dispose: createSingleCallFunction(() => {
      fn();
    }),
  };
  return self;
}
