import { settings as s } from './settings.js';

const BONES_MEMO_API = Symbol('bones-memo-api');

export default function factory(userSettings) {
    if (userSettings?.[BONES_MEMO_API]) {
        return userSettings[BONES_MEMO_API];
    }

    const { dodo } = s(userSettings);
    const { special, reconcile, settings } = dodo;
    const { shouldUpdate } = settings;
    const STATE_KEY = Symbol('bones-memo');

    const memo = special({
        attach(element) {
            element[STATE_KEY] = {
                lastDeps: null,
                lastResult: null,
            };
        },

        update(element, [deps, builder]) {
            const state = element[STATE_KEY];

            if (!state.lastDeps || shouldUpdate(deps, state.lastDeps)) {
                state.lastDeps = deps;
                state.lastResult = builder(...deps);
            }
            
            reconcile(element, state.lastResult);
        },

        detach(element) {
            reconcile(element, null);
            delete element[STATE_KEY];
        }
    });

    const api = { memo };
    if (userSettings) userSettings[BONES_MEMO_API] = api;
    return api;
}