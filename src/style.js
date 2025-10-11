import {settings as s} from './settings.js';
import {mapGetter} from './util.js';

const BONES_STYLE_API = Symbol('bones-style-api');

export function css(strings, ...values) {
  const cssText = strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText);
  return sheet;
}

export default function factory(userSettings) {
  if (userSettings?.[BONES_STYLE_API]) {
    return userSettings[BONES_STYLE_API];
  }

  const {dodo} = s(userSettings);
  const {special, reconcile, settings} = dodo;
  const {mapGet, isMap, newMap} = settings;
  const SHADOW_ROOT_KEY = Symbol('bones-shadow-root');

  const getProps = mapGetter(mapGet, 'styleSheets');

  function reconcileShadow(host, children, styleSheets = []) {
    let shadowRoot = host[SHADOW_ROOT_KEY];
    if (!shadowRoot) {
      shadowRoot = host.shadowRoot || host.attachShadow({mode: 'open'});
      host[SHADOW_ROOT_KEY] = shadowRoot;
    }

    if (styleSheets.length > 0) {
      shadowRoot.adoptedStyleSheets = styleSheets;
    }

    reconcile(shadowRoot, children);
    return shadowRoot;
  }

  const scoped = special({
    update(domNode, args) {
      const [props, children] = isMap(args[0]) ? [args[0], args.slice(1)] : [newMap(), args];
      const {styleSheets} = getProps(props);

      reconcileShadow(domNode, children, styleSheets);
    },

    detach(domNode) {
      if (domNode[SHADOW_ROOT_KEY]) delete domNode[SHADOW_ROOT_KEY];
    },
  });

  const api = {scoped, reconcileShadow};
  if (userSettings) userSettings[BONES_STYLE_API] = api;
  return api;
}
