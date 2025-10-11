export function moduleState(meta) {
  if (!meta.hot) {
    const once = fn => fn();
    const pub = thing => thing;
    const factory = fn => fn;
    const $accept = () => {};
    return {once, pub, factory, $accept};
  }

  const data = meta.hot.data;
  if (!data.bonesState) {
    data.bonesState = {
      pubCache: [],
      onceCache: [],
      factoryRefs: [],
      factoryState: new WeakMap(),
    };
  }
  const {pubCache, onceCache, factoryRefs, factoryState} = data.bonesState;
  let pubCounter = 0;
  let onceCounter = 0;
  let factoryCounter = 0;

  const lazyUpdater = proxy => {
    if (factoryState.has(proxy)) {
      const state = factoryState.get(proxy);
      const newFactoryFn = factoryRefs[state.factoryId].current;
      if (state.lastVersion !== newFactoryFn) {
        state.controller.abort();
        const newController = new AbortController();
        const hmrContext = {signal: newController.signal};
        const newResult = newFactoryFn.apply(hmrContext, state.args);
        state.resultRef.current = newResult;
        state.lastVersion = newFactoryFn;
        state.controller = newController;
      }
    }
  };

  const pubHandler = {
    get: (target, prop, receiver) => Reflect.get(target.current, prop, receiver),
    set: (target, prop, value, receiver) => Reflect.set(target.current, prop, value, receiver),
    apply: (target, thisArg, args) => Reflect.apply(target.current, thisArg, args),
    construct: (target, args, newTarget) => Reflect.construct(target.current, args, newTarget),
    defineProperty: (target, prop, descriptor) =>
      Reflect.defineProperty(target.current, prop, descriptor),
    deleteProperty: (target, prop) => Reflect.deleteProperty(target.current, prop),
    getPrototypeOf: target => Reflect.getPrototypeOf(target.current),
    setPrototypeOf: (target, proto) => Reflect.setPrototypeOf(target.current, proto),
    has: (target, prop) => Reflect.has(target.current, prop),
    isExtensible: target => Reflect.isExtensible(target.current),
    ownKeys: target => Reflect.ownKeys(target.current),
    preventExtensions: target => Reflect.preventExtensions(target.current),
  };

  const factoryHandler = {
    get(target, prop, receiver) {
      lazyUpdater(receiver);
      return Reflect.get(target.current, prop, receiver);
    },
    set(target, prop, value, receiver) {
      lazyUpdater(receiver);
      return Reflect.set(target.current, prop, value, receiver);
    },
    apply(target, thisArg, args) {
      lazyUpdater(thisArg);
      return Reflect.apply(target.current, thisArg, args);
    },
    construct(target, args, newTarget) {
      lazyUpdater(newTarget);
      return Reflect.construct(target.current, args, newTarget);
    },
    defineProperty(target, prop, descriptor) {
      lazyUpdater(target);
      return Reflect.defineProperty(target.current, prop, descriptor);
    },
    deleteProperty(target, prop) {
      lazyUpdater(target);
      return Reflect.deleteProperty(target.current, prop);
    },
    getPrototypeOf(target) {
      lazyUpdater(target);
      return Reflect.getPrototypeOf(target.current);
    },
    setPrototypeOf(target, proto) {
      lazyUpdater(target);
      return Reflect.setPrototypeOf(target.current, proto);
    },
    has(target, prop) {
      lazyUpdater(target);
      return Reflect.has(target.current, prop);
    },
    isExtensible(target) {
      lazyUpdater(target);
      return Reflect.isExtensible(target.current);
    },
    ownKeys(target) {
      lazyUpdater(target);
      return Reflect.ownKeys(target.current);
    },
    preventExtensions(target) {
      lazyUpdater(target);
      return Reflect.preventExtensions(target.current);
    },
  };

  const pub = thing => {
    if ((typeof thing !== 'object' || thing === null) && typeof thing !== 'function') {
      throw new Error('Published items must be an object or a function.');
    }

    const pubId = pubCounter++;
    let cacheEntry = pubCache[pubId];

    if (cacheEntry) {
      cacheEntry.ref.current = thing;
      return cacheEntry.proxy;
    }

    const ref = {current: thing};
    const proxy = new Proxy(ref, pubHandler);
    pubCache[pubId] = {proxy, ref};
    return proxy;
  };

  const once = fn => {
    const onceId = onceCounter++;
    if (onceId in onceCache) {
      return onceCache[onceId];
    }
    const result = fn();
    onceCache[onceId] = result;
    return result;
  };

  const factory = factoryFn => {
    if (typeof factoryFn !== 'function') {
      throw new Error('Factory must be a function.');
    }

    const factoryId = factoryCounter++;
    factoryRefs[factoryId] = factoryRefs[factoryId] || {current: factoryFn};
    factoryRefs[factoryId].current = factoryFn;

    return (...args) => {
      const controller = new AbortController();
      const hmrContext = {signal: controller.signal};
      const result = factoryFn.apply(hmrContext, args);
      const resultRef = {current: result};
      const proxy = new Proxy(resultRef, factoryHandler);

      factoryState.set(proxy, {args, resultRef, controller, factoryId, lastVersion: factoryFn});

      return proxy;
    };
  };

  return {pub, once, factory};
}
