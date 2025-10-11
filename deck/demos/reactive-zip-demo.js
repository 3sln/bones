import * as dodo from '@3sln/dodo';
import reactiveFactory from '@3sln/bones/reactive.js';

const userSettings = { dodo };
const { watch, zip } = reactiveFactory(userSettings);

export default driver => {
  const { reconcile, h1, p, div } = dodo;

  const firstName$ = driver.property('First Name', { defaultValue: 'John' });
  const lastName$ = driver.property('Last Name', { defaultValue: 'Doe' });

  const fullName$ = zip(
    (firstName, lastName) => `${firstName} ${lastName}`,
    firstName$,
    lastName$
  );

  driver.panel('Demo', (container, signal) => {
    const app = div(
      h1('Zip Example'),
      p('The two properties below are combined into a single observable using `zip`.'),
      watch(fullName$, fullName => p(`Full Name: ${fullName}`))
    );

    reconcile(container, [app]);

    signal.addEventListener('abort', () => {
      reconcile(container, null);
    });
  });

  driver.setActivePanel('Demo');
};
