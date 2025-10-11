import * as dodo from '@3sln/dodo';
import reactiveFactory from '@3sln/bones/reactive.js';

const userSettings = { dodo };
const { watch, pipe, map, dedup } = reactiveFactory(userSettings);

export default driver => {
  const { reconcile, h1, p, div } = dodo;

  const number$ = driver.property('Number', { type: 'range', min: 0, max: 10, defaultValue: 0 });

  const color$ = pipe(
    number$,
    map(n => (n % 2 === 0 ? 'blue' : 'red')),
    dedup()
  );

  driver.panel('Demo', (container, signal) => {
    const app = div(
      h1('Pipe, Map, and Dedup Example'),
      p('A numeric property is transformed by a pipeline. The color only changes when the number goes from even to odd, or vice-versa.'),
      watch(number$, num => p(`Current number: ${num}`)),
      watch(color$, color => p({ $styling: { color, fontWeight: 'bold' } }, `The number is ${color === 'blue' ? 'even' : 'odd'}.`))
    );

    reconcile(container, [app]);

    signal.addEventListener('abort', () => {
      reconcile(container, null);
    });
  });

  driver.setActivePanel('Demo');
};
