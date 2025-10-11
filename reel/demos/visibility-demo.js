import * as dodo from '@3sln/dodo';
import visibilityFactory from '@3sln/bones/visibility';
import reactiveFactory from '@3sln/bones/reactive';

const userSettings = { dodo };
const { withVisibility } = visibilityFactory(userSettings);
const { watch } = reactiveFactory(userSettings);

export default driver => {
  const { reconcile, h1, p, div } = dodo;

  const ObserverItem = (i) => {
    return withVisibility(
      (isVisible$) => watch(isVisible$, isVisible =>
        div(
          { $styling: { 
              padding: '2em', 
              margin: '1em 0', 
              border: '1px solid #ccc', 
              transition: 'background-color 0.3s',
              backgroundColor: isVisible ? '#aeffae' : '#eee' 
            }
          },
          p(`Item ${i}. Am I visible? ${isVisible ? 'Yes' : 'No'}`)
        )
      ),
      { root: '.scroll-container' }
    );
  };

  driver.panel('Demo', (container, signal) => {
    const items = Array.from({ length: 20 }, (_, i) => ObserverItem(i + 1));

    const app = div(
      h1('withVisibility Example'),
      p('Scroll the container below. Items will change color when they enter the viewport.'),
      div(
        { 
          className: 'scroll-container',
          $styling: { height: '300px', 'overflow-y': 'scroll', border: '1px solid black', padding: '1em' }
        },
        ...items
      )
    );

    reconcile(container, [app]);

    signal.addEventListener('abort', () => {
      reconcile(container, null);
    });
  });

  driver.setActivePanel('Demo');
};
