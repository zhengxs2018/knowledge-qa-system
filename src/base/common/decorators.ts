import getDecorators from 'inversify-inject-decorators';

import { GlobalContainer } from './instantiation/instantiation';

const legacyCJSToESM = () =>
  typeof getDecorators === 'function'
    ? getDecorators(GlobalContainer)
    : // @ts-expect-error inversify-inject-decorators is not ESM compatible
      getDecorators.default(GlobalContainer);

// see https://github.com/inversify/InversifyJS/blob/master/wiki/circular_dependencies.md
export const { lazyInject } = legacyCJSToESM();

/* eslint-disable @typescript-eslint/ban-types */
export function memoize(
  _target: unknown,
  key: string,
  descriptor: PropertyDescriptor,
) {
  let fnKey: string | null = null;
  let fn: Function | null = null;

  if (typeof descriptor.value === 'function') {
    fnKey = 'value';
    fn = descriptor.value;

    if (fn!.length !== 0) {
      console.warn(
        'Memoize should only be used in functions with zero parameters',
      );
    }
  } else if (typeof descriptor.get === 'function') {
    fnKey = 'get';
    fn = descriptor.get;
  }

  if (!fn) {
    throw new Error('not supported');
  }

  const memoizeKey = `$memoize$${key}`;
  // @ts-expect-error fix this type
  descriptor[fnKey!] = function (...args: any[]) {
    if (!this.hasOwnProperty(memoizeKey)) {
      Object.defineProperty(this, memoizeKey, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: fn.apply(this, args),
      });
    }

    // @ts-expect-error fix this type
    return this[memoizeKey];
  };
}
