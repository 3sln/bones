import * as dodo from '@3sln/dodo';
import shadowFactory from '@3sln/bones/shadow';
import { css } from '@3sln/bones/css';

const userSettings = { dodo };
const { shadow } = shadowFactory(userSettings);

export default driver => {
  const { reconcile, h1, p, div } = dodo;

  driver.panel('Demo', (container, signal) => {
    const myStyles = css`
      h1 {
        color: darkorange;
      }
      p {
        font-family: serif;
        font-size: 1.2em;
      }
    `;

    const app = div(
      h1('CSS Utility Example'),
      shadow(
        { styleSheets: [myStyles] },
        div(
          h1('Styled by a Stylesheet'),
          p('This content is inside a Shadow DOM and is styled by an adopted stylesheet created with the `css` utility.')
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
