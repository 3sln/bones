import * as dodo from '@3sln/dodo';
import contextFactory from '@3sln/bones/context.js';
import observableFactory from '@3sln/bones/observable.js';

const { h, reconcile, p, button, div } = dodo;

// Create a single settings object to share with all factories
const userSettings = { dodo };

const { withContext, useContext } = contextFactory(userSettings);
const { watch } = observableFactory(userSettings);

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

    const app = watch(state.color$, color => 
        withContext({ color }, 
            div(
                p('This text is inside the provider.'),
                useContext(['color'], ({ color }) => 
                    p({ $styling: { color } }, `This text is consuming the color: ${color}`)
                )
            )
        )
    );

    reconcile(dom, [app]);
}
