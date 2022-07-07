import boom from "./sounds/boom.wav";
import clap from "./sounds/clap.wav";
import hi_hat from "./sounds/hi_hat.wav";
import kick from "./sounds/kick.wav";
import open_hat from "./sounds/open_hat.wav";
import ride from "./sounds/ride.wav";
import snare from "./sounds/snare.wav";
import tink from "./sounds/tink.wav";
import tom from "./sounds/tom.wav";
import { generateTestBeat } from "./src/config";

/**
 * Initial key config
 */
let key_config = [
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

// Default key config that doesnt change for reset to default functionality.
const default_key_config = key_config;

/**
 * List of valid app modes
 * - Game - scores + can progress in test beats
 * - Record - record keys
 * - Settings - changing settings
 * - None
 */
const MODE = Object.freeze({
    game: "game",
    record: "record",
    settings: "settings",
    none: "",
});

// Global app mode
let app_mode = MODE.none;

const PADDING_COUNT = 3;

// Current score
let score = 0;

// Current target key index
let current_index = 0;

/**
 * Recording functionality. Generally stores in this format:
 * { key_id: key id, time: milisecond time format }
 */
let record_array = [];

/**
 * This holds the recording callback function that will be invoked during
 * key press.
 */
let keyRecordingCallback;

/**
 * Hold the time when the recording started.
 */
let start_time;

/**
 * Gets duration from recording start. We use Date.now() for better accuracy
 * since setInterval timer depends on JS engine ticks and can get
 * delayed.
 * @returns {number} duration from start (miliseconds)
 */
const getActualTimeFromStart = () => {
    return Date.now() - start_time;
};

/**
 * Gets the actual position taking into consideration the
 * added padding count.
 * @returns {number} actual_index
 */
const getActualPosition = () => current_index + PADDING_COUNT;

/**
 * Sample beat generated with regards to padding count.
 */
const target_keys = generateTestBeat(PADDING_COUNT);

/**
 * Recording functionality toggling.
 */
const record_btn = document.getElementById("record");
record_btn.addEventListener("click", () => {
    if (app_mode === MODE.record) {
        app_mode = MODE.none;
        keyRecordingCallback = null;
        record_btn.textContent = "Record";
    } else if (app_mode === MODE.none) {
        record_array = [];
        start_time = Date.now();
        app_mode = MODE.record;
        keyRecordingCallback = (id) => {
            record_array.push({
                key_id: id,
                time: getActualTimeFromStart(),
            });
        };
        record_btn.textContent = "Stop";
    }
});

/**
 * Playback related functionality. This is a very simple way to implement payblack functionality.
 * We simply loop through the whole music array with a fixed interval.
 * This is one way to do it, there are other ways. The objective is to introduce setInterval.
 */
// Current position in the recorded array
let playback_index = 0;
// Current playback time used to track the time
let current_playback_time = 0;
// Interval id is stored here to stop the interval when conditions are fulfilled
let playback_interval_id;
// Playback interval granularity
const playback_interval = 10;

const playback_btn = document.getElementById("playback");
playback_btn.addEventListener("click", () => {
    if (app_mode || record_array.length < 1) {
        return;
    }

    if (playback_interval_id) {
        clearInterval(playback_interval_id);
    }

    playback_index = 0;
    const end_time = record_array[record_array.length - 1].time;
    playback_interval_id = setInterval(() => {
        if (current_playback_time >= end_time && playback_index >= record_array.length) {
            clearInterval(playback_interval_id);
            playback_index = 0;
            current_playback_time = 0;
        }
        const { key_id, time } = record_array[playback_index];
        if (current_playback_time >= time) {
            document.getElementById(key_id).click();
            playback_index++;
        }
        current_playback_time += playback_interval;
    }, playback_interval);
});

const control_container = document.getElementById("controls");

/**
 * Click Key Handler
 */
const clickKeyHandler = (key, sound, id, control_div) => {
    const audio = new Audio(sound);
    audio.play();
    setTimeout(() => control_div.classList.remove("playing"), 80);
    control_div.classList.add("playing");
    if (app_mode === MODE.game) {
        checkKeys(key);
    }
    if (app_mode === MODE.record && keyRecordingCallback && typeof keyRecordingCallback === "function") {
        keyRecordingCallback(id);
    }
};

/**
 * Key down handler
 */
const keyDownHandler = (event) => {
    const target_key = key_config.find((k) => k.key === event.key);
    if (target_key) {
        const control_div = document.getElementById(target_key.id);
        control_div.classList.add("playing");
        const audio = new Audio(target_key.sound);
        audio.play();
        // Remove playing animation after 80s
        setTimeout(() => control_div.classList.remove("playing"), 80);

        if (app_mode === MODE.game) {
            checkKeys(event.key);
        }
        if (app_mode === MODE.record && keyRecordingCallback && typeof keyRecordingCallback === "function") {
            keyRecordingCallback(target_key.id);
        }
    }
};

/**
 * Key controls setup - generating elements + adding event listeners
 */
const setupKeyControls = () => {
    key_config.map(({ id, key, sound }) => {
        const control_div = document.createElement("div");
        control_div.setAttribute("id", id);
        control_div.setAttribute("class", "card control");

        const control_name = document.createElement("div");
        control_name.setAttribute("class", "label container");
        control_name.textContent = key;

        const control_key = document.createElement("div");
        control_key.setAttribute("class", "key container");
        control_key.textContent = id.replace("_", " ");

        control_div.appendChild(control_name);
        control_div.appendChild(control_key);

        /**
         * Add audio playing on clicking the card div.
         */
        control_div.addEventListener("click", () => clickKeyHandler(key, sound, id, control_div));
        control_container.appendChild(control_div);
    });

    /**
     * Add audio playing on pressing the key
     */
    document.addEventListener("keydown", keyDownHandler);
};

/**
 * Remove key controls
 */
const removeKeyControls = () => {
    control_container.innerHTML = "";
    key_config.forEach((k) => {
        document.removeEventListener("keydown", keyDownHandler);
    });
};

const start_game_btn = document.getElementById("start_game");
start_game_btn.addEventListener("click", (e) => {
    if (app_mode === MODE.game) {
        app_mode = MODE.none;
        score = 0;
        current_index = 0;
        updateTargets();
        updateScore();
        start_game_btn.textContent = "Start Game";
    } else if (app_mode === MODE.none) {
        app_mode = MODE.game;
        start_game_btn.textContent = "End Game";
    }
});

/**
 * Check for match between pressed keys and target keys
 * @param {string} pressed_keys event.key value
 */
const checkKeys = (pressed_keys) => {
    const corrected_index = getActualPosition();
    // End index is always +3 due to start padding
    const corrected_end_index = target_keys.length - PADDING_COUNT - 1;

    if (
        pressed_keys.toLocaleLowerCase() === target_keys[getActualPosition()] &&
        corrected_index < corrected_end_index
    ) {
        current_index++;
        score++;
        updateTargets();
    } else {
        score--;
    }

    if (corrected_index >= corrected_end_index) {
        alert("Game is complete!");
    }
    updateScore();
};

const sequence_container = document.getElementById("targets");

/**
 * Update the target key displays.
 */
const updateTargets = () => {
    sequence_container.innerHTML = "";
    const computed_array = target_keys.slice(current_index, getActualPosition() + 4);
    computed_array.forEach((item, index) => {
        const sequence_card = document.createElement("div");
        sequence_card.setAttribute("class", `card sequence-card ${index === 3 && "active"}`);
        sequence_card.textContent = item;
        sequence_container.appendChild(sequence_card);
    });
};

/**
 * Update the score display.
 */
const score_count = document.getElementById("score");
const updateScore = () => {
    score_count.textContent = score;
};

/**
 * Update key maps. Loop through the current input list and update the
 * key_config variable with the new key value. At the end, update the view
 * to reflect new key maps.
 */
const updateKeyMaps = () => {
    const new_keymap = key_config.map((k) => {
        const input_value = document.getElementById(`${k.id}_input`).value;
        if (input_value) {
            return {
                id: k.id,
                key: input_value,
                sound: k.sound,
            };
        }
    });

    key_config = new_keymap;
};

/**
 * Submit settings handler
 */
const submitSettingsHandler = () => {
    const main_settings_container = document.querySelector(".settings");
    const settings_container = document.querySelector(".settings-container");
    const submit_settings_btn = document.getElementById("submit-settings");
    const reset_settings_btn = document.getElementById("reset-settings");
    updateKeyMaps();
    closeSettings(main_settings_container, settings_container, submit_settings_btn, reset_settings_btn);
    setupKeyControls();
};

/**
 * Reset settings to default functionality
 */
const resetSettingsHandler = () => {
    const settings_container = document.querySelector(".settings-container");
    key_config = default_key_config;
    if (settings_container) {
        loadSettingsPageData(settings_container);
    }
};

/**
 * Settings page validation. Rules:
 * - Key must be uniquer
 * - Only one key can be assign (Solved by using HTML attributes maxLength)
 */
const validateNewKey = (event) => {
    const submit_settings_btn = document.getElementById("submit-settings");
    const error_message = document.querySelector(".error-message");
    // Check for duplicate. Make sure it is not the same position
    if (key_config.find((k) => k.key === event.target.value && event.target.id !== `${k.id}_input`)) {
        event.srcElement.classList.add("error");
        error_message.style.backgroundColor = "rgb(255, 173, 173)";
        error_message.textContent = "You have duplicate keys in your settings.";
        submit_settings_btn.setAttribute("disabled", true);
    } else {
        event.srcElement.classList.remove("error");
        error_message.style.backgroundColor = "rgb(255, 255, 255)";
        error_message.textContent = "";
        submit_settings_btn.removeAttribute("disabled");
    }
};

/**
 * Load settings page data
 */
const loadSettingsPageData = (settings_container) => {
    settings_container.innerHTML = "";
    key_config.forEach((k) => {
        const label = document.createElement("label");
        label.textContent = k.id;

        const input = document.createElement("input");
        input.setAttribute("id", `${k.id}_input`);
        input.setAttribute("maxLength", 1);
        input.value = k.key;
        input.addEventListener("input", validateNewKey);

        settings_container.appendChild(label);
        settings_container.appendChild(input);
    });
};

/**
 * Close Setting Page.
 * Remove all settings related event listeners as well.
 * @param {Element} main_settings_container
 * @param {Element} settings_container
 * @param {Element} submit_settings_btn
 */
const closeSettings = (main_settings_container, settings_container, submit_settings_btn, reset_settings_btn) => {
    app_mode = MODE.none;

    // Hide control container
    main_settings_container.classList.add("hidden");
    control_container.classList.remove("hidden");
    sequence_container.classList.remove("hidden");
    document.querySelector(".score.container").classList.remove("hidden");

    // Clear settings container
    settings_container.innerHTML = "";

    // Update Text
    settings_btn.textContent = "Settings";

    submit_settings_btn.removeEventListener("click", submitSettingsHandler);
    reset_settings_btn.removeEventListener("click", resetSettingsHandler);
};

/**
 * Settings page
 * Remove all sound related event listeners.
 */
const settings_btn = document.getElementById("settings");
settings_btn.addEventListener("click", () => {
    const main_settings_container = document.querySelector(".settings");
    const settings_container = document.querySelector(".settings-container");
    const submit_settings_btn = document.getElementById("submit-settings");
    const reset_settings_btn = document.getElementById("reset-settings");

    if (app_mode === MODE.none) {
        app_mode = MODE.settings;
        removeKeyControls(settings_container);

        // Hide main drum app elements
        main_settings_container.classList.remove("hidden");
        control_container.classList.add("hidden");
        sequence_container.classList.add("hidden");
        document.querySelector(".score.container").classList.add("hidden");

        // Show settings page
        loadSettingsPageData(settings_container);

        // Update Text
        settings_btn.textContent = "Exit Settings";

        submit_settings_btn.addEventListener("click", submitSettingsHandler);
        reset_settings_btn.addEventListener("click", resetSettingsHandler);

        // Attach event handlers
    } else if (app_mode === MODE.settings) {
        closeSettings(main_settings_container, settings_container, submit_settings_btn, reset_settings_btn);
        setupKeyControls();
    }
});

/**
 * This is the list of function that will trigger after page load.
 */
setupKeyControls();
updateTargets();
