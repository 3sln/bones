import * as dodo from '@3sln/dodo';
import contextFactory from '@3sln/bones/context.js';
import observableFactory from '@3sln/bones/observable.js';

const { h, reconcile, p, button, div } = dodo;

// Create a single settings object to share with all factories
const userSettings = { dodo };

const { withContext, useContext } = contextFactory(userSettings);
const { watch } = observableFactory(userSettings);

export default function demo(driver) {
    const { dom, property } = driver;

    const color$ = property('Color', { type: 'text', defaultValue: 'blue' });

    const app = watch(color$, color => 
        withContext({ color }, 
            div(
                p('This text is inside the provider. Test hot reload'),
                useContext(['color'], ({ color }) => 
                    p({ $styling: { color } }, `This text is consuming the color: ${color}`)
                )
            )
        )
    );

    reconcile(dom, [app]);
}
