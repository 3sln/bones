import * as dodo from '@3sln/dodo';
import memoFactory from '@3sln/bones/memo';
import observableFactory from '@3sln/bones/observable';

const userSettings = { dodo };
const { memo } = memoFactory(userSettings);
const { watch, zip } = observableFactory(userSettings);

let expensiveRenderCount = 0;

const ExpensiveComponent = (text) => {
  expensiveRenderCount++;
  // Simulate some work
  let i = 0;
  while(i < 1000000) { i++; }
  return dodo.p(`Expensive component rendered with text: "${text}". (Render count: ${expensiveRenderCount})`);
};

export default driver => {
  const { reconcile, h1, p, div } = dodo;

  const relevantProp$ = driver.property('Relevant Prop', { defaultValue: 'Hello' });
  const irrelevantProp$ = driver.property('Irrelevant Prop', { defaultValue: 'World' });

  driver.panel('Demo', (container, signal) => {
    const app = watch(
      zip((relevant, irrelevant) => ({ relevant, irrelevant }), relevantProp$, irrelevantProp$),
      ({ relevant, irrelevant }) => {
        return div(
          h1('Memo Example'),
          p(`This is the parent component. Irrelevant prop: "${irrelevant}"`),
          memo([relevant], (text) => ExpensiveComponent(text))
        );
      }
    );

    reconcile(container, [app]);

    signal.addEventListener('abort', () => {
      reconcile(container, null);
    });
  });

  driver.setActivePanel('Demo');
};
