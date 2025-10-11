import { settings as s } from './settings.js';
import reactiveFactory from './reactive.js';

const BONES_RESIZE_API = Symbol('bones-resize-api');
const WITH_CONTAINER_SIZE_STATE = Symbol('bones-with-container-size-state');

function findObservableElement(element) {
    let current = element;
    while (current) {
        if (window.getComputedStyle(current).display !== 'contents') {
            return current;
        }
        if (current.parentElement) {
            current = current.parentElement;
        } else {
            const root = current.getRootNode();
            current = root instanceof ShadowRoot ? root.host : null;
        }
    }
    return null;
}

export default function factory(userSettings) {
    if (userSettings?.[BONES_RESIZE_API]) {
        return userSettings[BONES_RESIZE_API];
    }

    const { dodo } = s(userSettings);
    const { special, reconcile } = dodo;
    const { ObservableSubject } = reactiveFactory(userSettings);

    const withContainerSize = special({
        attach(element) {
            const state = {
                observer: null,
                size$: new ObservableSubject(null),
            };
            element[WITH_CONTAINER_SIZE_STATE] = state;

            const container = findObservableElement(element);
            if (container) {
                const rect = container.getBoundingClientRect();
                state.size$.next({ width: rect.width, height: rect.height });

                state.observer = new ResizeObserver(entries => {
                    const { width, height } = entries[0].contentRect;
                    state.size$.next({ width, height });
                });
                state.observer.observe(container);
            }
        },

        update(element, [builder]) {
            const state = element[WITH_CONTAINER_SIZE_STATE];
            const content = builder(state.size$);
            reconcile(element, [content]);
        },

        detach(element) {
            const state = element[WITH_CONTAINER_SIZE_STATE];
            state.observer?.disconnect();
            state.size$.complete();
            reconcile(element, null);
            delete element[WITH_CONTAINER_SIZE_STATE];
        }
    });

    const api = { withContainerSize };
    if (userSettings) userSettings[BONES_RESIZE_API] = api;
    return api;
}
