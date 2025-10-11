import * as dodo from '@3sln/dodo';
import animateFactory from '@3sln/bones/animate.js';
import reactiveFactory from '@3sln/bones/reactive.js';

const userSettings = { dodo };
const { presence } = animateFactory(userSettings);
const { ObservableSubject, watch } = reactiveFactory(userSettings);

export default driver => {
  const { reconcile, h1, p, div, button } = dodo;

  driver.panel('Demo', (container, signal) => {
    const show$ = new ObservableSubject(true);

    const animatePresence = presence({
      spawn: {
        animation: {
            keyframes: [{ opacity: 0 }, { opacity: 1 }],
            options: { duration: 300, fill: 'forwards' },
        }
      },
      despawn: {
        animation: {
            keyframes: [{ opacity: 1 }, { opacity: 0 }],
            options: { duration: 300, fill: 'forwards' },
        }
      }
    });

    const app = div(
      h1('Animate Presence'),
      button('Toggle').on({ click: () => show$.next(!show$.value) }),
      div(
        { $styling: { marginTop: '1em', border: '1px dashed #ccc', padding: '1em' } },
        watch(show$, show =>
          animatePresence(show, state => div(p(`Element is ${state}`)))
        )
      )
    );

    reconcile(container, [app]);

    signal.addEventListener('abort', () => {
      reconcile(container, null);
      show$.complete();
    });
  });

  driver.setActivePanel('Demo');
};
