// Window
export const WINDOW_WIDTH = 800
export const WINDOW_HEIGHT = 600

// Serial
export const BAUD_RATE = 57600
export const SERIAL_DELIMITER = '\r\n'
export const SERIAL_RETRY_INTERVAL_MS = 3000

// Leaderboard
export const LEADERBOARD_FILENAME = 'leaderboard.csv'
export const LEADERBOARD_LIMIT_DEFAULT = 8

// Pin limits
export const MAX_PINS = 8
export const VIRTUAL_MISS_PIN = -1
export const KB_SYNTHETIC_PEAK = 9999

// Per-pin: noise tolerance (Arduino setting)
export const NOISE_DEFAULT = 5
export const NOISE_MIN = 0
export const NOISE_MAX = 200
export const NOISE_STEP = 5

// Per-pin: score points
export const SCORE_POINTS_DEFAULT = 1
export const SCORE_POINTS_MIN = 1

// Hit window (sent to Arduino; first hit wins, then ignore for this duration)
export const HIT_WINDOW_DEFAULT = 1000
export const HIT_WINDOW_MIN = 200
export const HIT_WINDOW_SLIDER_MAX = 2000
export const HIT_WINDOW_STEP = 50

// Flash duration
export const FLASH_DURATION_DEFAULT = 500
export const FLASH_DURATION_MIN = 100
export const FLASH_DURATION_MAX = 1500
export const FLASH_DURATION_STEP = 10

// Hit limit (game length)
export const HIT_LIMIT_DEFAULT = 5

// Round mechanic
export const COUNTDOWN_DURATION_S = 3

// Language
export const LANGUAGE_DEFAULT = 'ru'
