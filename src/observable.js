import { settings as s } from './settings.js';
import { mapGetter, normalizeObserver } from './util.js';

const BONES_OBSERVABLE_API = Symbol('bones-observable-api');

export default function factory(userSettings) {
    if (userSettings?.[BONES_OBSERVABLE_API]) {
        return userSettings[BONES_OBSERVABLE_API];
    }

    const settings = s(userSettings);
    const { dodo, renderError } = settings;
    const { special, reconcile, schedule } = dodo;
    const { mapGet } = dodo.settings;
    const STATE_KEY = Symbol('bones-watch');

    const getOptions = mapGetter(mapGet, 'placeholder', 'error');

    function fromAsync(asyncFn) {
        return {
            subscribe: (observerOrNext) => {
                const observer = normalizeObserver(observerOrNext);
                asyncFn()
                    .then(value => {
                        observer.next?.(value);
                        observer.complete?.();
                    })
                    .catch(err => {
                        observer.error?.(err);
                    });
                return { unsubscribe: () => {} };
            }
        };
    }

    function zip(fn, ...observables) {
        return {
            subscribe: (observerOrNext) => {
                const observer = normalizeObserver(observerOrNext);
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
                        return { unsubscribe: () => {} };
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
                        }
                    });
                });

                checkAndSend(); // Initial check for non-observable inputs

                return { unsubscribe: () => subscriptions.forEach(s => s.unsubscribe()) };
            }
        };
    }

    function throttle(observable, { accumulator } = {}) {
        return {
            subscribe: (request) => {
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
                        console.error("Error in throttled observable:", err);
                    },
                    complete() {}
                });

                if (hasNewValue) {
                    request(take);
                }

                return { unsubscribe: () => sub.unsubscribe() };
            }
        };
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
            const { placeholder, error: errorBuilder } = getOptions(options);

            state.abortController?.abort();
            state.subscription?.unsubscribe();

            state.observable = observable;
            state.hasValue = false;
            state.value = undefined;
            state.error = null;
            state.abortController = new AbortController();

            if (state.observable) {
                state.subscription = state.observable.subscribe({
                    next: (value) => {
                        state.hasValue = true;
                        state.value = value;
                        state.error = null;
                        schedule(() => this.render(element, builder, placeholder, errorBuilder), { signal: state.abortController.signal });
                    },
                    error: (err) => {
                        console.error("Error in watched observable:", err);
                        state.error = err;
                        schedule(() => this.render(element, builder, placeholder, errorBuilder), { signal: state.abortController.signal });
                    }
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
            delete element[STATE_KEY];
        }
    });

    const api = { fromAsync, watch, zip, throttle };
    if (userSettings) userSettings[BONES_OBSERVABLE_API] = api;
    return api;
}
