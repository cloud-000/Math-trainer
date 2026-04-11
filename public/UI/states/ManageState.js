class ManageState {
    #states = {}
    #curr = null
    constructor(t) {
        this.main = t;
        this.on_change = null
    }
    renameState(o, n) {
        this.#states[n] = this.#states[o]
        delete this.#states[o]
    }
    deleteState(n) {
        this.#states[n].destroy()
        if (this.#curr) {
            if (this.#curr.name === n) {
                this.#curr = null
            }
        }
        delete this.#states[n]
    }
    createState(name, state) {
        this.#states[name] = state
        state.name = name
        state.manager = this
        state.onAdd()
    }
    set state(name) {
        if (this.#curr != null) {
            this.#curr.exit()
            this.#curr = null;
        }
        if (!(name ?? null)) { return }
        this.#states[name].enter()
        this.#curr = this.#states[name]
    }
    resize() {this.#curr&&this.#curr.resize()}
    getState(name) { return this.#states[name] }
    get state() { return this.#curr }
    get states() { return Object.values(this.#states) }
}

class State{
    constructor(e){
        this.manager=e
        this.name = null
    }
    onAdd() {}
    contextmenu(e){}
    enter(){}exit(){}resize(){}
    destroy(){
        this.manager = null
    }
}
