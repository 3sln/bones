import {settings as s} from './settings.js';
import {mapGetter} from './util.js';

const BONES_REACTIVE_API = Symbol('bones-reactive-api');

export default function factory(userSettings) {
  if (userSettings?.[BONES_REACTIVE_API]) {
    return userSettings[BONES_REACTIVE_API];
  }

  const settings = s(userSettings);
  const {dodo, renderError} = settings;
  const {special, reconcile, schedule} = dodo;
  const {mapGet, shouldUpdate} = dodo.settings;
  const STATE_KEY = Symbol('bones-watch');

  class Observable {
    #subscribe;

    constructor(subscribe) {
      if (subscribe) {
        this.#subscribe = subscribe;
      }
    }

    subscribe(observerOrNext) {
      if (!this.#subscribe) {
        throw new Error('subscribe() is not implemented');
      }
      const observer =
        typeof observerOrNext === 'function' ? {next: observerOrNext} : observerOrNext;
      this.#subscribe(observer);
    }

    static fromAsync(asyncFn) {
      return new Observable(observer => {
        asyncFn()
          .then(value => {
            observer.next?.(value);
            observer.complete?.();
          })
          .catch(err => {
            observer.error?.(err);
          });
        return {unsubscribe: () => {}};
      });
    }

    static fromPromise(promise) {
      return new Observable(observer => {
        promise
          .then(value => {
            observer.next?.(value);
            observer.complete?.();
          })
          .catch(err => {
            observer.error?.(err);
          });
        return {unsubscribe: () => {}};
      });
    }
  }

  const bus = new WeakMap();

  class ObservableSubject extends Observable {
    #subscribers = new Set();
    value = undefined;

    constructor(initialValue) {
      super(observer => {
        this.#subscribers.add(observer);

        if (this.value !== undefined) {
          observer.next?.(this.value);
        }

        return {
          unsubscribe: () => {
            this.#subscribers.delete(observer);
          },
        };
      });
      this.value = initialValue;
    }

    next(value) {
      this.value = value;
      for (const observer of this.#subscribers) {
        observer.next?.(value);
      }
    }

    error(err) {
      for (const observer of this.#subscribers) {
        observer.error?.(err);
      }
    }

    complete() {
      for (const observer of this.#subscribers) {
        observer.complete?.();
      }
      this.#subscribers.clear();
    }

    static fromGlobalKey(key, initialValue) {
      if (!bus.has(key)) {
        bus.set(key, new ObservableSubject(initialValue));
      }
      return bus.get(key);
    }
  }

  const publish = special({
    update(domNode, [to, data]) {
      if (to && to.next) {
        to.next(data);
      }
    },
  });

  const getOptions = mapGetter(mapGet, 'placeholder', 'error');

  function zip(fn, ...observables) {
    return new Observable(observer => {
      const latest = new Array(observables.length);
      const hasValue = new Array(observables.length).fill(false);
      let allHaveValues = false;
      let active = observables.length;

      const checkAndSend = () => {
        if (!allHaveValues && hasValue.every(v => v)) {
          allHaveValues = true;
          observer.next?.(fn(...latest));
        }
      };

      const subscriptions = observables.map((obs, i) => {
        if (!obs || typeof obs.subscribe !== 'function') {
          latest[i] = obs;
          hasValue[i] = true;
          active--;
          return {unsubscribe: () => {}};
        }
        return obs.subscribe({
          next(value) {
            latest[i] = value;
            if (!hasValue[i]) {
              hasValue[i] = true;
            }
            if (allHaveValues) {
              observer.next?.(fn(...latest));
            } else {
              checkAndSend();
            }
          },
          error(err) {
            observer.error?.(err);
          },
          complete() {
            active--;
            if (active === 0) {
              observer.complete?.();
            }
          },
        });
      });

      checkAndSend();

      return {unsubscribe: () => subscriptions.forEach(s => s.unsubscribe())};
    });
  }

  function throttle(observable, {accumulator} = {}) {
    return new Observable(request => {
      let hasNewValue = false;
      let bufferedValue;

      const take = () => {
        hasNewValue = false;
        return bufferedValue;
      };

      const sub = observable.subscribe({
        next(value) {
          bufferedValue = accumulator && hasNewValue ? accumulator(bufferedValue, value) : value;
          if (!hasNewValue) {
            hasNewValue = true;
            request(take);
          }
        },
        error(err) {
          console.error('Error in throttled observable:', err);
        },
        complete() {},
      });

      if (hasNewValue) {
        request(take);
      }

      return {unsubscribe: () => sub.unsubscribe()};
    });
  }

  function map(fn) {
    return observable =>
      new Observable(observer => {
        return observable.subscribe({
          next: value => observer.next?.(fn(value)),
          error: err => observer.error?.(err),
          complete: () => observer.complete?.(),
        });
      });
  }

  function dedup() {
    return observable =>
      new Observable(observer => {
        let lastValue = undefined;
        let isFirst = true;
        return observable.subscribe({
          next: value => {
            if (isFirst || shouldUpdate(lastValue, value)) {
              isFirst = false;
              lastValue = value;
              observer.next?.(value);
            }
          },
          error: err => observer.error?.(err),
          complete: () => observer.complete?.(),
        });
      });
  }

  function pipe(observable, ...operators) {
    return operators.reduce((obs, op) => op(obs), observable);
  }

  const watch = special({
    attach(element) {
      element[STATE_KEY] = {
        subscription: null,
        observable: null,
        value: undefined,
        error: null,
        hasValue: false,
        abortController: null,
      };
    },

    update(element, [observable, builder, options = {}]) {
      const state = element[STATE_KEY];
      const {placeholder, error: errorBuilder} = getOptions(options);

      state.abortController?.abort();
      state.subscription?.unsubscribe();

      state.observable = observable;
      state.hasValue = false;
      state.value = undefined;
      state.error = null;
      state.abortController = new AbortController();

      if (state.observable) {
        state.subscription = state.observable.subscribe({
          next: value => {
            state.hasValue = true;
            state.value = value;
            state.error = null;
            schedule(() => this.render(element, builder, placeholder, errorBuilder), {
              signal: state.abortController.signal,
            });
          },
          error: err => {
            console.error('Error in watched observable:', err);
            state.error = err;
            schedule(() => this.render(element, builder, placeholder, errorBuilder), {
              signal: state.abortController.signal,
            });
          },
        });
      }
      if (!state.hasValue) {
        this.render(element, builder, placeholder, errorBuilder);
      }
    },

    render(element, builder, placeholder, errorBuilder) {
      const state = element[STATE_KEY];
      if (!state) return;

      if (state.error) {
        reconcile(element, [errorBuilder ? errorBuilder(state.error) : renderError(state.error)]);
      } else if (state.hasValue) {
        reconcile(element, [builder(state.value)]);
      } else if (placeholder) {
        reconcile(element, [placeholder()]);
      } else {
        reconcile(element, [builder(undefined)]);
      }
    },

    detach(element) {
      const state = element[STATE_KEY];
      if (!state) return;
      state.abortController?.abort();
      state.subscription?.unsubscribe();
      reconcile(element, null);
      delete element[STATE_KEY];
    },
  });

  const api = {
    Observable,
    ObservableSubject,
    watch,
    zip,
    throttle,
    map,
    dedup,
    pipe,
    publish,
  };
  if (userSettings) userSettings[BONES_REACTIVE_API] = api;
  return api;
}
