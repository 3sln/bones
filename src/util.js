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
