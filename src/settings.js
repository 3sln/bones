/**
 * Merges user-provided settings with defaults.
 * This function now requires the dodo API to be passed in.
 */
export function settings(userSettings = {}) {
    if (!userSettings.dodo) {
        throw new Error('dodo API instance must be provided in settings.');
    }
    const { dodo } = userSettings;
    const { settings: dodoSettings } = dodo;

    const defaultSettings = {
        renderError: (error) => {
            const { pre, code, strong } = dodo;
            return pre({
                $styling: {
                    backgroundColor: '#fdd',
                    color: '#330',
                    padding: '1em',
                    whiteSpace: 'pre-wrap'
                }
            },
                strong('Error: ', error.message),
                '\n\n',
                code(error.stack)
            );
        },
    };

    return { ...defaultSettings, ...userSettings, ...dodoSettings };
}