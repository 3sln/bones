import { settings as s } from './settings.js';
import { mapGetter } from './util.js';

const BONES_ANIMATE_API = Symbol('bones-animate-api');

export default function factory(userSettings) {
    if (userSettings?.[BONES_ANIMATE_API]) {
        return userSettings[BONES_ANIMATE_API];
    }

    const { dodo } = s(userSettings);
    const { special, reconcile, schedule, settings } = dodo;
    const { mapGet } = settings;
    const STATE_KEY = Symbol('bones-animate-presence');

    const getConfig = mapGetter(mapGet, 'spawn', 'despawn', 'mode');
    const getAnimationProps = mapGetter(mapGet, 'classes', 'styling', 'animation', 'fn', 'duration');

    async function runAnimation(element, config) {
        if (!config || !element) return;

        const { classes, styling, animation, fn, duration } = getAnimationProps(config);

        const promises = [];
        if (fn) promises.push(fn(element));

        if (animation) {
            let anim;
            if (typeof animation === 'string') {
                anim = element.animate({ animation }, { duration: duration ?? 1000 });
            } else {
                anim = element.animate(animation.keyframes, animation.options);
            }
            promises.push(anim.finished);
        }

        if (classes || styling) {
            const transitionPromise = new Promise(resolve => {
                const onEnd = (e) => {
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
                    lastBuilder: null,
                };
            },

            update(element, [builder]) {
                const state = element[STATE_KEY];
                const isPresenting = builder != null;
                const wasPresenting = state.lastBuilder != null;
                state.lastBuilder = builder;

                if (isPresenting && !wasPresenting) {
                    this.spawn(element);
                } else if (!isPresenting && wasPresenting) {
                    this.despawn(element);
                }
            },

            async spawn(element) {
                const state = element[STATE_KEY];
                state.state = 'spawning';
                
                reconcile(element, state.lastBuilder(state.state));
                const child = element.firstElementChild;

                await runAnimation(child, state.config.spawn);

                state.state = 'spawned';
                reconcile(element, state.lastBuilder(state.state));
            },

            async despawn(element) {
                const state = element[STATE_KEY];
                state.state = 'despawning';
                const child = element.firstElementChild;

                await runAnimation(child, state.config.despawn);

                state.state = 'despawned';
                if (state.config.mode === 'remove') {
                    reconcile(element, null);
                } else {
                    if(child) child.style.display = 'none';
                }
            },

            detach(element) {
                delete element[STATE_KEY];
            }
        });
    }

    const api = { presence };
    if (userSettings) userSettings[BONES_ANIMATE_API] = api;
    return api;
}
