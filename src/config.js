import boom from "../sounds/boom.wav";
import clap from "../sounds/clap.wav";
import hi_hat from "../sounds/hi_hat.wav";
import kick from "../sounds/kick.wav";
import open_hat from "../sounds/open_hat.wav";
import ride from "../sounds/ride.wav";
import snare from "../sounds/snare.wav";
import tink from "../sounds/tink.wav";
import tom from "../sounds/tom.wav";

export const key_config = [
    { id: "boom", key: "a", sound: boom },
    { id: "clap", key: "s", sound: clap },
    { id: "hi_hat", key: "d", sound: hi_hat },
    { id: "kick", key: "f", sound: kick },
    { id: "open_hat", key: "g", sound: open_hat },
    { id: "ride", key: "h", sound: ride },
    { id: "snare", key: "j", sound: snare },
    { id: "tim", key: "k", sound: tink },
    { id: "tom", key: "l", sound: tom },
];

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
