class SpaApp extends ManageState {
    constructor() {
        super();
        this.devRoute = "/OrzMath/public/"
        this.dev = false
        this.routes = {}
        this.element = UI.element("div", {
            "class": "expand flex cloud-ui-spa-wrapper"
        })
        this.contentElement = UI.element("div", {
            "class": "expand flex cloud-ui-spa-content-wrapper"
        })
        this.sideElements = {} // HashMap
        this.data = {}
        this.userAuthed = false
    }

    initCache() {
        let keys = CStorage.getItem(`spa-cloud-data-keys`)
        console.log(keys)
        keys?.forEach((key) => {
            this.data[key] = CStorage.getItem(`spa-cloud-${key}`) ?? null
        })
    }

    async cacheData(name, data) {
        if (data != null) {
            if (data.then) {
                data = await data
            }
            this.data[name] = data
            CStorage.setItem(`spa-cloud-${name}`, data)
            CStorage.setItem(`spa-cloud-data-keys`, Object.keys(this.data))
        }
        return data
    }

    clearCache(name) {
        delete this.data[name]
        CStorage.removeItem(`spa-cloud-${name}`)
    }

    updateCachedData(name) {return this.cacheData(name, this.data[name])}

    getCachedData(name, fallback=null) {
        return this.data[name] ?? (this.cacheData(name, fallback?.call(null)))
    }

    onUserLoaded() {
        this.states.forEach(s => s.onUserLoaded())
    }

    addTo(element) {UI.add(element, this.element)}

    addContentTo(parent) {UI.add(parent, this.contentElement)}

    setElement(element) {
        UI.add(this.contentElement, element)
    }

    init() {
        this.createState("404", new Page404(this))
        window.navigation.addEventListener("navigate", (event) => {
            if (!event.canIntercept) return
            // event.preventDefault()
            let path = new URL(event.destination.url).pathname
            console.log(`Intercepted: ${path}`)
            this.router(path)
            event.intercept({
                async handler() {

                }
            })
        })
        this.addContentTo(this.element)
    }

    /**
     * @param method
     * @param details
     * @abstract
     * @returns {Promise}
     */
    async authenticate(method, details) {return false}

    /**
     * @param method
     * @param details
     * @abstract
     * @returns {Promise}
     */
    async signup(method, details) {return false}

    createState(name, state, authRequired=false) {
        super.createState(name, state)
        this.routes[name] = {
            name: name,
            authRequired: authRequired,
        }
    }

    setRoutes(stateName, pages, authRequired=false) {
        pages.forEach((page) => {
            this.routes[page] = {
                name: stateName,
                authRequired: authRequired
            }
        })
    }

    router(path) {
        let exists = Object.hasOwn(this.routes, path)
        if (!exists && this.dev) {
            path = path.replace(this.devRoute, "")
            exists = Object.hasOwn(this.routes, path)
        }
        if (exists) {
            if (this.routes[path].authRequired && !this.userAuthed) {
                this.state = "/sign-in"
            } else {
                this.state = this.routes[path].name
            }
        } else {
            this.state = "404"
        }
    }

    refresh() {
        this.router(new URL(window.location.href).pathname)
    }

    addSideElement(name, element, parent, index=parent.children.length) {
        this.sideElements[name] = element
        element.classList.add("cloud-ui-spa-side-element")
        UI.add(parent, element, index)
    }

    getSideElement(name) {
        return this.sideElements[name]
    }

    /**
     * Sets the visibility of the specified side element
     * @param{String} name
     * @param{Boolean} shown
     */
    setSideElementVisibility(name, shown) {
        let element = this.sideElements[name]
        let isAlreadyShown =
            (element.getAttribute("cloud-ui-visible") !== "false") ||
            !element.hasAttribute("cloud-ui-visible")

        if (shown === isAlreadyShown) return
        if (shown) {
            element.removeAttribute("cloud-ui-visible")
        } else {
            element.setAttribute("cloud-ui-visible", shown.toString())
        }
    }

    updateSideElementVisibility(shown) {
        for (let key of Object.keys(this.sideElements)) {
            this.setSideElementVisibility(key, shown.includes(key))
        }
    }
}