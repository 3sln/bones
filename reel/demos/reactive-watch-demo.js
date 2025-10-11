import * as dodo from '@3sln/dodo';
import reactiveFactory from '@3sln/bones/reactive';

const userSettings = { dodo };
const { watch, ObservableSubject } = reactiveFactory(userSettings);

export default driver => {
  const { reconcile, h1, p, div, button } = dodo;

  driver.panel('Demo', (container, signal) => {
    const counter$ = new ObservableSubject(0);

    const app = div(
      h1('Counter Example'),
      watch(counter$, count => p(`Current count: ${count}`)),
      div(
          button({ $styling: { marginRight: '1em' } }, 'Increment').on({
              click: () => counter$.next(counter$.value + 1),
          }),
          button('Decrement').on({
              click: () => counter$.next(counter$.value - 1),
          })
      )
    );

    reconcile(container, [app]);

    signal.addEventListener('abort', () => {
      reconcile(container, null);
      counter$.complete();
    });
  });

  driver.setActivePanel('Demo');
};