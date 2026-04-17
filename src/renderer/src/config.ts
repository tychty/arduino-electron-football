// Pin limits
export const MAX_PINS = 8
export const VIRTUAL_MISS_PIN = -1
export const KB_SYNTHETIC_PEAK = 9999

// Per-pin: debounce (Arduino setting)
export const DEBOUNCE_DEFAULT = 200
export const DEBOUNCE_MIN = 100
export const DEBOUNCE_MAX = 500
export const DEBOUNCE_STEP = 10

// Per-pin: noise tolerance (Arduino setting)
export const NOISE_DEFAULT = 5
export const NOISE_MIN = 0
export const NOISE_MAX = 10
export const NOISE_STEP = 1

// Per-pin: score points
export const SCORE_POINTS_DEFAULT = 1
export const SCORE_POINTS_MIN = 1

// Hit debounce window (hardware hits)
export const HIT_DEBOUNCE_DEFAULT = 300
export const HIT_DEBOUNCE_MIN = 10
export const HIT_DEBOUNCE_MAX = 1000
export const HIT_DEBOUNCE_STEP = 10

// Keyboard debounce window
export const KB_DEBOUNCE_DEFAULT = 500
export const KB_DEBOUNCE_MIN = 200
export const KB_DEBOUNCE_MAX = 1500
export const KB_DEBOUNCE_STEP = 10

// Flash duration
export const FLASH_DURATION_DEFAULT = 350
export const FLASH_DURATION_MIN = 100
export const FLASH_DURATION_MAX = 1500
export const FLASH_DURATION_STEP = 10

// Hit limit (game length)
export const HIT_LIMIT_DEFAULT = 5
