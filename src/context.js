import {settings as s} from './settings.js';
import reactiveFactory from './reactive.js';

const BONES_CONTEXT_API = Symbol('bones-context-api');

export default function contextFactory(userSettings) {
  if (userSettings?.[BONES_CONTEXT_API]) {
    return userSettings[BONES_CONTEXT_API];
  }

  const {dodo} = s(userSettings);
  const {special, reconcile, settings} = dodo;
  const {mapGet, mapMerge, newMap, mapPut, shouldUpdate} = settings;
  const {zip, watch, ObservableSubject} = reactiveFactory(userSettings);

  const ENCAPSULATED_CONTEXT_KEY = Symbol('bones-encapsulated-context');
  const DECAPSULATED_CONTEXT_KEY = Symbol('bones-decapsulated-context');

  class ContextContainer {
    #parent = null;
    #ownData = {};
    #parentSubscription = null;
    subject = new ObservableSubject({});

    constructor(domNode, initialData = {}, encapsulated = false) {
      this.#ownData = initialData;
      const parentKey = encapsulated ? ENCAPSULATED_CONTEXT_KEY : DECAPSULATED_CONTEXT_KEY;
      const shouldBreach = !encapsulated;
      this.#parent = findParentContext(domNode.parentElement, parentKey, shouldBreach);
      if (this.#parent) {
        this.#parentSubscription = this.#parent.subscribe({next: () => this.update(this.#ownData)});
      }
      this.update(initialData);
    }

    update(newData) {
      this.#ownData = newData;
      const parentData = this.#parent ? this.#parent.subject.value : {};
      this.subject.next(mapMerge(parentData, this.#ownData));
    }

    subscribe(observer) {
      return this.subject.subscribe(observer);
    }

    destroy() {
      this.#parentSubscription?.unsubscribe();
      this.subject.complete();
    }
  }

  function findParentContext(startNode, key, breachShadow) {
    let current = startNode;
    while (current) {
      if (current[key]) {
        return current[key];
      }
      current = breachShadow
        ? current.parentElement || current.getRootNode?.().host
        : current.parentElement;
    }
    return null;
  }

  function attachContext(domNode, contextData, encapsulated = false) {
    const key = encapsulated ? ENCAPSULATED_CONTEXT_KEY : DECAPSULATED_CONTEXT_KEY;
    if (!domNode[key]) {
      domNode[key] = new ContextContainer(domNode, contextData, encapsulated);
    }
  }

  function updateContext(domNode, newContextData, encapsulated = false) {
    const key = encapsulated ? ENCAPSULATED_CONTEXT_KEY : DECAPSULATED_CONTEXT_KEY;
    if (domNode[key]) {
      domNode[key].update(newContextData);
    }
  }

  function detachContext(domNode, encapsulated = false) {
    const key = encapsulated ? ENCAPSULATED_CONTEXT_KEY : DECAPSULATED_CONTEXT_KEY;
    if (domNode[key]) {
      domNode[key].destroy();
      delete domNode[key];
    }
  }

  const withContext = special({
    update(domNode, [newContextData, ...children], oldArgs) {
      if (!oldArgs) {
        attachContext(domNode, newContextData, false);
      } else if (shouldUpdate(newContextData, oldArgs[0])) {
        updateContext(domNode, newContextData, false);
      }
      reconcile(domNode, children);
    },
    detach(domNode) {
      detachContext(domNode, false);
      reconcile(domNode, null);
    },
  });

  const withEncapsulatedContext = special({
    update(domNode, [newContextData, ...children], oldArgs) {
      if (!oldArgs) {
        attachContext(domNode, newContextData, true);
      } else if (shouldUpdate(newContextData, oldArgs[0])) {
        updateContext(domNode, newContextData, true);
      }
      reconcile(domNode, children);
    },
    detach(domNode) {
      detachContext(domNode, true);
      reconcile(domNode, null);
    },
  });

  const useContext = special({
    update(element, [keys, builder]) {
      const encapsulated = findParentContext(element, ENCAPSULATED_CONTEXT_KEY, false);
      const decapsulated = findParentContext(element, DECAPSULATED_CONTEXT_KEY, true);

      const obs = zip((d, e) => mapMerge(d, e), decapsulated?.subject, encapsulated?.subject);

      const content = watch(obs, data => {
        let relevantData = newMap();
        for (const key of keys) {
          relevantData = mapPut(relevantData, key, mapGet(data, key));
        }
        return builder(relevantData);
      });

      reconcile(element, [content]);
    },
    detach(element) {
      reconcile(element, null);
    },
  });

  const api = {
    withContext,
    useContext,
    withEncapsulatedContext,
    attachContext,
    updateContext,
    detachContext,
  };
  if (userSettings) userSettings[BONES_CONTEXT_API] = api;
  return api;
}
