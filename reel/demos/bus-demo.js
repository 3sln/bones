import * as dodo from '@3sln/dodo';
import busFactory from '@3sln/bones/bus';
import observableFactory from '@3sln/bones/observable';

const userSettings = { dodo };
const { fromGlobalKey, publish } = busFactory(userSettings);
const { watch } = observableFactory(userSettings);

export default driver => {
  const { reconcile, h1, h2, p, div, button, input } = dodo;

  // 1. Create a bus from a global key
  const GREETING_BUS = Symbol('greeting-bus');
  const greeting$ = fromGlobalKey(GREETING_BUS, 'Hello');

  // 2. A component that publishes to the bus
  const Publisher = () => {
    let currentMessage = greeting$.value;
    return div(
      { $styling: { border: '1px solid blue', padding: '1em', marginBottom: '1em' } },
      h2('Publisher'),
      p('This component sends messages to the bus.'),
      input({ type: 'text', value: currentMessage }).on({
        input: e => (currentMessage = e.target.value),
      }),
      button('Send').on({ click: () => greeting$.next(currentMessage) })
    );
  };

  // 3. A component that subscribes to the bus
  const Subscriber = () => div(
    { $styling: { border: '1px solid green', padding: '1em' } },
    h2('Subscriber'),
    p('This component receives messages from the bus.'),
    watch(greeting$, message => p(`Received: ${message}`))
  );

  driver.panel('Demo', (container, signal) => {
    const app = div(
      h1('Bus Example'),
      p('The two components below are not directly related, but they can communicate using a shared bus.'),
      Publisher(),
      Subscriber()
    );

    reconcile(container, [app]);

    signal.addEventListener('abort', () => {
      reconcile(container, null);
    });
  });

  driver.setActivePanel('Demo');
};
