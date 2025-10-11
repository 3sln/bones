import * as dodo from '@3sln/dodo';
import resizeFactory from '@3sln/bones/resize.js';
import reactiveFactory from '@3sln/bones/reactive.js';

const userSettings = { dodo };
const { withContainerSize } = resizeFactory(userSettings);
const { watch } = reactiveFactory(userSettings);

export default driver => {
  const { reconcile, h1, p, div } = dodo;

  driver.panel('Demo', (container, signal) => {
    const app = div(
      { $styling: { resize: 'both', overflow: 'auto', border: '1px solid #ccc', padding: '1em' } },
      h1('Resize Me'),
      p('Drag the handle in the bottom-right corner of this box to resize it.'),
      withContainerSize(size$ =>
        watch(size$, size => {
          if (!size) return p('Initializing...');
          return p(`Current size: ${Math.round(size.width)}px by ${Math.round(size.height)}px`);
        })
      )
    );

    reconcile(container, [app]);

    signal.addEventListener('abort', () => {
      reconcile(container, null);
    });
  });

  driver.setActivePanel('Demo');
};
