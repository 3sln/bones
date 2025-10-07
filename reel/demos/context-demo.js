import * as dodo from '@3sln/dodo';
import contextFactory from '@3sln/bones/context';
import observableFactory from '@3sln/bones/observable';

const { h, reconcile, p, button, div } = dodo;

// Create a single settings object to share with all factories
const userSettings = { dodo };

const { withContext, useContext } = contextFactory(userSettings);
const { zip, watch } = observableFactory(userSettings);

// reel:ignore:start
// --- HMR State ---
const state = import.meta.hot?.data.state || {};
let driver = import.meta.hot?.data.driver || null;

if (import.meta.hot) {
    import.meta.hot.dispose(data => {
        data.state = state;
        data.driver = driver;
    });

    import.meta.hot.accept(newModule => {
        if (newModule.default && driver) {
            console.log('Self-accepting HMR for context-demo');
            newModule.default(driver);
        }
    });
}
// reel:ignore:end

export default function demo(d) {
    driver = d; // Capture the driver
    const { dom, property } = driver;

    state.color$ ??= property('Color', { type: 'text', defaultValue: 'blue' });
    state.fontSize$ ??= property('Font Size', { type: 'range', min: 12, max: 32, defaultValue: 16 });
    state.content$ ??= property('Content', { type: 'text', defaultValue: 'This text is consuming the context.' });

    const context$ = zip(
        (color, fontSize, content) => ({ color, fontSize, content }),
        state.color$,
        state.fontSize$,
        state.content$
    );

    const app = watch(context$, context => 
        withContext(context, 
            div(
                p('This text is inside the provider.'),
                useContext(['color', 'fontSize', 'content'], ({ color, fontSize, content }) => 
                    p({ $styling: { color, 'font-size': `${fontSize}px` } }, content)
                )
            )
        )
    );

    reconcile(dom, [app]);
}
