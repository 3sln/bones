import { settings as s } from './settings.js';
import { mapGetter } from './util.js';

const BONES_SHADOW_API = Symbol('bones-shadow-api');
const INTERNALS = Symbol('bones-element-internals');

export default function factory(userSettings) {
    if (userSettings?.[BONES_SHADOW_API]) {
        return userSettings[BONES_SHADOW_API];
    }

    const { dodo } = s(userSettings);
    const { special, reconcile, settings } = dodo;
    const { mapGet, isMap, newMap } = settings;
    const SHADOW_ROOT_KEY = Symbol('bones-shadow-root');

    const getProps = mapGetter(mapGet, 'styleSheets', 'internals');

    function reconcileShadow(host, children, styleSheets = []) {
        let shadowRoot = host[SHADOW_ROOT_KEY];
        if (!shadowRoot) {
            shadowRoot = host.shadowRoot || host.attachShadow({ mode: 'open' });
            host[SHADOW_ROOT_KEY] = shadowRoot;
        }

        if (styleSheets.length > 0) {
            shadowRoot.adoptedStyleSheets = styleSheets;
        }

        reconcile(shadowRoot, children);
        return shadowRoot;
    }

    const shadow = special({
        update(domNode, args) {
            const [props, children] = (
              isMap(args[0])
              ? [args[0], args.slice(1)]
              : [newMap(), args]
            );
            const { styleSheets, internals } = getProps(props);
            
            reconcileShadow(domNode, children, styleSheets);
        },

        detach(domNode) {
            if (domNode[SHADOW_ROOT_KEY]) delete domNode[SHADOW_ROOT_KEY];
        }
    });

    const api = { shadow, reconcileShadow };
    if (userSettings) userSettings[BONES_SHADOW_API] = api;
    return api;
}
