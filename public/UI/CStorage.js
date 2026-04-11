class CStorage {
    static #storage = {}
    static #identifer = new URL(window.location.href).origin
    static init() {
        if (localStorage.getItem(this.#identifer) === null) {
            this.#update()
        } else {
            this.#storage = JSON.parse(localStorage.getItem(this.#identifer))
        }
    }
    static clear() {
        this.#storage = {}
        this.#update()
    }
    static setItem(key, value) {
        this.#storage[key] = value
        this.#update()
    }
    static removeItem(key) {
        delete this.#storage[key]
        this.#update()
    }
    static getItem(key) {
        return this.#storage[key]
    }
    static getAll() {return this.#storage}
    static #update() {
        localStorage.setItem(this.#identifer, JSON.stringify(this.#storage))
    }
    static async asyncMemoize(name, callback) {
        if (this.getItem(name) !== undefined) {
            return this.getItem(name)
        }

        this.setItem(name, await callback.apply(null))
        return this.getItem(name)
    }
}