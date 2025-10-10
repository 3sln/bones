import * as d from '@3sln/dodo';
import observableFactory from '@3sln/bones/observable';

const o = observableFactory({dodo: d});

export default driver => {
  const color$ = driver.property('Color');

  driver.panel('Canvas', (container, signal) => {
    signal.addEventListener('abort', () => {
      d.reconcile(container, null);
    });

    d.reconcile(container, [
      o.watch(color$, color => d.div(
        {$styling: {color}},
        "Something else eee#"
      ))
    ]);
  });
};
