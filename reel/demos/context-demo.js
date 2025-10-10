import * as dodo from '@3sln/dodo';
import contextFactory from '@3sln/bones/context';
import observableFactory from '@3sln/bones/observable';

const userSettings = { dodo };
const { withContext, useContext } = contextFactory(userSettings);
const { watch } = observableFactory(userSettings);

export default driver => {
  const { reconcile, p, div } = dodo;

  const color$ = driver.property('Color', { defaultValue: 'purple' });

  driver.panel('Demo', (container, signal) => {

    const app = watch(color$, color =>
      withContext(
        { color: color },
        div(
          p('This text is inside the provider. The color ', color, ' is available to all children.'),
          useContext(['color'], ({ color }) =>
            p(
              { $styling: { color, fontWeight: 'bold' } },
              `This text is consuming the color: ${color}`,
            ),
          ),
        ),
      ),
    );

    reconcile(container, [app]);

    signal.addEventListener('abort', () => {
      reconcile(container, null);
    });
  });

  driver.setActivePanel('Demo');
};
