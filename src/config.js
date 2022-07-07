/**
 * Generate test beat with padding for history and upcoming keys
 * @param {number} padding_count (Will be padded equally at the end and start)
 * @returns {string[]} array of beats (keys)
 */
export const generateTestBeat = (padding_count) => {
    const test_keys = ["a", "s", "d", "f", "g"];
    const generated_array = [];
    for (let index = 0; index < 10; index++) {
        generated_array.push(...test_keys);
    }
    const array_padding = Array(padding_count).fill("");

    return [...array_padding, ...generated_array, ...array_padding];
};
