import { settings as s } from './settings.js';
import { mapGetter } from './util.js';

const BONES_SHADOW_API = Symbol('bones-shadow-api');

export default function factory(userSettings) {
    if (userSettings?.[BONES_SHADOW_API]) {
        return userSettings[BONES_SHADOW_API];
    }

    const { dodo } = s(userSettings);
    const { special, reconcile, settings } = dodo;
    const { mapGet } = settings;
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

    function reconcileInternals(host, declarations = {}) {
        if (!host.attachInternals) {
            return null;
        }

        const internals = host._internals || (host._internals = host.attachInternals());

        for (const key in declarations) {
            const value = declarations[key];
            if (typeof internals[key] === 'function') {
                internals[key](...(Array.isArray(value) ? value : [value]));
            } else {
                internals[key] = value;
            }
        }

        return internals;
    }

    const shadow = special({
        update(domNode, args) {
            const [propsOrBuilder, builderOrNil] = args;
            const hasProps = builderOrNil !== undefined;
            
            const builder = hasProps ? builderOrNil : propsOrBuilder;
            const props = hasProps ? propsOrBuilder : {};

            const { styleSheets, internals } = getProps(props);
            
            const internalsObject = reconcileInternals(domNode, internals);
            const children = builder ? builder(internalsObject) : [];

            reconcileShadow(domNode, children, styleSheets);
        },

        detach(domNode) {
            if (domNode._internals) delete domNode._internals;
            if (domNode[SHADOW_ROOT_KEY]) delete domNode[SHADOW_ROOT_KEY];
        }
    });

    const api = { shadow, reconcileShadow, reconcileInternals };
    if (userSettings) userSettings[BONES_SHADOW_API] = api;
    return api;
}
