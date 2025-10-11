import {settings as s} from './settings.js';
import reactiveFactory from './reactive.js';
import {mapGetter} from './util.js';

const BONES_VISIBILITY_API = Symbol('bones-visibility-api');
const STATE_KEY = Symbol('bones-with-visibility-state');

export default function factory(userSettings) {
  if (userSettings?.[BONES_VISIBILITY_API]) {
    return userSettings[BONES_VISIBILITY_API];
  }

  const {dodo} = s(userSettings);
  const {special, reconcile} = dodo;
  const {ObservableSubject} = reactiveFactory(userSettings);

  const getOptions = mapGetter(dodo.settings.mapGet, 'root', 'display');

  const withVisibility = special({
    attach(element) {
      element[STATE_KEY] = {
        observer: null,
        isVisible$: new ObservableSubject(false),
        display: null,
        rootSelector: undefined,
      };
    },

    update(element, [builder, options]) {
      const state = element[STATE_KEY];
      const {root: newRootSelector, display: newDisplay} = getOptions(options || {});

      const display = newDisplay ?? 'block';
      if (state.display !== display) {
        state.display = display;
        element.style.display = display;
      }

      // If the root selector changes, we need a new observer.
      if (state.observer === null || state.rootSelector !== newRootSelector) {
        state.observer?.disconnect();

        const root = newRootSelector ? element.closest(newRootSelector) : null;
        state.observer = new IntersectionObserver(
          ([entry]) => {
            state.isVisible$.next(entry.isIntersecting);
          },
          {root},
        );

        state.observer.observe(element);
        state.rootSelector = newRootSelector;
      }

      const content = builder(state.isVisible$);
      reconcile(element, [content]);
    },

    detach(element) {
      const state = element[STATE_KEY];
      if (state) {
        state.observer?.disconnect();
        state.isVisible$.complete();
        reconcile(element, null);
        delete element[STATE_KEY];
      }
    },
  });

  const api = {withVisibility};
  if (userSettings) userSettings[BONES_VISIBILITY_API] = api;
  return api;
}
