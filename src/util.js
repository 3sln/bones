/**
 * Creates a reusable function to extract specific properties from a map-like object.
 * This utility is highly optimized to avoid allocations by reusing a single object for its return value.
 * The returned object should be immediately destructured and not held onto.
 */
export function mapGetter(mapGet, ...keys) {
    const result = {};

    return (map) => {
        for (const key of keys) {
            result[key] = mapGet(map, key);
        }
        return result;
    };
}

/**
 * Normalizes an observer argument, allowing subscribe methods to accept
 * either a function (for the `next` handler) or a full observer object.
 */
export function normalizeObserver(observerOrNext) {
    if (typeof observerOrNext === 'function') {
        return { next: observerOrNext };
    }
    return observerOrNext || {};
}
