import {settings as s} from './settings.js';
import {mapGetter} from './util.js';

const BONES_ANIMATE_API = Symbol('bones-animate-api');

export default function factory(userSettings) {
  if (userSettings?.[BONES_ANIMATE_API]) {
    return userSettings[BONES_ANIMATE_API];
  }

  const {dodo} = s(userSettings);
  const {special, reconcile, schedule, settings} = dodo;
  const {mapGet} = settings;
  const STATE_KEY = Symbol('bones-animate-presence');

  const getConfig = mapGetter(mapGet, 'spawn', 'despawn', 'mode');
  const getAnimationProps = mapGetter(mapGet, 'classes', 'styling', 'animation', 'fn', 'duration');

  async function runAnimation(element, config) {
    if (!config || !element) return;

    const {classes, styling, animation, fn, duration} = getAnimationProps(config);

    const promises = [];
    if (fn) promises.push(fn(element));

    if (animation) {
      let anim;
      if (typeof animation === 'string') {
        anim = element.animate({animation}, {duration: duration ?? 1000});
      } else {
        anim = element.animate(animation.keyframes, animation.options);
      }
      promises.push(anim.finished);
    }

    if (classes || styling) {
      const transitionPromise = new Promise(resolve => {
        const onEnd = e => {
          if (e.target === element) {
            element.removeEventListener('transitionend', onEnd);
            element.removeEventListener('animationend', onEnd);
            resolve();
          }
        };
        element.addEventListener('transitionend', onEnd);
        element.addEventListener('animationend', onEnd);
      });
      promises.push(transitionPromise);

      schedule(() => {
        if (classes) element.classList.add(...classes);
        if (styling) Object.assign(element.style, styling);
      });
    }

    await Promise.all(promises);
  }

  function presence(config) {
    return special({
      attach(element) {
        element[STATE_KEY] = {
          state: 'despawned',
          config: getConfig(config),
        };
        element.style.display = config.display ?? 'block';
      },

      update(element, [isPresenting, builder], oldArgs) {
        const state = element[STATE_KEY];
        const wasPresenting = oldArgs?.[0];

        if (isPresenting && !wasPresenting) {
          this.spawn(element, builder);
        } else if (!isPresenting && wasPresenting) {
          this.despawn(element, builder);
        }
      },

      async spawn(element, builder) {
        element.style.display = config.display ?? 'block';

        const state = element[STATE_KEY];
        state.state = 'spawning';

        reconcile(element, [builder(state.state)]);

        await runAnimation(element, state.config.spawn);

        state.state = 'spawned';
        reconcile(element, [builder(state.state)]);
      },

      async despawn(element, builder) {
        const state = element[STATE_KEY];
        state.state = 'despawning';

        await runAnimation(element, state.config.despawn);

        state.state = 'despawned';
        if (state.config.mode === 'remove') {
          element.style.display = 'none';
          reconcile(element, []);
        } else {
          element.style.display = 'none';
          reconcile(element, [builder(state.state)]);
        }
      },

      detach(element) {
        delete element[STATE_KEY];
      },
    });
  }

  const api = {presence};
  if (userSettings) userSettings[BONES_ANIMATE_API] = api;
  return api;
}
