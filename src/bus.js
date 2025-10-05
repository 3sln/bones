import { settings as s } from './settings.js';
import { normalizeObserver } from './util.js';

const BONES_BUS_API = Symbol('bones-bus-api');

export default function factory(userSettings) {
    if (userSettings?.[BONES_BUS_API]) {
        return userSettings[BONES_BUS_API];
    }

    const { dodo } = s(userSettings);
    const { special } = dodo;

    const bus = new WeakMap();

    class ObservableSubject {
        #subscribers = new Set();
        value = undefined;

        constructor(initialValue) {
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

        subscribe(observerOrNext) {
            const observer = normalizeObserver(observerOrNext);
            this.#subscribers.add(observer);
            
            // Immediately send the current value to the new subscriber.
            if (this.value !== undefined) {
                observer.next?.(this.value);
            }
            
            return {
                unsubscribe: () => {
                    this.#subscribers.delete(observer);
                }
            };
        }
    }

    function fromGlobalKey(key, initialValue) {
        if (!bus.has(key)) {
            bus.set(key, new ObservableSubject(initialValue));
        }
        return bus.get(key);
    }

    const publish = special({
        update(domNode, [to, data]) {
            if (to && to.next) {
                to.next(data);
            }
        }
    });

    const api = { fromGlobalKey, publish, ObservableSubject };
    if (userSettings) userSettings[BONES_BUS_API] = api;
    return api;
}