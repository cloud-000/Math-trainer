class CTimer {
    #startTime
    #pauseTime = 0
    #pauseStart;
    #paused = false
    #started = false
    #currentTime = 0
    constructor() {}
    reset() {
        this.#pauseTime = 0
        this.#startTime = Date.now()
    }
    start() {
        this.reset()
        this.#started = true
    }
    pause() {
        if (this.#paused) {
            return
        }
        this.#currentTime = Date.now()
        this.#paused = true
        this.#pauseStart = Date.now()
    }
    unpause() {
        if (this.#paused) {
            this.#paused = false
            this.#pauseTime += Date.now() - this.#pauseStart
        }
    }
    stop() {
        if (!this.#paused) {
            this.#currentTime = Date.now()
        }
        this.#started = false
    }
    get time() {
        if (!this.#paused && this.#started) {
            this.#currentTime = Date.now()
        }
        return this.#currentTime - this.#startTime - this.#pauseTime
    }
}