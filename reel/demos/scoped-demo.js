import * as dodo from '@3sln/dodo';
import styleFactory, { css } from '@3sln/bones/style';

const userSettings = { dodo };
const { scoped } = styleFactory(userSettings);

export default driver => {
  const { reconcile, h1, p, div, style } = dodo;

  driver.panel('Demo', (container, signal) => {
    const demoSheet = css`
      h1 {
        color: green;
        border-bottom: 2px solid green;
      }
      p {
        color: green;
        font-style: italic;
      }
    `;

    const app = div(
      style(`
        h1 { color: red; }
        p { color: red; }
      `),
      h1('Outside Scoped DOM'),
      p('This text is styled by the document.'),
      scoped(
        { styleSheets: [demoSheet] },
        div(
          h1('Inside Scoped DOM'),
          p('This text is styled independently by the adopted stylesheet.')
        )
      )
    );

    reconcile(container, [app]);

    signal.addEventListener('abort', () => {
      reconcile(container, null);
    });
  });

  driver.setActivePanel('Demo');
};